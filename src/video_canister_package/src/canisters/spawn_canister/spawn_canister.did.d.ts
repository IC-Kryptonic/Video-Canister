import type { Principal } from '@dfinity/principal';
export type CreateCanisterResponse = { 'created' : Principal } |
  { 'insufficient_funds' : null } |
  { 'canister_installation_error' : null } |
  { 'change_controller_error' : null } |
  { 'canister_creation_error' : null };
export interface _SERVICE {
  'create_new_canister' : () => Promise<CreateCanisterResponse>,
}
