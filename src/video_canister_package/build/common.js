"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositCycles = exports.checkController = exports.createNewCanister = exports.changeCanisterController = exports.changeVideoOwner = exports.uploadChunk = exports.executeVideoCanisterPut = exports.getCanisterActor = exports.getHttpAgent = exports.managementPrincipal = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const agent_1 = require("@dfinity/agent");
const candid_1 = require("@dfinity/candid");
const principal_1 = require("@dfinity/principal");
const constants_1 = require("./constants");
// fetch needs to be available internally for the HttpAgent
global.fetch = node_fetch_1.default;
exports.managementPrincipal = principal_1.Principal.fromText(constants_1.MANAGEMENT_PRINCIPAL_ID);
let _identity = null;
let _httpAgent = null;
const getHttpAgent = async (identity, host) => {
    if (!_httpAgent || identity !== _identity) {
        _identity = identity;
        _httpAgent = new agent_1.HttpAgent({
            identity,
            host,
        });
        await _httpAgent.fetchRootKey();
    }
    return _httpAgent;
};
exports.getHttpAgent = getHttpAgent;
const getCanisterActor = async (canisterType, principal, httpAgent) => {
    const idl = constants_1.CANISTER_IDL_MAP.get(canisterType);
    try {
        const actor = agent_1.Actor.createActor(idl, {
            agent: httpAgent,
            canisterId: principal,
        });
        return actor;
    }
    catch (error) {
        console.error(error);
        throw Error(`Actor for canister of type <${canisterType}> with principal <${principal}> could not be created:` + error);
    }
};
exports.getCanisterActor = getCanisterActor;
const executeVideoCanisterPut = async (func, errorMessage) => {
    try {
        const response = (await func());
        if (!('success' in response)) {
            throw new Error(Object.keys(response).at(0));
        }
    }
    catch (error) {
        console.error(error);
        throw Error(`${errorMessage}: ` + error);
    }
};
exports.executeVideoCanisterPut = executeVideoCanisterPut;
const uploadChunk = async (func, uploadAttempts, errorMessage) => {
    let uploadSuccessful = false;
    let lastError = '';
    for (let i = 0; i < uploadAttempts; i++) {
        try {
            const response = (await func());
            if (!('success' in response)) {
                throw new Error(Object.keys(response).at(0));
            }
            else {
                uploadSuccessful = true;
                break;
            }
        }
        catch (error) {
            lastError = `${errorMessage}: ` + error;
        }
    }
    if (!uploadSuccessful) {
        console.error(lastError);
        throw new Error(lastError);
    }
};
exports.uploadChunk = uploadChunk;
async function changeVideoOwner(videoPrincipal, newOwner, httpAgent) {
    const videoCanister = await (0, exports.getCanisterActor)("VIDEO_CANISTER" /* VIDEO_CANISTER */, videoPrincipal, httpAgent);
    await (0, exports.executeVideoCanisterPut)(() => videoCanister.change_owner(newOwner), `Could not change owner of video canister`);
}
exports.changeVideoOwner = changeVideoOwner;
async function changeCanisterController(oldWallet, videoPrincipal, newOwnerWallet, httpAgent) {
    const walletActor = await (0, exports.getCanisterActor)("WALLET_CANISTER" /* WALLET_CANISTER */, oldWallet, httpAgent);
    const encodedArgs = candid_1.IDL.encode([
        candid_1.IDL.Record({
            canister_id: candid_1.IDL.Principal,
            settings: candid_1.IDL.Record({
                controllers: candid_1.IDL.Opt(candid_1.IDL.Vec(candid_1.IDL.Principal)),
                compute_allocation: candid_1.IDL.Opt(candid_1.IDL.Nat),
                memory_allocation: candid_1.IDL.Opt(candid_1.IDL.Nat),
                freezing_threshold: candid_1.IDL.Opt(candid_1.IDL.Nat),
            }),
        }),
    ], [
        {
            canister_id: videoPrincipal,
            settings: {
                controllers: [[newOwnerWallet]],
                compute_allocation: [],
                memory_allocation: [],
                freezing_threshold: [],
            },
        },
    ]);
    try {
        const walletResponse = (await walletActor.wallet_call({
            canister: exports.managementPrincipal,
            method_name: 'update_settings',
            args: [...Buffer.from(encodedArgs)],
            cycles: 0,
        }));
        if (!('Ok' in walletResponse)) {
            console.error(walletResponse);
            throw Error(walletResponse.toString());
        }
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to change canister controller: ' + error);
    }
}
exports.changeCanisterController = changeCanisterController;
async function createNewCanister(identity, walletId, cycles, spawnCanisterPrincipal, httpAgent) {
    const walletActor = await (0, exports.getCanisterActor)("WALLET_CANISTER" /* WALLET_CANISTER */, walletId, httpAgent);
    try {
        const spawnPrincipal = principal_1.Principal.fromText(spawnCanisterPrincipal);
        const walletResponse = (await walletActor.wallet_call({
            canister: spawnPrincipal,
            method_name: 'create_new_canister',
            args: [...Buffer.from(candid_1.IDL.encode([candid_1.IDL.Principal], [identity.getPrincipal()]))],
            cycles,
        }));
        if ('Ok' in walletResponse) {
            const encodedResponse = walletResponse.Ok.return;
            let response = candid_1.IDL.decode([
                candid_1.IDL.Variant({
                    created: candid_1.IDL.Principal,
                    insufficient_funds: candid_1.IDL.Null,
                    canister_creation_error: candid_1.IDL.Null,
                    canister_installation_error: candid_1.IDL.Null,
                    change_controller_error: candid_1.IDL.Null,
                }),
            ], Buffer.from(encodedResponse))[0];
            if ('created' in response) {
                return response.created;
            }
            else {
                console.error(response);
                throw Error(response.toString());
            }
        }
        else {
            console.error(walletResponse);
            throw Error(walletResponse.toString());
        }
    }
    catch (error) {
        console.error(error);
        throw Error('Error creating video canister with spawn canister: ' + error);
    }
}
exports.createNewCanister = createNewCanister;
async function checkController(wallet, video_canister, httpAgent) {
    const walletActor = await (0, exports.getCanisterActor)("WALLET_CANISTER" /* WALLET_CANISTER */, wallet, httpAgent);
    const encoded_args = candid_1.IDL.encode([candid_1.IDL.Record({ canister_id: candid_1.IDL.Principal })], [{ canister_id: video_canister }]);
    try {
        const walletResponse = (await walletActor.wallet_call({
            canister: exports.managementPrincipal,
            method_name: 'canister_status',
            args: [...Buffer.from(encoded_args)],
            cycles: 0,
        }));
        if ('Ok' in walletResponse) {
            const raw_response = walletResponse.Ok.return;
            let response = candid_1.IDL.decode([
                candid_1.IDL.Record({
                    settings: candid_1.IDL.Record({
                        controllers: candid_1.IDL.Vec(candid_1.IDL.Principal),
                    }),
                }),
            ], Buffer.from(raw_response))[0];
            const controllers = response?.settings?.controllers || [];
            if (controllers.length === 0) {
                throw Error('Video canister has no controller');
            }
            else if (controllers.length > 1) {
                throw new Error('Video canister has too many controllers ' + controllers);
            }
            else {
                const controllerIsWallet = controllers[0].toText() === wallet.toText();
                if (!controllerIsWallet)
                    throw new Error('Video Canister controller is not wallet, instead it is ' + controllers[0]);
            }
        }
    }
    catch (error) {
        throw new Error('Check Controller Error: ' + error);
    }
}
exports.checkController = checkController;
async function depositCycles(wallet, video_canister, cycles, httpAgent) {
    const walletActor = await (0, exports.getCanisterActor)("WALLET_CANISTER" /* WALLET_CANISTER */, wallet, httpAgent);
    const encoded_args = candid_1.IDL.encode([candid_1.IDL.Record({ canister_id: candid_1.IDL.Principal })], [{ canister_id: video_canister }]);
    try {
        const walletResponse = (await walletActor.wallet_call({
            canister: exports.managementPrincipal,
            method_name: 'deposit_cycles',
            args: [...Buffer.from(encoded_args)],
            cycles: cycles,
        }));
        if (!('Ok' in walletResponse)) {
            console.error(walletResponse);
            throw Error(walletResponse.toString());
        }
    }
    catch (error) {
        throw Error('Unable to deposit cycles ' + error);
    }
}
exports.depositCycles = depositCycles;
