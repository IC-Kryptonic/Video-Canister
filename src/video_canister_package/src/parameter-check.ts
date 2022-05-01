import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE } from './constants';
import { UpdateMetadata, UpdateVideo } from './interfaces';

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

function checkValidChunkNum(chunkNum: number): boolean {
  return typeof chunkNum === 'number' && chunkNum >= MIN_CHUNK_SIZE && chunkNum <= MAX_CHUNK_SIZE;
}

function checkValidBuffer(buffer: Buffer): boolean {
  return Buffer.isBuffer(buffer) && buffer.length > 0;
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
  if (!input.chunkNum || !checkValidChunkNum(input.chunkNum)) parameterError(errorMessage, 'chunkNum');

  return input;
}

export function checkUpdateVideoParams(input: UpdateVideo): UpdateVideo {
  const errorMessage =
    `Invalid parameters for method 'updateVideo'\n` +
    `Expected input:\n{\n  ` +
    `principal: Principal\n  identity: Identity\n  videoBuffer: Buffer\n  chunkNum: number\n}`;

  if (!input.principal || !checkValidPrincipal(input.principal)) parameterError(errorMessage, 'principal');
  if (!input.identity || !checkValidIdentity(input.identity)) parameterError(errorMessage, 'identity');
  if (!input.chunkNum || !checkValidChunkNum(input.chunkNum)) parameterError(errorMessage, 'chunkNum');
  if (!input.videoBuffer || !checkValidBuffer(input.videoBuffer)) parameterError(errorMessage, 'videoBuffer');

  return input;
}
