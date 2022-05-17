// these are only very basic tests
// see more tests here https://github.com/IC-Kryptonic/Video-Canister-Tests

import { AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { ICVideoStorage } from '../index';
import { StorageConfig, VideoToStore } from '../interfaces';

jest.setTimeout(30_000);

const videoCanisterVersion = 0n;

const anonWalletPrincipal = 'rno2w-sqaaa-aaaaa-aaacq-cai';
const videoCanisterPrincipal = 'renrk-eyaaa-aaaaa-aaada-cai';

const testConfig: StorageConfig = {
  spawnCanisterPrincipalId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  indexCanisterPrincipalId: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
  host: 'http://127.0.0.1:8000/',
};

test('initStorage', async () => {
  const expectedStoreOnIndex = false;
  const storage = new ICVideoStorage({ ...testConfig, storeOnIndex: expectedStoreOnIndex });

  expect(storage.config.storeOnIndex).toBe(expectedStoreOnIndex);
});

test('getVideo', async () => {
  const storage = new ICVideoStorage(testConfig);
  const video = await storage.getVideo(Principal.fromText(videoCanisterPrincipal));

  expect(video.name).toBe('test_name');
  expect(video.videoBuffer).toStrictEqual(Buffer.from([0xca, 0xff, 0xee]));
});

test('createVideo', async () => {
  const storage = new ICVideoStorage({ ...testConfig, storeOnIndex: false });
  const video: VideoToStore = {
    name: 'test1',
    description: 'this is a desc',
    videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
  };

  const anon = new AnonymousIdentity();
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  const cycles: bigint = BigInt(200_000_000_000);
  const principal: Principal = await storage.uploadVideo({
    identity: anon,
    walletId: anonWallet,
    video,
    cycles,
  });

  const uploadedVideo = await storage.getVideo(principal);

  expect(uploadedVideo.name).toBe(video.name);
  expect(uploadedVideo.description).toBe(video.description);
  expect(uploadedVideo.videoBuffer).toStrictEqual(video.videoBuffer);
  expect(uploadedVideo.owner).toStrictEqual(anon.getPrincipal());
  expect(uploadedVideo.version).toStrictEqual(videoCanisterVersion);
});

test('changeOwner', async () => {
  const storage = new ICVideoStorage({ ...testConfig, storeOnIndex: false });
  const video: VideoToStore = {
    name: 'test1',
    description: 'this is a desc',
    videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
  };

  const anon = new AnonymousIdentity();
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  const cycles: bigint = BigInt(300_000_000_000);

  const videoPrincipal: Principal = await storage.uploadVideo({
    identity: anon,
    walletId: anonWallet,
    video,
    cycles,
  });

  const newOwnerIdentity = Secp256k1KeyIdentity.generate();
  const newOwner = newOwnerIdentity.getPrincipal();
  const newOwnerWallet = Secp256k1KeyIdentity.generate().getPrincipal(); //Just for testing, of course the newOwner doesn't have access to the Wallet and behind the principal is no actual wallet but that doesn't matter for the test

  await storage.changeOwner({
    oldIdentity: anon,
    oldWallet: anonWallet,
    videoPrincipal,
    newOwner,
    newOwnerWallet,
  });

  const uploadedVideo = await storage.getVideo(videoPrincipal);

  expect(uploadedVideo.owner).toStrictEqual(newOwner);
});

test('indexVideo', async () => {
  const storage = new ICVideoStorage(testConfig);
  const video: VideoToStore = {
    name: 'test1',
    description: 'this is a desc',
    videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
  };

  const anon = new AnonymousIdentity();
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  const cycles: bigint = BigInt(200_000_000_000);

  const videoPrincipal: Principal = await storage.uploadVideo({
    identity: anon,
    walletId: anonWallet,
    video,
    cycles,
  });

  const myVideos: Principal[] = await storage.getMyVideos(anon);

  expect(myVideos.length).toBe(1);
  expect(myVideos[0]).toStrictEqual(videoPrincipal);
});
