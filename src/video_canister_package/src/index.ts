
import { getManagementCanister, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { getSpawnCanisterActor, getVideoCanisterActor, getManagementCanisterActor } from "./common";
import { MetaInfo } from "./canisters/video_canister/video_canister.did";
import { CreateCanisterResponse } from "./canisters/spawn_canister/spawn_canister.did";
import { config } from "process";

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

export async function uploadVideo(identity: Identity, video: CreationVideo){
  const spawnActor = await getSpawnCanisterActor(identity);

  const response = (await spawnActor.create_new_canister()) as { 'created' : Principal}; //TODO handle error

  if ('created' in response){
    const managementActor = getManagementCanisterActor(identity);
  }

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