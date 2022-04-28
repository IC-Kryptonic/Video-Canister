"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANISTER_IDL_MAP = exports.CHUNK_SIZE = exports.REQUIRED_CYCLES = exports.MANAGEMENT_PRINCIPAL_ID = exports.INDEX_PRINCIPAL_ID = exports.SPAWN_PRINCIPAL_ID = exports.DEV_MODE = void 0;
require('dotenv').config();
const videoCanister_idl_did_1 = require("./canisters/video_canister/videoCanister_idl.did");
const spawnCanister_idl_did_1 = require("./canisters/spawn_canister/spawnCanister_idl.did");
const managementCanister_idl_did_1 = require("./canisters/management_canister/managementCanister_idl.did");
const walletCanister_idl_did_1 = require("./canisters/wallet_canister/walletCanister_idl.did");
const indexCanister_idl_did_1 = require("./canisters/index_canister/indexCanister_idl.did");
exports.DEV_MODE = process.env.NODE_ENV === 'DEV';
// TODO adjust for mainnet
exports.SPAWN_PRINCIPAL_ID = exports.DEV_MODE ? process.env.SPAWN_PRINCIPAL_ID || '' : 'ryjl3-tyaaa-aaaaa-aaaba-cai';
exports.INDEX_PRINCIPAL_ID = exports.DEV_MODE ? process.env.INDEX_PRINCIPAL_ID || '' : 'rkp4c-7iaaa-aaaaa-aaaca-cai';
exports.MANAGEMENT_PRINCIPAL_ID = 'aaaaa-aa';
exports.REQUIRED_CYCLES = BigInt(200000000000);
exports.CHUNK_SIZE = 1024;
// TODO define types for idls
exports.CANISTER_IDL_MAP = new Map([
    ["MANAGEMENT_CANISTER" /* MANAGEMENT_CANISTER */, managementCanister_idl_did_1.idlFactory],
    ["SPAWN_CANISTER" /* SPAWN_CANISTER */, spawnCanister_idl_did_1.idlFactory],
    ["VIDEO_CANISTER" /* VIDEO_CANISTER */, videoCanister_idl_did_1.idlFactory],
    ["WALLET_CANISTER" /* WALLET_CANISTER */, walletCanister_idl_did_1.idlFactory],
    ["INDEX_CANISTER" /* INDEX_CANISTER */, indexCanister_idl_did_1.idlFactory],
]);
