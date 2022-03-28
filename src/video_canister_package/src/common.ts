import fetch from "node-fetch";

import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { spawn_canister as spawn_canister_id } from "../../../.dfx/local/canister_ids.json"; //TODO for deployment, probably doesnt work for deployment

import { idlFactory as videoCanisterIdl} from './canisters/video_canister/videoCanister_idl.did';
import { idlFactory as spawnCanisterIdl} from './canisters/spawn_canister/spawnCanister_idl.did';
import { idlFactory as managementCanisterIdl} from './canisters/management_canister/managementCanister_idl.did';
import { idlFactory as walletCanisterIdl} from './canisters/wallet_canister/walletCanister_idl.did';

(global as any).fetch = fetch; 

export const managementPrincipal = Principal.fromText("aaaaa-aa");

let _identity: null | Identity = null;
let _httpAgent: null | HttpAgent = null;

export const getHttpAgent = async (identity: Identity) => {
    if (!_httpAgent || identity !== _identity) {
        _identity = identity;
        _httpAgent = new HttpAgent({
          identity,
          host:"http://localhost:8000", //TODO deployment
        });
        await _httpAgent.fetchRootKey();
    }
    return _httpAgent;
};

export const getVideoCanisterActor = async (identity: Identity, principal: Principal) => {
  const httpAgent = await getHttpAgent(identity);
  return Actor.createActor(videoCanisterIdl, {
    agent: httpAgent,
    canisterId: principal,
  });
};

export const getSpawnCanisterActor = async (identity: Identity) => {
  const httpAgent = await getHttpAgent(identity);
  return Actor.createActor(spawnCanisterIdl, {
    agent: httpAgent,
    canisterId: spawn_canister_id.local //TODO deployment
  });
}

export const getManagementCanisterActor = async (identity: Identity) => {
  const httpAgent = await getHttpAgent(identity);
  return Actor.createActor(managementCanisterIdl, {
    agent: httpAgent,
    canisterId: "aaaaa-aa"
  });
}

export const getWalletCanisterActor = async (identity: Identity, canisterId: Principal) => {
  const httpAgent = await getHttpAgent(identity);
  return Actor.createActor(walletCanisterIdl, {
    agent: httpAgent,
    canisterId: canisterId, 
  });
}