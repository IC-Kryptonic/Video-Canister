import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Video, StorageConfig, InternalStorageConfig, UpdateMetadata, UpdateVideo, UploadVideo, ChangeOwner } from './interfaces';
export declare class ICVideoStorage {
    config: InternalStorageConfig;
    constructor(config?: StorageConfig);
    /**
     * Updates storage config
     * @param {number} [config.chunkSize] video chunk size
     * @param {number} [config.uploadAttemptsPerChunk] maximum number of upload attempts per chunk
     * @param {Boolean} [config.storeOnIndex] determines whether if created video canister principals are stored in the index canister
     * @param {string} [config.indexCanisterPrincipalId] string representation of index canister principal
     * @param {string} [config.spawnCanisterPrincipalId] string representation of spawn canister principal
     * @param {string} [config.host] Internet Computer host
     */
    updateConfig(config: StorageConfig): void;
    /**
     * Creates new video canister and store video in it
     * @param {Identity} input.identity caller's identity
     * @param {Principal} input.walletId wallet owned by the caller to pay the cycles
     * @param {Principal} input.video object with 'name', 'description' and 'videoBuffer'
     * @param {bigint} input.cycles bigint amount of cycles for payment & transfer to the video canister
     */
    uploadVideo(input: UploadVideo): Promise<Principal>;
    /**
     * Experimental: Calculates an estimate amount of required cycles for the uploadVideo function
     * @param {number} fileSize size of the file buffer
     */
    calculateCycleEstimate(fileSize: number): bigint;
    /**
     * Retrieves video from video canister
     * @param {Principal} principal principal of the video canister
     */
    getVideo(principal: Principal): Promise<Video>;
    /**
     * Changes the owner of a video canister
     * @param {Identity} input.oldIdentity caller's / current owner's identity
     * @param {Principal} input.oldWallet caller's / current owner's wallet principal
     * @param {Principal} input.videoPrincipal principal of the video canister
     * @param {Principal} input.newOwner new owner's principal
     * @param {Principal} input.newOwnerWallet new owner's wallet principal
     */
    changeOwner(input: ChangeOwner): Promise<void>;
    getMyVideos(identity: Identity): Promise<Principal[]>;
    /**
     * Updates metadata in an already existing video canister
     * @param {Identity} input.identity caller's identity
     * @param {Principal} input.videoPrincipal principal of the video canister
     * @param {string} input.newName new video name
     * @param {string} input.newDescription new video description
     */
    updateMetadata(input: UpdateMetadata): Promise<void>;
    /**
     * Updates video in an already existing video canister
     * @param {Identity} input.identity caller's identity
     * @param {Principal} input.videoPrincipal principal of the video canister
     * @param {Buffer} input.newVideoBuffer the video buffer to put into the canister
     * @param {number} input.newChunkNum the number of chunks (video length / chunk size)
     */
    updateVideo(input: UpdateVideo): Promise<void>;
}
