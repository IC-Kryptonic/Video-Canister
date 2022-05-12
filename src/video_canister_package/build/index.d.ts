import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { VideoToStore, Video, StorageConfig, InternalStorageConfig } from './interfaces';
export declare class ICVideoStorage {
    config: InternalStorageConfig;
    constructor(config?: StorageConfig);
    updateConfig(config: StorageConfig): void;
    uploadVideo(identity: Identity, walletId: Principal, video: VideoToStore, cycles: bigint): Promise<Principal>;
    getVideo(identity: Identity, principal: Principal): Promise<Video>;
    changeOwner(oldIdentity: Identity, oldWallet: Principal, videoPrincipal: Principal, newOwner: Principal, newOwnerWallet: Principal): Promise<void>;
    getMyVideos(identity: Identity): Promise<Principal[]>;
}
