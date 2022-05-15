require('dotenv').config();

import { idlFactory as videoCanisterIdl } from './canisters/video_canister/videoCanister_idl.did';
import { idlFactory as spawnCanisterIdl } from './canisters/spawn_canister/spawnCanister_idl.did';
import { idlFactory as managementCanisterIdl } from './canisters/management_canister/managementCanister_idl.did';
import { idlFactory as walletCanisterIdl } from './canisters/wallet_canister/walletCanister_idl.did';
import { idlFactory as indexCanisterIdl } from './canisters/index_canister/indexCanister_idl.did';
import { InternalStorageConfig } from './interfaces';

export const SPAWN_PRINCIPAL_ID = 'yllyf-jqaaa-aaaal-qaz5q-cai';
export const INDEX_PRINCIPAL_ID = 'ljn74-3iaaa-aaaaj-aekua-cai';

export const IC0HOST = 'https://ic0.app';

export const MANAGEMENT_PRINCIPAL_ID = 'aaaaa-aa';

export const REQUIRED_CYCLES: bigint = BigInt(200_000_000_000);

export const CHUNK_SIZE = 100000;
// TODO confirm
export const MIN_CHUNK_SIZE = 1;
export const MAX_CHUNK_SIZE = 15000000;

export const UPLOAD_ATTEMPTS_PER_CHUNK = 3;

export const DEFAULT_CONFIG: InternalStorageConfig = {
  spawnCanisterPrincipalId: SPAWN_PRINCIPAL_ID,
  indexCanisterPrincipalId: INDEX_PRINCIPAL_ID,
  chunkSize: CHUNK_SIZE,
  storeOnIndex: true,
  uploadAttemptsPerChunk: UPLOAD_ATTEMPTS_PER_CHUNK,
  host: IC0HOST,
};

export const enum CANISTER_TYPE {
  'VIDEO_CANISTER' = 'VIDEO_CANISTER',
  'SPAWN_CANISTER' = 'SPAWN_CANISTER',
  'MANAGEMENT_CANISTER' = 'MANAGEMENT_CANISTER',
  'WALLET_CANISTER' = 'WALLET_CANISTER',
  'INDEX_CANISTER' = 'INDEX_CANISTER',
}

export const CANISTER_IDL_MAP = new Map<string, any>([
  [CANISTER_TYPE.MANAGEMENT_CANISTER, managementCanisterIdl],
  [CANISTER_TYPE.SPAWN_CANISTER, spawnCanisterIdl],
  [CANISTER_TYPE.VIDEO_CANISTER, videoCanisterIdl],
  [CANISTER_TYPE.WALLET_CANISTER, walletCanisterIdl],
  [CANISTER_TYPE.INDEX_CANISTER, indexCanisterIdl],
]);
