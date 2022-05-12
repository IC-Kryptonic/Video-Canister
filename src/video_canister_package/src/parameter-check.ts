import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE } from './constants';
import { ChangeOwner, StorageConfig, UpdateMetadata, UpdateVideo, UploadVideo, VideoToStore } from './interfaces';

function parameterError(errorMessage: string, parameter: string) {
  const error = errorMessage + `\n Erroneous parameter: ${parameter}`;
  console.error(error);
  throw new Error(error);
}

function checkValidPrincipal(principal: Principal): boolean {
  try {
    Principal.fromText(principal.toString());
    return true;
  } catch (error) {
    console.error('Invalid principal', error);
  }
  return false;
}

function checkValidIdentity(identity: Identity): boolean {
  try {
    Principal.fromText(identity.getPrincipal().toText());
    return true;
  } catch (error) {
    console.error('Invalid identity', error);
  }
  return false;
}

function checkValidString(text: string): boolean {
  return typeof text === 'string' && text.length > 0;
}

function checkValidBoolean(bool: boolean): boolean {
  return typeof bool === 'boolean';
}

function checkValidNumber(num: number): boolean {
  return typeof num === 'number' && num >= 0;
}

function checkValidChunkSize(chunkSize: number): boolean {
  return typeof chunkSize === 'number' && chunkSize >= MIN_CHUNK_SIZE && chunkSize <= MAX_CHUNK_SIZE;
}

function checkValidBuffer(buffer: Buffer): boolean {
  return Buffer.isBuffer(buffer) && buffer.length > 0;
}

function checkValidBigint(num: bigint) {
  return typeof num === 'bigint' && num >= 0;
}

function checkValidVideoToStore(video: VideoToStore): boolean {
  if (!video.name || !checkValidString(video.name)) return false;
  if (!video.description || !checkValidString(video.description)) return false;
  if (!video.videoBuffer || !checkValidBuffer(video.videoBuffer)) return false;

  return true;
}

export function checkUpdateConfigParams(input: StorageConfig) {
  const errorMessage =
    `Invalid config object\n` +
    `Valid object properties:\n{\n  ` +
    `spawnCanisterPrincipalId: string\n  indexCanisterPrincipalId: string\n  ` +
    `chunkSize: number\n  uploadAttemptsPerChunk: number\n  storeOnIndex: boolean\n}`;

  if (input.spawnCanisterPrincipalId !== undefined) {
    try {
      Principal.fromText(input.spawnCanisterPrincipalId);
    } catch (error) {
      parameterError(errorMessage, 'spawnCanisterPrincipalId');
    }
  }
  if (input.indexCanisterPrincipalId !== undefined) {
    try {
      Principal.fromText(input.indexCanisterPrincipalId);
    } catch (error) {
      parameterError(errorMessage, 'indexCanisterPrincipalId');
    }
  }
  if (input.chunkSize !== undefined && !checkValidChunkSize(input.chunkSize)) parameterError(errorMessage, 'chunkSize');
  if (
    input.uploadAttemptsPerChunk !== undefined &&
    (!checkValidNumber(input.uploadAttemptsPerChunk) || input.uploadAttemptsPerChunk < 1)
  ) {
    parameterError(errorMessage, 'uploadAttemptsPerChunk');
  }
  if (input.storeOnIndex !== undefined && !checkValidBoolean(input.storeOnIndex))
    parameterError(errorMessage, 'storeOnIndex');
}

export function checkUploadVideoParams(input: UploadVideo): UploadVideo {
  const errorMessage =
    `Invalid parameters for method 'uploadVideo'\n` +
    `Expected input:\n{\n  ` +
    `walletId: Principal\n  identity: Identity\n  video: VideoToStore\n  cycles: bigint\n}`;

  if (!input.walletId || !checkValidPrincipal(input.walletId)) parameterError(errorMessage, 'walletId');
  if (!input.identity || !checkValidIdentity(input.identity)) parameterError(errorMessage, 'identity');
  if (!input.video || !checkValidVideoToStore(input.video)) parameterError(errorMessage, 'video');
  if (!input.cycles || !checkValidBigint(input.cycles)) parameterError(errorMessage, 'cycles');

  return input;
}

export function checkGetVideoParams(identity: Identity, principal: Principal) {
  const errorMessage = `Invalid parameters for method 'getVideo'\nExpected parameters: (identity: Identity, principal: Principal)`;

  if (!checkValidIdentity(identity)) parameterError(errorMessage, 'identity');
  if (!checkValidPrincipal(principal)) parameterError(errorMessage, 'principal');
}

export function checkChangeOwnerParams(input: ChangeOwner): ChangeOwner {
  const errorMessage =
    `Invalid parameters for method 'changeOwner'\n` +
    `Expected input:\n{\n  ` +
    `oldIdentity: Identity\n  oldWallet: Principal\n  videoPrincipal: Principal\n  newOwner: Principal\n  newOwnerWallet: Principal\n}}`;

  if (!input.oldIdentity || !checkValidIdentity(input.oldIdentity)) parameterError(errorMessage, 'oldIdentity');
  if (!input.oldWallet || !checkValidPrincipal(input.oldWallet)) parameterError(errorMessage, 'oldWallet');
  if (!input.videoPrincipal || !checkValidPrincipal(input.videoPrincipal)) {
    parameterError(errorMessage, 'videoPrincipal');
  }
  if (!input.newOwner || !checkValidPrincipal(input.newOwner)) parameterError(errorMessage, 'newOwner');
  if (!input.newOwnerWallet || !checkValidPrincipal(input.newOwnerWallet)) {
    parameterError(errorMessage, 'newOwnerWallet');
  }

  return input;
}

export function checkGetMyVideosParams(identity: Identity) {
  const errorMessage = `Invalid parameters for method 'getMyVideos'\nExpected input: (identity: Identity)`;
  if (!checkValidIdentity(identity)) parameterError(errorMessage, 'identity');
}

export function checkUpdateMetadataParams(input: UpdateMetadata): UpdateMetadata {
  const errorMessage =
    `Invalid parameters for method 'updateMetadata'\n` +
    `Expected input:\n{\n  ` +
    `principal: Principal\n  identity: Identity\n  name: string\n  description: string\n  chunkNum: number\n}`;

  if (!input.principal || !checkValidPrincipal(input.principal)) parameterError(errorMessage, 'principal');
  if (!input.identity || !checkValidIdentity(input.identity)) parameterError(errorMessage, 'identity');
  if (!input.name || !checkValidString(input.name)) parameterError(errorMessage, 'name');
  if (!input.description || !checkValidString(input.description)) parameterError(errorMessage, 'description');
  if (!input.chunkNum || !checkValidNumber(input.chunkNum)) parameterError(errorMessage, 'chunkNum');

  return input;
}

export function checkUpdateVideoParams(input: UpdateVideo): UpdateVideo {
  const errorMessage =
    `Invalid parameters for method 'updateVideo'\n` +
    `Expected input:\n{\n  ` +
    `principal: Principal\n  identity: Identity\n  videoBuffer: Buffer\n  chunkNum: number\n}`;

  if (!input.principal || !checkValidPrincipal(input.principal)) parameterError(errorMessage, 'principal');
  if (!input.identity || !checkValidIdentity(input.identity)) parameterError(errorMessage, 'identity');
  if (!input.chunkNum || !checkValidNumber(input.chunkNum)) parameterError(errorMessage, 'chunkNum');
  if (!input.videoBuffer || !checkValidBuffer(input.videoBuffer)) parameterError(errorMessage, 'videoBuffer');

  return input;
}
