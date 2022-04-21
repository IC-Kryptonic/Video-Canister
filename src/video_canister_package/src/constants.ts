import { idlFactory as videoCanisterIdl } from './canisters/video_canister/videoCanister_idl.did';
import { idlFactory as spawnCanisterIdl } from './canisters/spawn_canister/spawnCanister_idl.did';
import { idlFactory as managementCanisterIdl } from './canisters/management_canister/managementCanister_idl.did';
import { idlFactory as walletCanisterIdl } from './canisters/wallet_canister/walletCanister_idl.did';
import { idlFactory as indexCanisterIdl } from './canisters/wallet_canister/walletCanister_idl.did';

// TODO adjust for mainnet
export const SPAWN_PRINCIPAL_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
export const INDEX_PRINCIPAL_ID = 'rkp4c-7iaaa-aaaaa-aaaca-cai'

// TODO adjust for mainnet
export const MANAGEMENT_PRINCIPAL_ID = 'aaaaa-aa';

export const REQUIRED_CYCLES: bigint = BigInt(200_000_000_000);

export const CHUNK_SIZE = 1024;

export const enum CANISTER_TYPE {
  'VIDEO_CANISTER' = 'VIDEO_CANISTER',
  'SPAWN_CANISTER' = 'SPAWN_CANISTER',
  'MANAGEMENT_CANISTER' = 'MANAGEMENT_CANISTER',
  'WALLET_CANISTER' = 'WALLET_CANISTER',
  'INDEX_CANISTER' = 'INDEX_CANISTER',
}

// TODO define types for idls
export const CANISTER_IDL_MAP = new Map<string, any>([
  [CANISTER_TYPE.MANAGEMENT_CANISTER, managementCanisterIdl],
  [CANISTER_TYPE.SPAWN_CANISTER, spawnCanisterIdl],
  [CANISTER_TYPE.VIDEO_CANISTER, videoCanisterIdl],
  [CANISTER_TYPE.WALLET_CANISTER, walletCanisterIdl],
  [CANISTER_TYPE.INDEX_CANISTER, indexCanisterIdl],
]);
