/// <reference types="node" />
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
export interface Video {
    name: string;
    description: string;
    version: bigint;
    owner: Principal;
    videoBuffer: Buffer;
}
export interface VideoToStore {
    name: string;
    description: string;
    videoBuffer: Buffer;
}
export interface CreateNewCanisterResponse {
    created: Principal;
    insufficient_funds: null;
    canister_creation_error: null;
    canister_installation_error: null;
    change_controller_error: null;
}
export interface CanisterStatusResponse {
    settings: {
        controllers: Principal[];
    };
}
export interface RawWalletResponse {
    Ok: {
        return: Array<number>;
    };
}
export interface StorageConfig {
    spawnCanisterPrincipalId?: string;
    indexCanisterPrincipalId?: string;
    chunkSize?: number;
    uploadAttemptsPerChunk?: number;
    storeOnIndex?: boolean;
    host?: string;
}
export interface InternalStorageConfig extends StorageConfig {
    spawnCanisterPrincipalId: string;
    indexCanisterPrincipalId: string;
    chunkSize: number;
    uploadAttemptsPerChunk: number;
    storeOnIndex: boolean;
    host: string;
}
export interface UploadVideo {
    identity: Identity;
    walletId: Principal;
    video: VideoToStore;
    cycles: bigint;
}
export interface ChangeOwner {
    oldIdentity: Identity;
    oldWallet: Principal;
    videoPrincipal: Principal;
    newOwner: Principal;
    newOwnerWallet: Principal;
}
export interface UpdateVideo {
    identity: Identity;
    principal: Principal;
    chunkNum: number;
    videoBuffer: Buffer;
}
export interface UpdateMetadata {
    identity: Identity;
    principal: Principal;
    name: string;
    description: string;
    chunkNum: number;
}
