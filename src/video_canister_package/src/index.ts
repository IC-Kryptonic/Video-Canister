import { Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";

import { MetaInfo } from "./canisters/video_canister/video_canister.did";
import { executeVideoCanisterPut, getCanisterActor, managementPrincipal } from "./common";
import { CANISTER_TYPE, CHUNK_SIZE, REQUIRED_CYCLES, SPAWN_PRINCIPAL_ID } from "./constants";
import { CanisterStatusResponse, CreateNewCanisterResponse, VideoToStore, RawWalletResponse, Video } from "./interfaces";

// TODO unsafe
const spawnPrincipal = Principal.fromText(SPAWN_PRINCIPAL_ID); 

export async function uploadVideo(identity: Identity, walletId: Principal, video: VideoToStore, cycles: bigint): Promise<Principal>{

  if (cycles < REQUIRED_CYCLES){
    throw Error("Not enough cycles, need at least " + REQUIRED_CYCLES + " for video canister creation");
  }
  
  const videoPrincipal = await createNewCanister(identity, walletId, REQUIRED_CYCLES);
  
  await checkController(identity, walletId, videoPrincipal);

  const leftoverCycles = cycles - REQUIRED_CYCLES;
  if(leftoverCycles > 0) {
    await depositCycles(identity, walletId, videoPrincipal, leftoverCycles);
  }

  const videoActor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal);
  const chunkNum = Math.floor(video.videoBuffer.length / CHUNK_SIZE) + 1;

  await executeVideoCanisterPut(
    () => videoActor.put_meta_info({
      'name': video.name,
      'description': video.description,
      'chunk_num': chunkNum
    }), 
    "Could not put meta info into video canister"
  );

  for (let i = 0; i < chunkNum; i++){
    const chunkSlice = video.videoBuffer.slice(i * CHUNK_SIZE, Math.min(video.videoBuffer.length, (i + 1) * CHUNK_SIZE ));
    const chunkArray = Array.from(chunkSlice);

    await executeVideoCanisterPut(
      () => videoActor.put_chunk(i, chunkArray),
      `Could not put chunk <${i}> into the video canister`
    );
  }

  //TODO Index canister

  return videoPrincipal;
}

export async function getVideo(identity: Identity, principal: Principal): Promise<Video>{
  const actor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, principal);
  
  try {
    const metaInfo = (await actor.get_meta_info()) as MetaInfo;
    const chunksAsPromises = [] ;
    
    for (let i = 0; i < metaInfo.chunk_num; i++){
      chunksAsPromises.push(actor.get_chunk(i) as Promise<Array<number[] | undefined[]>>);
    }

    const chunkBuffers: Uint8Array[] = [];

    const nestedBytes = (await Promise.all(chunksAsPromises))
      .map((val) => val[0] ? val[0] : null)
      .filter((v) => v !== null) as number [][];

    nestedBytes.forEach((bytes) => {
      const bytesAsBuffer = Buffer.from(new Uint8Array(bytes));
      chunkBuffers.push(bytesAsBuffer);
    });

    return {
      name: metaInfo.name,
      description: metaInfo.description,
      version: metaInfo.version,
      owner: metaInfo.owner,
      videoBuffer: Buffer.concat(chunkBuffers)
    }
  } catch(error) {
    throw new Error("Unable to query video: " + error);
  }
}

export async function changeOwner(oldIdentity: Identity, oldWallet: Principal, videoPrincipal: Principal, newOwner: Principal, newOwnerWallet: Principal) {
  await changeCanisterController(oldIdentity, oldWallet, videoPrincipal, newOwnerWallet);

  await changeVideoOwner(oldIdentity, videoPrincipal, newOwner);
}

async function changeVideoOwner(oldIdentity: Identity, videoPrincipal: Principal, newOwner: Principal){
  const videoCanister = await getCanisterActor(oldIdentity, CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal);

  await executeVideoCanisterPut(
    () => videoCanister.change_owner(newOwner),
    `Could not change owner of video canister`
  );
}

async function changeCanisterController(oldIdentity: Identity, oldWallet: Principal, videoPrincipal: Principal, newOwnerWallet: Principal){
  const walletActor = await getCanisterActor(oldIdentity, CANISTER_TYPE.WALLET_CANISTER, oldWallet);

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

  try {
    const walletResponse = await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: "update_settings",
      args: [...Buffer.from(encodedArgs)],
      cycles: 0,
    }) as CreateNewCanisterResponse;
  
    if (!('Ok' in walletResponse)){
      throw Error(walletResponse.toString());
    }
  } catch(error) {
    throw Error("Unable to change canister controller: " + error);
  }
}

async function createNewCanister(identity: Identity, walletId: Principal, creationCycles: BigInt): Promise<Principal>{
  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, walletId);

  try {
    const walletResponse = await walletActor.wallet_call({
      canister: spawnPrincipal,
      method_name: "create_new_canister",
      args: [...Buffer.from(IDL.encode([IDL.Principal],[identity.getPrincipal()]))],
      cycles: creationCycles,
    }) as RawWalletResponse;

    if ('Ok' in walletResponse){
      const encodedResponse = walletResponse.Ok.return;
      let response = IDL.decode(
        [IDL.Variant({
          "created": IDL.Principal,
          "insufficient_funds": IDL.Null,
          "canister_creation_error": IDL.Null,
          "canister_installation_error": IDL.Null,
          "change_controller_error": IDL.Null,
        })],
        Buffer.from(encodedResponse)
      )[0] as unknown as CreateNewCanisterResponse;
      
      if ('created' in response){
        return response.created;
      } else {
        throw Error(response.toString());
      }
    } else {
      throw Error(walletResponse.toString());
    }
  } catch(error) {
    throw Error("Error creating video canister with spawn canister: " + error);
  }
}


async function checkController(identity: Identity, wallet: Principal, video_canister: Principal){

  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal})], [{'canister_id': video_canister}]);

  try {
    const walletResponse = await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: "canister_status",
      args: [...Buffer.from(encoded_args)],
      cycles: 0,
    }) as RawWalletResponse;

    if ('Ok' in walletResponse){
      const raw_response = walletResponse.Ok.return;
      let response = IDL.decode([IDL.Record({
        settings: IDL.Record({
          controllers: IDL.Vec(IDL.Principal),
        }),
      })],
      Buffer.from(raw_response))[0] as unknown as CanisterStatusResponse;

      const controllers = response?.settings?.controllers || [];

      if(controllers.length === 0) {
        throw Error("Video canister has no controller");
      } else if(controllers.length > 1) {
        throw new Error("Video canister has too many controllers " + controllers);
      } else {
        const controllerIsWallet = controllers[0].toText() === wallet.toText();
        if(!controllerIsWallet) throw new Error("Video Canister controller is not wallet, instead it is " + controllers[0]);
      }
    }
  } catch(error) {
    throw new Error("Check Controller Error: " + error);
  }
}

async function depositCycles(identity: Identity, wallet: Principal, video_canister: Principal, cycles: bigint){
  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal})], [{'canister_id': video_canister}]);

  try {
    const walletResponse = await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: "deposit_cycles",
      args: [...Buffer.from(encoded_args)],
      cycles: cycles,
    }) as RawWalletResponse;

    if ('Ok' in walletResponse){
      /*
      TODO decode and check wallet response
      const encodedResponse = walletResponse.Ok.return;
      const response = IDL.decode([], Buffer.from(raw_response))[0];
      */
    } else {
      console.error(walletResponse);
      throw Error(walletResponse.toString());
    }
  } catch(error) {
    throw Error("Unable to deposit cycles " + error);
  }
}