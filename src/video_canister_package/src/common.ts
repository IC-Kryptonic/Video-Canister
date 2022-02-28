import fetch from "node-fetch";

import { Actor, getManagementCanister, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { canisterId as spawnCanisterId } from "./canisters/spawn_canister";

import { idlFactory as videoCanisterIdl} from './canisters/video_canister/videoCanister_idl.did';
import { idlFactory as spawnCanisterIdl} from './canisters/spawn_canister/spawn_canister_idl.did';

(global as any).fetch = fetch; 



let _identity: null | Identity = null;
let _httpAgent: null | HttpAgent = null;

export const getHttpAgent = async (identity: Identity) => {
    if (!_httpAgent || identity !== _identity) {
        _identity = identity;
        _httpAgent = new HttpAgent({
          identity,
          host:"http://localhost:8000", //TODO dynamic
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
    canisterId: spawnCanisterId as string //TODO dynamic
  });
}

export const getManagementCanisterActor = async (identity: Identity) => {
  const httpAgent = await getHttpAgent(identity);
  return getManagementCanister({
    agent: httpAgent,
  })
}