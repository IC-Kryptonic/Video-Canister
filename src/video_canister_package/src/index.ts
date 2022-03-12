import { CanisterSettings, getManagementCanister, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { getSpawnCanisterActor, getVideoCanisterActor, getManagementCanisterActor, getWalletCanisterActor, managementPrincipal } from "./common";
import { MetaInfo } from "./canisters/video_canister/video_canister.did";
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer";
import { IDL } from "@dfinity/candid";
import { Null } from "@dfinity/candid/lib/cjs/idl";

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

const creationCycles = 200_000_000_000

export async function uploadVideo(identity: Identity, walletId: Principal, video: CreationVideo, cycles: bigint): Promise<Principal>{

  if (cycles < creationCycles){
    throw Error("Not enough cycles, need at least " + creationCycles + " for video canister creation");
  }
  
  let videoPrincipal = await createNewCanister(identity, walletId, cycles);
  
  await checkController(identity, walletId, videoPrincipal);

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

async function createNewCanister(identity: Identity, wallet_id: Principal, creation_cycles: BigInt): Promise<Principal>{
  const walletActor = await getWalletCanisterActor(identity, wallet_id);

  const walletResponse = await walletActor.wallet_call({
    canister: spawnPrincipal,
    method_name: "create_new_canister",
    args: [...Buffer.from(IDL.encode([],[]))],
    cycles: creation_cycles,
  }) as {'Ok' : { 'return' : Array<number>}};

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