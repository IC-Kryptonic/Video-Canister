import type { Principal } from '@dfinity/principal';
export type ChangeOwnerResponse = { 'missing_rights' : null } |
  { 'success' : null };
export type Chunk = Array<number>;
export interface MetaInfo {
  'owner' : Principal,
  'name' : string,
  'description' : string,
  'version' : bigint,
  'chunk_num' : bigint,
}
export type PutChunkResponse = { 'out_of_bounds' : null } |
  { 'missing_rights' : null } |
  { 'success' : null };
export interface PutMetaInfo {
  'name' : string,
  'description' : string,
  'chunk_num' : bigint,
}
export type PutMetaInfoResponse = { 'missing_rights' : null } |
  { 'success' : null };
export interface _SERVICE {
  'change_owner' : (arg_0: Principal) => Promise<ChangeOwnerResponse>,
  'get_chunk' : (arg_0: bigint) => Promise<[] | [Chunk]>,
  'get_meta_info' : () => Promise<MetaInfo>,
  'put_chunk' : (arg_0: bigint, arg_1: Chunk) => Promise<PutChunkResponse>,
  'put_meta_info' : (arg_0: PutMetaInfo) => Promise<PutMetaInfoResponse>,
}
