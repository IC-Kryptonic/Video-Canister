import { CanisterSettings, getManagementCanister, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { getSpawnCanisterActor, getVideoCanisterActor, getManagementCanisterActor, getWalletCanisterActor, managementPrincipal } from "./common";
import { ChangeOwnerResponse, MetaInfo, PutMetaInfoResponse } from "./canisters/video_canister/video_canister.did";
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer";
import { IDL } from "@dfinity/candid";
import { Null } from "@dfinity/candid/lib/cjs/idl";
import { isDeepStrictEqual } from "util";

export interface Video{
  "name": string,
  "description": string,
  "version": bigint,
  "owner": Principal,
  "videoBuffer": Buffer,
}

export interface CreationVideo{
  "name": string,
  "description": string,
  "videoBuffer": Buffer,
}

const spawnPrincipal = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); 

const creationCycles: bigint = BigInt(200_000_000_000);

const chunkSize = 1024;

export async function uploadVideo(identity: Identity, walletId: Principal, video: CreationVideo, cycles: bigint): Promise<Principal>{

  if (cycles < creationCycles){
    throw Error("Not enough cycles, need at least " + creationCycles + " for video canister creation");
  }
  
  let videoPrincipal = await createNewCanister(identity, walletId, creationCycles);
  
  await checkController(identity, walletId, videoPrincipal);

  await depositCycles(identity, walletId, videoPrincipal, cycles - creationCycles);
  
  const videoActor = await getVideoCanisterActor(identity, videoPrincipal);
  const chunkNum = Math.floor(video.videoBuffer.length / chunkSize) + 1;
  const metaResponse = await videoActor.put_meta_info({
    'name': video.name,
    'description': video.description,
    'chunk_num': chunkNum
  }) as {'success': null};
  if (!('success' in metaResponse)){
    console.error(metaResponse);
    throw Error("Could not put meta info into video canister");
  }

  for (let i = 0; i < chunkNum; i++){
    const chunkSlice = video.videoBuffer.slice(i * chunkSize, Math.min(video.videoBuffer.length, (i + 1) *chunkSize ));
    const chunkArray = Array.from(new Uint8Array(chunkSlice));
    const chunkResponse = await videoActor.put_chunk(i, chunkArray) as {'success': null};
    if (!('success' in chunkResponse)){
      console.error(chunkResponse);
      throw Error("Could not put chunk " + i + " into the video canister");
    }
  }

  //TODO Index canister

  return videoPrincipal;
}

export async function getVideo(identity: Identity, principal: Principal): Promise<Video>{
  const actor = await getVideoCanisterActor(identity, principal);
  const metaInfo = (await actor.get_meta_info()) as MetaInfo;
  
  const chunksAsPromises = [] ;
  for (let i = 0; i < metaInfo.chunk_num; i++){
    chunksAsPromises.push(actor.get_chunk(i) as Promise<number[][]>);
  }
  const chunkBuffers: Uint8Array[] = [];
  const nestedBytes = (await Promise.all(chunksAsPromises))
    .map((val: number[][]) => {
      if (val[0] === undefined) {
        return null;
      } else {
        return val[0];
      }
    })
    .filter((v) => v !== null);
  nestedBytes.forEach((bytes) => {
    const bytesAsBuffer = Buffer.from(new Uint8Array(bytes as number[]));
    chunkBuffers.push(bytesAsBuffer);
  });

  return {
    name: metaInfo.name,
    description: metaInfo.description,
    version: metaInfo.version,
    owner: metaInfo.owner,
    videoBuffer: Buffer.concat(chunkBuffers)
  }
}

export async function changeOwner(oldIdentity: Identity, oldWallet: Principal, videoPrincipal: Principal, newOwner: Principal, newOwnerWallet: Principal) {
  await changeCanisterController(oldIdentity, oldWallet, videoPrincipal, newOwnerWallet);

  await changeVideoOwner(oldIdentity, videoPrincipal, newOwner);
}

async function changeVideoOwner(oldIdentity: Identity, videoPrincipal: Principal, newOwner: Principal){
  const videoCanister = await getVideoCanisterActor(oldIdentity, videoPrincipal);

  let response = await videoCanister.change_owner(newOwner) as {'success': null};

  if (!('success' in response)){
    console.error(response);
    throw Error("Could not change owner of video canister");
  }
}

async function changeCanisterController(oldIdentity: Identity, oldWallet: Principal, videoPrincipal: Principal, newOwnerWallet: Principal){
  const walletActor = await getWalletCanisterActor(oldIdentity, oldWallet);

  const encodedArgs = IDL.encode(
    [IDL.Record({
      canister_id: IDL.Principal,
      settings: IDL.Record({
        controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
        compute_allocation: IDL.Opt(IDL.Nat),
        memory_allocation: IDL.Opt(IDL.Nat),
        freezing_threshold: IDL.Opt(IDL.Nat),
      })
    })], [{
      'canister_id': videoPrincipal,
      'settings': {
        'controllers': [[newOwnerWallet]],
        'compute_allocation': [],
        'memory_allocation': [],
        'freezing_threshold': [],
      }
    }]);

  const walletResponse = await walletActor.wallet_call({
    canister: managementPrincipal,
    method_name: "update_settings",
    args: [...Buffer.from(encodedArgs)],
    cycles: 0,
  }) as {'Ok': {'return': Array<number>}};

  if ('Ok' in walletResponse){
    const raw_response = walletResponse.Ok.return;
    IDL.decode([], Buffer.from(raw_response))[0];
  } else {
    console.error(walletResponse);
    throw Error("Wallet call failed");
  }
}

async function createNewCanister(identity: Identity, walletId: Principal, creationCycles: BigInt): Promise<Principal>{
  const walletActor = await getWalletCanisterActor(identity, walletId);

  const walletResponse = await walletActor.wallet_call({
    canister: spawnPrincipal,
    method_name: "create_new_canister",
    args: [...Buffer.from(IDL.encode([IDL.Principal],[identity.getPrincipal()]))],
    cycles: creationCycles,
  }) as {'Ok': {'return': Array<number>}};

  if ('Ok' in walletResponse){
    const raw_response = walletResponse.Ok.return;
    let response = IDL.decode([IDL.Variant({
      "created": IDL.Principal,
      "insufficient_funds": IDL.Null,
      "canister_creation_error": IDL.Null,
      "canister_installation_error": IDL.Null,
      "cahnge_controller_error": IDL.Null,
    })],
    Buffer.from(raw_response))[0] as unknown as {'created' : Principal};
    
    if ('created' in response){
      return response.created;
    } else {
      console.error(response as unknown);
      throw Error("Error creating video canister with spawn canister");
    }
  } else {
    console.error(walletResponse);
    throw Error("Error calling wallet for wallet_call");
  }
}


async function checkController(identity: Identity, wallet: Principal, video_canister: Principal){

  const walletActor = await getWalletCanisterActor(identity, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal})], [{'canister_id': video_canister}]);

  const walletResponse = await walletActor.wallet_call({
    canister: managementPrincipal,
    method_name: "canister_status",
    args: [...Buffer.from(encoded_args)],
    cycles: 0,
  }) as {'Ok' : { 'return' : Array<number>}};

  if ('Ok' in walletResponse){
    const raw_response = walletResponse.Ok.return;
    let response = IDL.decode([IDL.Record({
      settings: IDL.Record({
        controllers: IDL.Vec(IDL.Principal),
      }),
    })],
    Buffer.from(raw_response))[0] as unknown as {'settings': {
      'controllers' : [Principal]
    }};
    
    if (response.settings.controllers.length === 1 && response.settings.controllers[0].toText() === wallet.toText()){ //Wallet is controller of canister as it should be
      return;
    } else if (response.settings.controllers[0] === undefined){
      throw Error("Video Canister has no controller");
    } else {
      throw Error("Video Canister controller is not wallet, instead it is " + response.settings.controllers[0]);
    }
  } else {
    throw Error("Wallet call failed");
  }
}

async function depositCycles(identity: Identity, wallet: Principal, video_canister: Principal, cycles: bigint){
  const walletActor = await getWalletCanisterActor(identity, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal})], [{'canister_id': video_canister}]);

  const walletResponse = await walletActor.wallet_call({
    canister: managementPrincipal,
    method_name: "deposit_cycles",
    args: [...Buffer.from(encoded_args)],
    cycles: cycles,
  }) as {'Ok' : { 'return' : Array<number>}};

  if ('Ok' in walletResponse){
    const raw_response = walletResponse.Ok.return;
    let response = IDL.decode([], Buffer.from(raw_response))[0];
  } else {
    console.error(walletResponse);
    throw Error("Wallet call failed");
  }
}