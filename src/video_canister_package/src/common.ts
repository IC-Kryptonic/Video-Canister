import fetch from 'node-fetch';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

import { CANISTER_IDL_MAP, CANISTER_TYPE, MANAGEMENT_PRINCIPAL_ID } from './constants';
import {
  ChangeOwnerResponse,
  PutChunkResponse,
  PutMetaInfoResponse,
} from './canisters/video_canister/video_canister.did';

// fetch needs to be available internally for the HttpAgent
(global as any).fetch = fetch;

// TODO unsafe
export const managementPrincipal = Principal.fromText(MANAGEMENT_PRINCIPAL_ID);

let _identity: null | Identity = null;
let _httpAgent: null | HttpAgent = null;

const getHttpAgent = async (identity: Identity) => {
  if (!_httpAgent || identity !== _identity) {
    _identity = identity;
    _httpAgent = new HttpAgent({
      identity,
      host: 'http://localhost:8000', //TODO deployment
    });
    await _httpAgent.fetchRootKey();
  }
  return _httpAgent;
};

export const getCanisterActor = async (identity: Identity, canisterType: CANISTER_TYPE, principal: Principal) => {
  const httpAgent = await getHttpAgent(identity);
  const idl = CANISTER_IDL_MAP.get(canisterType);
  try {
    const actor = Actor.createActor(idl, {
      agent: httpAgent,
      canisterId: principal,
    });
    return actor;
  } catch (error) {
    throw Error(
      `Actor for canister of type <${canisterType}> with principal <${principal}> could not be created:` + error,
    );
  }
};

export const executeVideoCanisterPut = async (func: Function, errorMessage: string) => {
  try {
    const response = (await func()) as ChangeOwnerResponse | PutChunkResponse | PutMetaInfoResponse;
    if (!('success' in response)) {
      throw new Error(Object.keys(response).at(0));
    }
  } catch (error) {
    throw Error(`${errorMessage}: ` + error);
  }
};
