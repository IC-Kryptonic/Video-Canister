"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANISTER_IDL_MAP = exports.DEFAULT_CONFIG = exports.UPLOAD_ATTEMPTS_PER_CHUNK = exports.MAX_CHUNK_SIZE = exports.MIN_CHUNK_SIZE = exports.CHUNK_SIZE = exports.REQUIRED_CYCLES = exports.IC0HOST = exports.MANAGEMENT_PRINCIPAL_ID = exports.INDEX_PRINCIPAL_ID = exports.SPAWN_PRINCIPAL_ID = void 0;
require('dotenv').config();
const videoCanister_idl_did_1 = require("./canisters/video_canister/videoCanister_idl.did");
const spawnCanister_idl_did_1 = require("./canisters/spawn_canister/spawnCanister_idl.did");
const managementCanister_idl_did_1 = require("./canisters/management_canister/managementCanister_idl.did");
const walletCanister_idl_did_1 = require("./canisters/wallet_canister/walletCanister_idl.did");
const indexCanister_idl_did_1 = require("./canisters/index_canister/indexCanister_idl.did");
exports.SPAWN_PRINCIPAL_ID = '3j2ht-uqaaa-aaaag-aaioq-cai';
exports.INDEX_PRINCIPAL_ID = '3azmp-cyaaa-aaaag-aaipa-cai';
exports.MANAGEMENT_PRINCIPAL_ID = 'aaaaa-aa';
exports.IC0HOST = 'https://ic0.app';
exports.REQUIRED_CYCLES = BigInt(200000000000);
exports.CHUNK_SIZE = 100000;
exports.MIN_CHUNK_SIZE = 1000;
exports.MAX_CHUNK_SIZE = 2000000;
exports.UPLOAD_ATTEMPTS_PER_CHUNK = 3;
exports.DEFAULT_CONFIG = {
    spawnCanisterPrincipalId: exports.SPAWN_PRINCIPAL_ID,
    indexCanisterPrincipalId: exports.INDEX_PRINCIPAL_ID,
    chunkSize: exports.CHUNK_SIZE,
    storeOnIndex: true,
    uploadAttemptsPerChunk: exports.UPLOAD_ATTEMPTS_PER_CHUNK,
    host: exports.IC0HOST,
};
exports.CANISTER_IDL_MAP = new Map([
    ["MANAGEMENT_CANISTER" /* MANAGEMENT_CANISTER */, managementCanister_idl_did_1.idlFactory],
    ["SPAWN_CANISTER" /* SPAWN_CANISTER */, spawnCanister_idl_did_1.idlFactory],
    ["VIDEO_CANISTER" /* VIDEO_CANISTER */, videoCanister_idl_did_1.idlFactory],
    ["WALLET_CANISTER" /* WALLET_CANISTER */, walletCanister_idl_did_1.idlFactory],
    ["INDEX_CANISTER" /* INDEX_CANISTER */, indexCanister_idl_did_1.idlFactory],
]);
