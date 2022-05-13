"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUpdateVideoParams = exports.checkUpdateMetadataParams = exports.checkGetMyVideosParams = exports.checkChangeOwnerParams = exports.checkGetVideoParams = exports.checkUploadVideoParams = exports.checkUpdateConfigParams = void 0;
const principal_1 = require("@dfinity/principal");
const constants_1 = require("./constants");
function parameterError(errorMessage, parameter) {
    const error = errorMessage + `\n Erroneous parameter: ${parameter}`;
    console.error(error);
    throw new Error(error);
}
function checkValidPrincipal(principal) {
    try {
        principal_1.Principal.fromText(principal.toString());
        return true;
    }
    catch (error) {
        console.error('Invalid principal', error);
    }
    return false;
}
function checkValidIdentity(identity) {
    try {
        principal_1.Principal.fromText(identity.getPrincipal().toText());
        return true;
    }
    catch (error) {
        console.error('Invalid identity', error);
    }
    return false;
}
function checkValidString(text) {
    return typeof text === 'string' && text.length > 0;
}
function checkValidBoolean(bool) {
    return typeof bool === 'boolean';
}
function checkValidNumber(num) {
    return typeof num === 'number' && num >= 0;
}
function checkValidChunkSize(chunkSize) {
    return typeof chunkSize === 'number' && chunkSize >= constants_1.MIN_CHUNK_SIZE && chunkSize <= constants_1.MAX_CHUNK_SIZE;
}
function checkValidBuffer(buffer) {
    return Buffer.isBuffer(buffer) && buffer.length > 0;
}
function checkValidBigint(num) {
    return typeof num === 'bigint' && num >= 0;
}
function checkValidVideoToStore(video) {
    if (!video.name || !checkValidString(video.name))
        return false;
    if (!video.description || !checkValidString(video.description))
        return false;
    if (!video.videoBuffer || !checkValidBuffer(video.videoBuffer))
        return false;
    return true;
}
function checkUpdateConfigParams(input) {
    const errorMessage = `Invalid config object\n` +
        `Valid object properties:\n{\n  ` +
        `spawnCanisterPrincipalId: string\n  indexCanisterPrincipalId: string\n  ` +
        `chunkSize: number\n  uploadAttemptsPerChunk: number\n  storeOnIndex: boolean\n}`;
    if (input.spawnCanisterPrincipalId !== undefined) {
        try {
            principal_1.Principal.fromText(input.spawnCanisterPrincipalId);
        }
        catch (error) {
            parameterError(errorMessage, 'spawnCanisterPrincipalId');
        }
    }
    if (input.indexCanisterPrincipalId !== undefined) {
        try {
            principal_1.Principal.fromText(input.indexCanisterPrincipalId);
        }
        catch (error) {
            parameterError(errorMessage, 'indexCanisterPrincipalId');
        }
    }
    if (input.chunkSize !== undefined && !checkValidChunkSize(input.chunkSize))
        parameterError(errorMessage, 'chunkSize');
    if (input.uploadAttemptsPerChunk !== undefined && (!checkValidNumber(input.uploadAttemptsPerChunk) || input.uploadAttemptsPerChunk < 1)) {
        parameterError(errorMessage, 'uploadAttemptsPerChunk');
    }
    if (input.storeOnIndex !== undefined && !checkValidBoolean(input.storeOnIndex))
        parameterError(errorMessage, 'storeOnIndex');
}
exports.checkUpdateConfigParams = checkUpdateConfigParams;
function checkUploadVideoParams(input) {
    const errorMessage = `Invalid parameters for method 'uploadVideo'\n` +
        `Expected input:\n{\n  ` +
        `walletId: Principal\n  identity: Identity\n  video: VideoToStore\n  cycles: bigint\n}`;
    if (!input.walletId || !checkValidPrincipal(input.walletId))
        parameterError(errorMessage, 'walletId');
    if (!input.identity || !checkValidIdentity(input.identity))
        parameterError(errorMessage, 'identity');
    if (!input.video || !checkValidVideoToStore(input.video))
        parameterError(errorMessage, 'video');
    if (!input.cycles || !checkValidBigint(input.cycles))
        parameterError(errorMessage, 'cycles');
    return input;
}
exports.checkUploadVideoParams = checkUploadVideoParams;
function checkGetVideoParams(identity, principal) {
    const errorMessage = `Invalid parameters for method 'getVideo'\nExpected parameters: (identity: Identity, principal: Principal)`;
    if (!checkValidIdentity(identity))
        parameterError(errorMessage, 'identity');
    if (!checkValidPrincipal(principal))
        parameterError(errorMessage, 'principal');
}
exports.checkGetVideoParams = checkGetVideoParams;
function checkChangeOwnerParams(input) {
    const errorMessage = `Invalid parameters for method 'changeOwner'\n` +
        `Expected input:\n{\n  ` +
        `oldIdentity: Identity\n  oldWallet: Principal\n  videoPrincipal: Principal\n  newOwner: Principal\n  newOwnerWallet: Principal\n}}`;
    if (!input.oldIdentity || !checkValidIdentity(input.oldIdentity))
        parameterError(errorMessage, 'oldIdentity');
    if (!input.oldWallet || !checkValidPrincipal(input.oldWallet))
        parameterError(errorMessage, 'oldWallet');
    if (!input.videoPrincipal || !checkValidPrincipal(input.videoPrincipal)) {
        parameterError(errorMessage, 'videoPrincipal');
    }
    if (!input.newOwner || !checkValidPrincipal(input.newOwner))
        parameterError(errorMessage, 'newOwner');
    if (!input.newOwnerWallet || !checkValidPrincipal(input.newOwnerWallet)) {
        parameterError(errorMessage, 'newOwnerWallet');
    }
    return input;
}
exports.checkChangeOwnerParams = checkChangeOwnerParams;
function checkGetMyVideosParams(identity) {
    const errorMessage = `Invalid parameters for method 'getMyVideos'\nExpected input: (identity: Identity)`;
    if (!checkValidIdentity(identity))
        parameterError(errorMessage, 'identity');
}
exports.checkGetMyVideosParams = checkGetMyVideosParams;
function checkUpdateMetadataParams(input) {
    const errorMessage = `Invalid parameters for method 'updateMetadata'\n` +
        `Expected input:\n{\n  ` +
        `principal: Principal\n  identity: Identity\n  name: string\n  description: string\n  chunkNum: number\n}`;
    if (!input.principal || !checkValidPrincipal(input.principal))
        parameterError(errorMessage, 'principal');
    if (!input.identity || !checkValidIdentity(input.identity))
        parameterError(errorMessage, 'identity');
    if (!input.name || !checkValidString(input.name))
        parameterError(errorMessage, 'name');
    if (!input.description || !checkValidString(input.description))
        parameterError(errorMessage, 'description');
    return input;
}
exports.checkUpdateMetadataParams = checkUpdateMetadataParams;
function checkUpdateVideoParams(input) {
    const errorMessage = `Invalid parameters for method 'updateVideo'\n` +
        `Expected input:\n{\n  ` +
        `principal: Principal\n  identity: Identity\n  videoBuffer: Buffer\n  chunkNum: number\n}`;
    if (!input.principal || !checkValidPrincipal(input.principal))
        parameterError(errorMessage, 'principal');
    if (!input.identity || !checkValidIdentity(input.identity))
        parameterError(errorMessage, 'identity');
    if (!input.chunkNum || !checkValidNumber(input.chunkNum))
        parameterError(errorMessage, 'chunkNum');
    if (!input.videoBuffer || !checkValidBuffer(input.videoBuffer))
        parameterError(errorMessage, 'videoBuffer');
    return input;
}
exports.checkUpdateVideoParams = checkUpdateVideoParams;
