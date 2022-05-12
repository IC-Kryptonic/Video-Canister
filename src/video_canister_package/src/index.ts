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
  uploadChunk,
} from './common';
import { CANISTER_TYPE, REQUIRED_CYCLES, DEFAULT_CONFIG } from './constants';
import {
  Video,
  StorageConfig,
  InternalStorageConfig,
  UpdateMetadata,
  UpdateVideo,
  UploadVideo,
  ChangeOwner,
} from './interfaces';
import {
  checkChangeOwnerParams,
  checkGetMyVideosParams,
  checkGetVideoParams,
  checkUpdateConfigParams,
  checkUpdateMetadataParams,
  checkUpdateVideoParams,
  checkUploadVideoParams,
} from './parameter-check';

export class ICVideoStorage {
  config: InternalStorageConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  constructor(config?: StorageConfig) {
    if (config) this.updateConfig(config);
  }

  updateConfig(config: StorageConfig) {
    checkUpdateConfigParams(config);
    if (config.chunkSize !== undefined) this.config.chunkSize = config.chunkSize;
    if (config.uploadAttemptsPerChunk !== undefined) this.config.uploadAttemptsPerChunk = config.uploadAttemptsPerChunk;
    if (config.storeOnIndex !== undefined) this.config.storeOnIndex = config.storeOnIndex;
    if (config.indexCanisterPrincipalId) this.config.indexCanisterPrincipalId = config.indexCanisterPrincipalId;
    if (config.spawnCanisterPrincipalId) this.config.spawnCanisterPrincipalId = config.spawnCanisterPrincipalId;
  }

  async uploadVideo(input: UploadVideo): Promise<Principal> {
    const { identity, walletId, video, cycles } = checkUploadVideoParams(input);
    if (cycles < REQUIRED_CYCLES) {
      throw Error('Not enough cycles, need at least ' + REQUIRED_CYCLES + ' for video canister creation');
    }

    const videoPrincipal = await createNewCanister(
      identity,
      walletId,
      REQUIRED_CYCLES,
      this.config.spawnCanisterPrincipalId,
    );

    await checkController(identity, walletId, videoPrincipal);

    const leftoverCycles = cycles - REQUIRED_CYCLES;
    if (leftoverCycles > 0) {
      await depositCycles(identity, walletId, videoPrincipal, leftoverCycles);
    }

    let chunkNum = 0;
    if (video.videoBuffer.length !== 0) {
      chunkNum = Math.floor(video.videoBuffer.length / this.config.chunkSize) + 1;
    }

    await this.updateMetadata({
      identity,
      principal: videoPrincipal,
      name: video.name,
      description: video.description,
      chunkNum,
    });

    await this.updateVideo({
      identity,
      principal: videoPrincipal,
      chunkNum,
      videoBuffer: video.videoBuffer,
    });

    if (this.config.storeOnIndex) {
      const indexActor = await getCanisterActor(
        identity,
        CANISTER_TYPE.INDEX_CANISTER,
        Principal.fromText(this.config.indexCanisterPrincipalId),
      );
      await indexActor.post_video(videoPrincipal);
    }

    return videoPrincipal;
  }

  async getVideo(identity: Identity, principal: Principal): Promise<Video> {
    checkGetVideoParams(identity, principal);
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
      console.error(error);
      throw new Error('Unable to query video: ' + error);
    }
  }

  async changeOwner(input: ChangeOwner) {
    const { oldIdentity, oldWallet, videoPrincipal, newOwner, newOwnerWallet } = checkChangeOwnerParams(input);
    await changeCanisterController(oldIdentity, oldWallet, videoPrincipal, newOwnerWallet);
    await changeVideoOwner(oldIdentity, videoPrincipal, newOwner);
  }

  async getMyVideos(identity: Identity): Promise<Principal[]> {
    checkGetMyVideosParams(identity);
    const indexActor = await getCanisterActor(
      identity,
      CANISTER_TYPE.INDEX_CANISTER,
      Principal.fromText(this.config.indexCanisterPrincipalId),
    );
    const optVideos = (await indexActor.get_my_videos()) as [[Principal]];

    if (optVideos[0] === undefined) {
      return new Array<Principal>();
    } else {
      return optVideos[0];
    }
  }

  async updateMetadata(input: UpdateMetadata) {
    const { identity, principal, name, description, chunkNum } = checkUpdateMetadataParams(input);
    const videoActor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, principal);

    await executeVideoCanisterPut(
      () =>
        videoActor.put_meta_info({
          name: name,
          description: description,
          chunk_num: chunkNum,
        }),
      'Could not put meta info into video canister',
    );
  }

  async updateVideo(input: UpdateVideo) {
    const { identity, principal, chunkNum, videoBuffer } = checkUpdateVideoParams(input);
    const videoActor = await getCanisterActor(identity, CANISTER_TYPE.VIDEO_CANISTER, principal);
    const promises: Array<Promise<void>> = [];

    for (let i = 0; i < chunkNum; i++) {
      const chunkSlice = videoBuffer.slice(
        i * this.config.chunkSize,
        Math.min(videoBuffer.length, (i + 1) * this.config.chunkSize),
      );
      const chunkArray = Array.from(chunkSlice);
      promises.push(
        uploadChunk(
          () => videoActor.put_chunk(i, chunkArray),
          this.config.uploadAttemptsPerChunk,
          `Could not put chunk <${i}> into the video canister`,
        ),
      );
    }

    await Promise.all(promises);
  }
}
