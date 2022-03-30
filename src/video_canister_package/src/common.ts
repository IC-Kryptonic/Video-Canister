import fetch from 'node-fetch';

import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

import { CANISTER_IDL_MAP, CANISTER_TYPE, MANAGEMENT_PRINCIPAL_ID } from './constants';

(global as any).fetch = fetch;

export const managementPrincipal = Principal.fromText(MANAGEMENT_PRINCIPAL_ID);

let _identity: null | Identity = null;
let _httpAgent: null | HttpAgent = null;

export const getHttpAgent = async (identity: Identity) => {
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
  return Actor.createActor(idl, {
    agent: httpAgent,
    canisterId: principal,
  });
};
