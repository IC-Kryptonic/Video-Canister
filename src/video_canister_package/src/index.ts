import { AnonymousIdentity, Identity } from '@dfinity/agent';
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
  getHttpAgent,
  uploadChunk,
} from './common';
import { CANISTER_TYPE, REQUIRED_CYCLES, DEFAULT_CONFIG } from './constants';
import { Video, StorageConfig, InternalStorageConfig, UpdateMetadata, UpdateVideo, UploadVideo, ChangeOwner } from './interfaces';
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

  /**
   * Updates storage config
   * @param {number} [config.chunkSize] video chunk size
   * @param {number} [config.uploadAttemptsPerChunk] maximum number of upload attempts per chunk
   * @param {Boolean} [config.storeOnIndex] determines whether if created video canister principals are stored in the index canister
   * @param {string} [config.indexCanisterPrincipalId] string representation of index canister principal
   * @param {string} [config.spawnCanisterPrincipalId] string representation of spawn canister principal
   * @param {string} [config.host] Internet Computer host
   */
  updateConfig(config: StorageConfig) {
    checkUpdateConfigParams(config);
    if (config.chunkSize !== undefined) this.config.chunkSize = config.chunkSize;
    if (config.uploadAttemptsPerChunk !== undefined) this.config.uploadAttemptsPerChunk = config.uploadAttemptsPerChunk;
    if (config.storeOnIndex !== undefined) this.config.storeOnIndex = config.storeOnIndex;
    if (config.indexCanisterPrincipalId) this.config.indexCanisterPrincipalId = config.indexCanisterPrincipalId;
    if (config.spawnCanisterPrincipalId) this.config.spawnCanisterPrincipalId = config.spawnCanisterPrincipalId;
    if (config.host) this.config.host = config.host;
  }

  /**
   * Creates new video canister and store video in it
   * @param {Identity} input.identity caller's identity
   * @param {Principal} input.walletId wallet owned by the caller to pay the cycles
   * @param {Principal} input.video object with 'name', 'description' and 'videoBuffer'
   * @param {bigint} input.cycles bigint amount of cycles for payment & transfer to the video canister
   */
  async uploadVideo(input: UploadVideo): Promise<Principal> {
    const { identity, walletId, video, cycles } = checkUploadVideoParams(input);
    if (cycles < REQUIRED_CYCLES) {
      throw Error('Not enough cycles, need at least ' + REQUIRED_CYCLES + ' for video canister creation');
    }

    const httpAgent = await getHttpAgent(identity, this.config.host);
    const videoPrincipal = await createNewCanister(identity, walletId, cycles, this.config.spawnCanisterPrincipalId, httpAgent);

    await checkController(walletId, videoPrincipal, httpAgent);

    const leftoverCycles = cycles - REQUIRED_CYCLES;
    if (leftoverCycles > 0) {
      await depositCycles(walletId, videoPrincipal, leftoverCycles, httpAgent);
    }

    let chunkNum = 0;
    if (video.videoBuffer.length !== 0) {
      chunkNum = Math.floor(video.videoBuffer.length / this.config.chunkSize) + 1;
    }

    await this.updateMetadata({
      identity,
      videoPrincipal,
      newName: video.name,
      newDescription: video.description,
    });

    await this.updateVideo({
      identity,
      videoPrincipal,
      newChunkNum: chunkNum,
      newVideoBuffer: video.videoBuffer,
    });

    if (this.config.storeOnIndex) {
      const indexActor = await getCanisterActor(
        CANISTER_TYPE.INDEX_CANISTER,
        Principal.fromText(this.config.indexCanisterPrincipalId),
        httpAgent,
      );
      await indexActor.post_video(videoPrincipal);
    }

    return videoPrincipal;
  }

  /**
   * Experimental: Calculates an estimate amount of required cycles for the uploadVideo function
   * @param {number} fileSize size of the file buffer
   */
  calculateCycleEstimate(fileSize: number): bigint {
    const calculatedEstimate = BigInt(190000000000 + 1500 * Number(fileSize));
    return calculatedEstimate < REQUIRED_CYCLES ? REQUIRED_CYCLES : calculatedEstimate;
  }

  /**
   * Retrieves video from video canister
   * @param {Principal} principal principal of the video canister
   */
  async getVideo(principal: Principal): Promise<Video> {
    checkGetVideoParams(principal);
    const httpAgent = await getHttpAgent(new AnonymousIdentity(), this.config.host);

    const actor = await getCanisterActor(CANISTER_TYPE.VIDEO_CANISTER, principal, httpAgent);

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

  /**
   * Changes the owner of a video canister
   * @param {Identity} input.oldIdentity caller's / current owner's identity
   * @param {Principal} input.oldWallet caller's / current owner's wallet principal
   * @param {Principal} input.videoPrincipal principal of the video canister
   * @param {Principal} input.newOwner new owner's principal
   * @param {Principal} input.newOwnerWallet new owner's wallet principal
   */
  async changeOwner(input: ChangeOwner) {
    const { oldIdentity, oldWallet, videoPrincipal, newOwner, newOwnerWallet } = checkChangeOwnerParams(input);
    const httpAgent = await getHttpAgent(oldIdentity, this.config.host);
    await changeCanisterController(oldWallet, videoPrincipal, newOwnerWallet, httpAgent);
    await changeVideoOwner(videoPrincipal, newOwner, httpAgent);
  }

  async getMyVideos(identity: Identity): Promise<Principal[]> {
    checkGetMyVideosParams(identity);
    const httpAgent = await getHttpAgent(identity, this.config.host);
    const indexActor = await getCanisterActor(
      CANISTER_TYPE.INDEX_CANISTER,
      Principal.fromText(this.config.indexCanisterPrincipalId),
      httpAgent,
    );
    const optVideos = (await indexActor.get_my_videos()) as [[Principal]];

    if (optVideos[0] === undefined) {
      return new Array<Principal>();
    } else {
      return optVideos[0];
    }
  }

  /**
   * Updates metadata in an already existing video canister
   * @param {Identity} input.identity caller's identity
   * @param {Principal} input.videoPrincipal principal of the video canister
   * @param {string} input.newName new video name
   * @param {string} input.newDescription new video description
   */
  async updateMetadata(input: UpdateMetadata) {
    const { identity, videoPrincipal, newName, newDescription } = checkUpdateMetadataParams(input);
    const httpAgent = await getHttpAgent(identity, this.config.host);
    const videoActor = await getCanisterActor(CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal, httpAgent);

    await executeVideoCanisterPut(
      () =>
        videoActor.put_meta_info({
          name: [newName],
          description: [newDescription],
          // chunk_num is set in updateVideo
          chunk_num: [],
        }),
      'Could not put meta info into video canister',
    );
  }

  /**
   * Updates video in an already existing video canister
   * @param {Identity} input.identity caller's identity
   * @param {Principal} input.videoPrincipal principal of the video canister
   * @param {Buffer} input.newVideoBuffer the video buffer to put into the canister
   * @param {number} input.newChunkNum the number of chunks (video length / chunk size)
   */
  async updateVideo(input: UpdateVideo) {
    const { identity, videoPrincipal, newChunkNum, newVideoBuffer } = checkUpdateVideoParams(input);
    const httpAgent = await getHttpAgent(identity, this.config.host);
    const videoActor = await getCanisterActor(CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal, httpAgent);
    const promises: Array<Promise<void>> = [];

    await executeVideoCanisterPut(
      () =>
        videoActor.put_meta_info({
          // name is set in updateVideo
          name: [],
          // description is set in updateVideo
          description: [],
          chunk_num: [newChunkNum],
        }),
      'Could not put chunk_num into video canister',
    );

    for (let i = 0; i < newChunkNum; i++) {
      const chunkSlice = newVideoBuffer.slice(i * this.config.chunkSize, Math.min(newVideoBuffer.length, (i + 1) * this.config.chunkSize));
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
