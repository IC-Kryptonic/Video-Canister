"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("@dfinity/agent");
const principal_1 = require("@dfinity/principal");
const identity_1 = require("@dfinity/identity");
const index_1 = require("../index");
jest.setTimeout(30000);
const videoCanisterVersion = 0n;
const anonWalletPrincipal = 'rno2w-sqaaa-aaaaa-aaacq-cai';
test('initStorage', async () => {
    const expectedStoreOnIndex = false;
    const storage = new index_1.ICVideoStorage({ storeOnIndex: expectedStoreOnIndex });
    expect(storage.config.storeOnIndex).toBe(expectedStoreOnIndex);
});
test('getVideo', async () => {
    const storage = new index_1.ICVideoStorage();
    const video = await storage.getVideo(new agent_1.AnonymousIdentity(), principal_1.Principal.fromText('renrk-eyaaa-aaaaa-aaada-cai'));
    expect(video.name).toBe('test_name');
    expect(video.videoBuffer).toStrictEqual(Buffer.from([0xca, 0xff, 0xee]));
});
test('createVideo', async () => {
    const storage = new index_1.ICVideoStorage({ storeOnIndex: false });
    const video = {
        name: 'test1',
        description: 'this is a desc',
        videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
    };
    const anon = new agent_1.AnonymousIdentity();
    const anonWallet = principal_1.Principal.fromText(anonWalletPrincipal);
    const creationCycles = BigInt(200000000000);
    const principal = await storage.uploadVideo(anon, anonWallet, video, creationCycles);
    const uploadedVideo = await storage.getVideo(anon, principal);
    expect(uploadedVideo.name).toBe(video.name);
    expect(uploadedVideo.description).toBe(video.description);
    expect(uploadedVideo.videoBuffer).toStrictEqual(video.videoBuffer);
    expect(uploadedVideo.owner).toStrictEqual(anon.getPrincipal());
    expect(uploadedVideo.version).toStrictEqual(videoCanisterVersion);
});
test('changeOwner', async () => {
    const storage = new index_1.ICVideoStorage({ storeOnIndex: false });
    const video = {
        name: 'test1',
        description: 'this is a desc',
        videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
    };
    const anon = new agent_1.AnonymousIdentity();
    const anonWallet = principal_1.Principal.fromText(anonWalletPrincipal);
    const creationCycles = BigInt(300000000000);
    const videoPrincipal = await storage.uploadVideo(anon, anonWallet, video, creationCycles);
    const newOwnerIdentity = identity_1.Secp256k1KeyIdentity.generate();
    const newOwner = newOwnerIdentity.getPrincipal();
    const newOwnerWallet = identity_1.Secp256k1KeyIdentity.generate().getPrincipal(); //Just for testing, of course the newOwner doesn't have access to the Wallet and behind the principal is no actual wallet but that doesn't matter for the test
    await storage.changeOwner(anon, anonWallet, videoPrincipal, newOwner, newOwnerWallet);
    const uploadedVideo = await storage.getVideo(anon, videoPrincipal);
    expect(uploadedVideo.owner).toStrictEqual(newOwner);
    //TODO how to test this?
    //expect(controllers.len()).toStrictEqual(1);
    //expect(controllers[0]).toStrictEqual(newOwnerWallet);
});
test('indexVideo', async () => {
    const storage = new index_1.ICVideoStorage();
    const video = {
        name: 'test1',
        description: 'this is a desc',
        videoBuffer: Buffer.from([0xca, 0xff, 0xee]),
    };
    const anon = new agent_1.AnonymousIdentity();
    const anonWallet = principal_1.Principal.fromText(anonWalletPrincipal);
    const creationCycles = BigInt(200000000000);
    const videoPrincipal = await storage.uploadVideo(anon, anonWallet, video, creationCycles);
    const myVideos = await storage.getMyVideos(anon);
    expect(myVideos.length).toBe(1);
    expect(myVideos[0]).toStrictEqual(videoPrincipal);
});
