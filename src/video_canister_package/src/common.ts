import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import fetch from "node-fetch";

import { idlFactory as videoCanisterIdl} from './canisters/video_canister/videoCanister_idl.did';
import { MetaInfo } from "./canisters/video_canister/video_canister.did";

(global as any).fetch = fetch; 

export type Video = {
    "name": string,
    "description": string,
    "chunk_num": number,
    "version": number,
    "owner": Principal,
}

let _identity: null | Identity = null;
let _httpAgent: null | HttpAgent = null;

export const getHttpAgent = async (identity: Identity) => {
    if (!_httpAgent || identity !== _identity) {
        _identity = identity;
        _httpAgent = new HttpAgent({
          identity,
          host:"http://localhost:8000",
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