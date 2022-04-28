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
  spawnCanisterPrincipal?: string;
  indexCanisterPrincipal?: string;
  chunkSize?: number;
  storeOnIndex?: boolean;
}

export interface InternalStorageConfig extends StorageConfig {
  spawnCanisterPrincipal: string;
  indexCanisterPrincipal: string;
  chunkSize: number;
  storeOnIndex: boolean;
}
