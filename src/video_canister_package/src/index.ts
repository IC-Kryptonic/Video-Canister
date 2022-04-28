import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

import { MetaInfo } from './canisters/video_canister/video_canister.did';
import {
  changeCanisterController,
  changeVideoOwner,
  checkController,
  createNewCanister,
  depositCycles,
  executeVideoCanisterPut,
  getCanisterActor,
} from './common';
import { CANISTER_TYPE, CHUNK_SIZE, REQUIRED_CYCLES, INDEX_PRINCIPAL_ID } from './constants';
import { VideoToStore, Video } from './interfaces';

export async function uploadVideo(
  identity: Identity,
  walletId: Principal,
  video: VideoToStore,
  cycles: bigint,
  save: boolean,
): Promise<Principal> {
  if (cycles < REQUIRED_CYCLES) {
    throw Error('Not enough cycles, need at least ' + REQUIRED_CYCLES + ' for video canister creation');
  }

  const videoPrincipal = await createNewCanister(identity, walletId, REQUIRED_CYCLES);

  await checkController(identity, walletId, videoPrincipal);

  const leftoverCycles = cycles - REQUIRED_CYCLES;
  if (leftoverCycles > 0) {
    await depositCycles(identity, walletId, videoPrincipal, leftoverCycles);
  }

  const videoActor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal);

  let chunkNum = 0;
  if (video.videoBuffer.length !== 0) {
    chunkNum = Math.floor(video.videoBuffer.length / CHUNK_SIZE) + 1;
  }

  await executeVideoCanisterPut(
    () =>
      videoActor.put_meta_info({
        name: video.name,
        description: video.description,
        chunk_num: chunkNum,
      }),
    'Could not put meta info into video canister',
  );

  for (let i = 0; i < chunkNum; i++) {
    const chunkSlice = video.videoBuffer.slice(
      i * CHUNK_SIZE,
      Math.min(video.videoBuffer.length, (i + 1) * CHUNK_SIZE),
    );
    const chunkArray = Array.from(chunkSlice);

    await executeVideoCanisterPut(
      () => videoActor.put_chunk(i, chunkArray),
      `Could not put chunk <${i}> into the video canister`,
    );
  }

  if (save) {
    const indexActor = await getCanisterActor(
      identity,
      CANISTER_TYPE.INDEX_CANISTER,
      Principal.fromText(INDEX_PRINCIPAL_ID),
    );
    await indexActor.post_video(videoPrincipal);
  }

  return videoPrincipal;
}

export async function getVideo(identity: Identity, principal: Principal): Promise<Video> {
  const actor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, principal);

  try {
    const metaInfo = (await actor.get_meta_info()) as MetaInfo;
    const chunksAsPromises = [];

    for (let i = 0; i < metaInfo.chunk_num; i++) {
      chunksAsPromises.push(actor.get_chunk(i) as Promise<Array<number[] | undefined[]>>);
    }

    const chunkBuffers: Uint8Array[] = [];

    const nestedBytes = (await Promise.all(chunksAsPromises))
      .map((val) => (val[0] ? val[0] : null))
      .filter((v) => v !== null) as number[][];

    nestedBytes.forEach((bytes) => {
      const bytesAsBuffer = Buffer.from(new Uint8Array(bytes));
      chunkBuffers.push(bytesAsBuffer);
    });

    return {
      name: metaInfo.name,
      description: metaInfo.description,
      version: metaInfo.version,
      owner: metaInfo.owner,
      videoBuffer: Buffer.concat(chunkBuffers),
    };
  } catch (error) {
    throw new Error('Unable to query video: ' + error);
  }
}

export async function changeOwner(
  oldIdentity: Identity,
  oldWallet: Principal,
  videoPrincipal: Principal,
  newOwner: Principal,
  newOwnerWallet: Principal,
) {
  await changeCanisterController(oldIdentity, oldWallet, videoPrincipal, newOwnerWallet);

  await changeVideoOwner(oldIdentity, videoPrincipal, newOwner);
}

export async function getMyVideos(identity: Identity): Promise<Principal[]> {
  const indexActor = await getCanisterActor(
    identity,
    CANISTER_TYPE.INDEX_CANISTER,
    Principal.fromText(INDEX_PRINCIPAL_ID),
  );
  const optVideos = (await indexActor.get_my_videos()) as [[Principal]];

  if (optVideos[0] === undefined) {
    return new Array<Principal>();
  } else {
    return optVideos[0];
  }
}
