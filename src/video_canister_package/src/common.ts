import fetch from 'node-fetch';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

import { CANISTER_IDL_MAP, CANISTER_TYPE, MANAGEMENT_PRINCIPAL_ID } from './constants';
import {
  ChangeOwnerResponse,
  PutChunkResponse,
  PutMetaInfoResponse,
} from './canisters/video_canister/video_canister.did';
import { CanisterStatusResponse, CreateNewCanisterResponse, RawWalletResponse } from './interfaces';

// fetch needs to be available internally for the HttpAgent
(global as any).fetch = fetch;

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

export async function changeVideoOwner(oldIdentity: Identity, videoPrincipal: Principal, newOwner: Principal) {
  const videoCanister = await getCanisterActor(oldIdentity, CANISTER_TYPE.VIDEO_CANISTER, videoPrincipal);

  await executeVideoCanisterPut(() => videoCanister.change_owner(newOwner), `Could not change owner of video canister`);
}

export async function changeCanisterController(
  oldIdentity: Identity,
  oldWallet: Principal,
  videoPrincipal: Principal,
  newOwnerWallet: Principal,
) {
  const walletActor = await getCanisterActor(oldIdentity, CANISTER_TYPE.WALLET_CANISTER, oldWallet);

  const encodedArgs = IDL.encode(
    [
      IDL.Record({
        canister_id: IDL.Principal,
        settings: IDL.Record({
          controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
          compute_allocation: IDL.Opt(IDL.Nat),
          memory_allocation: IDL.Opt(IDL.Nat),
          freezing_threshold: IDL.Opt(IDL.Nat),
        }),
      }),
    ],
    [
      {
        canister_id: videoPrincipal,
        settings: {
          controllers: [[newOwnerWallet]],
          compute_allocation: [],
          memory_allocation: [],
          freezing_threshold: [],
        },
      },
    ],
  );

  try {
    const walletResponse = (await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: 'update_settings',
      args: [...Buffer.from(encodedArgs)],
      cycles: 0,
    })) as CreateNewCanisterResponse;

    if (!('Ok' in walletResponse)) {
      throw Error(walletResponse.toString());
    }
  } catch (error) {
    throw Error('Unable to change canister controller: ' + error);
  }
}

export async function createNewCanister(
  identity: Identity,
  walletId: Principal,
  creationCycles: BigInt,
  spawnCanisterPrincipal: string,
): Promise<Principal> {
  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, walletId);

  try {
    const spawnPrincipal = Principal.fromText(spawnCanisterPrincipal);
    const walletResponse = (await walletActor.wallet_call({
      canister: spawnPrincipal,
      method_name: 'create_new_canister',
      args: [...Buffer.from(IDL.encode([IDL.Principal], [identity.getPrincipal()]))],
      cycles: creationCycles,
    })) as RawWalletResponse;

    if ('Ok' in walletResponse) {
      const encodedResponse = walletResponse.Ok.return;
      let response = IDL.decode(
        [
          IDL.Variant({
            created: IDL.Principal,
            insufficient_funds: IDL.Null,
            canister_creation_error: IDL.Null,
            canister_installation_error: IDL.Null,
            change_controller_error: IDL.Null,
          }),
        ],
        Buffer.from(encodedResponse),
      )[0] as unknown as CreateNewCanisterResponse;

      if ('created' in response) {
        return response.created;
      } else {
        throw Error(response.toString());
      }
    } else {
      throw Error(walletResponse.toString());
    }
  } catch (error) {
    throw Error('Error creating video canister with spawn canister: ' + error);
  }
}

export async function checkController(identity: Identity, wallet: Principal, video_canister: Principal) {
  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal })], [{ canister_id: video_canister }]);

  try {
    const walletResponse = (await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: 'canister_status',
      args: [...Buffer.from(encoded_args)],
      cycles: 0,
    })) as RawWalletResponse;

    if ('Ok' in walletResponse) {
      const raw_response = walletResponse.Ok.return;
      let response = IDL.decode(
        [
          IDL.Record({
            settings: IDL.Record({
              controllers: IDL.Vec(IDL.Principal),
            }),
          }),
        ],
        Buffer.from(raw_response),
      )[0] as unknown as CanisterStatusResponse;

      const controllers = response?.settings?.controllers || [];

      if (controllers.length === 0) {
        throw Error('Video canister has no controller');
      } else if (controllers.length > 1) {
        throw new Error('Video canister has too many controllers ' + controllers);
      } else {
        const controllerIsWallet = controllers[0].toText() === wallet.toText();
        if (!controllerIsWallet)
          throw new Error('Video Canister controller is not wallet, instead it is ' + controllers[0]);
      }
    }
  } catch (error) {
    throw new Error('Check Controller Error: ' + error);
  }
}

export async function depositCycles(identity: Identity, wallet: Principal, video_canister: Principal, cycles: bigint) {
  const walletActor = await getCanisterActor(identity, CANISTER_TYPE.WALLET_CANISTER, wallet);

  const encoded_args = IDL.encode([IDL.Record({ canister_id: IDL.Principal })], [{ canister_id: video_canister }]);

  try {
    const walletResponse = (await walletActor.wallet_call({
      canister: managementPrincipal,
      method_name: 'deposit_cycles',
      args: [...Buffer.from(encoded_args)],
      cycles: cycles,
    })) as RawWalletResponse;

    if ('Ok' in walletResponse) {
      /*
      TODO decode and check wallet response
      const encodedResponse = walletResponse.Ok.return;
      const response = IDL.decode([], Buffer.from(raw_response))[0];
      */
    } else {
      console.error(walletResponse);
      throw Error(walletResponse.toString());
    }
  } catch (error) {
    throw Error('Unable to deposit cycles ' + error);
  }
}
