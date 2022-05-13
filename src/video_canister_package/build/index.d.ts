import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Video, StorageConfig, InternalStorageConfig, UpdateMetadata, UpdateVideo, UploadVideo, ChangeOwner } from './interfaces';
export declare class ICVideoStorage {
    config: InternalStorageConfig;
    constructor(config?: StorageConfig);
    updateConfig(config: StorageConfig): void;
    uploadVideo(input: UploadVideo): Promise<Principal>;
    getVideo(identity: Identity, principal: Principal): Promise<Video>;
    changeOwner(input: ChangeOwner): Promise<void>;
    getMyVideos(identity: Identity): Promise<Principal[]>;
    updateMetadata(input: UpdateMetadata): Promise<void>;
    updateVideo(input: UpdateVideo): Promise<void>;
}
