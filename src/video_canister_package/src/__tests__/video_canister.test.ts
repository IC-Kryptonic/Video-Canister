import { AnonymousIdentity} from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Secp256k1KeyIdentity } from '@dfinity/identity';
import { CreationVideo, getVideo, uploadVideo, changeOwner} from '../index';

jest.setTimeout(20_000);

const videoCanisterVersion = 0n;

test('getVideo', async () => {
    const video = await getVideo(new AnonymousIdentity, Principal.fromText("rno2w-sqaaa-aaaaa-aaacq-cai"));
    
    expect(video.name).toBe('test_name');
    expect(video.videoBuffer).toStrictEqual(Buffer.from([0xCA,0xFF,0xEE]))
});

test('createVideo', async () => {

    const video: CreationVideo = {
        "name": "test1",
        "description": "this is a desc",
        "videoBuffer": Buffer.from([0xCA,0xFF,0xEE])
    }

    const anon = new AnonymousIdentity();
    const anonWallet = Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai");

    const creationCycles: bigint = BigInt(200_000_000_000);

    const principal: Principal = await uploadVideo(anon, anonWallet, video, creationCycles);

    const uploadedVideo = await getVideo(anon, principal);

    expect(uploadedVideo.name).toBe(video.name);
    expect(uploadedVideo.description).toBe(video.description);
    expect(uploadedVideo.videoBuffer).toStrictEqual(video.videoBuffer);
    expect(uploadedVideo.owner).toStrictEqual(anon.getPrincipal());
    expect(uploadedVideo.version).toStrictEqual(videoCanisterVersion);
});

test('changeOwner', async () => {
    const video: CreationVideo = {
        "name": "test1",
        "description": "this is a desc",
        "videoBuffer": Buffer.from([0xCA,0xFF,0xEE])
    }

    const anon = new AnonymousIdentity();
    const anonWallet = Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai");

    const creationCycles: bigint = BigInt(200_000_000_000);

    const videoPrincipal: Principal = await uploadVideo(anon, anonWallet, video, creationCycles);

    const newOwnerIdentity = Secp256k1KeyIdentity.generate();
    const newOwner = newOwnerIdentity.getPrincipal();
    const newOwnerWallet = Secp256k1KeyIdentity.generate().getPrincipal(); //Just for testing, of course the newOwner doesn't have access to the Wallet and behind the principal is no actual wallet but that doesn't matter for the test

    await changeOwner(anon, anonWallet, videoPrincipal, newOwner, newOwnerWallet);

    const uploadedVideo = await getVideo(anon, videoPrincipal);

    expect(uploadedVideo.owner).toStrictEqual(newOwner);

    //TODO how to test this?
    //expect(controllers.len()).toStrictEqual(1);
    //expect(controllers[0]).toStrictEqual(newOwnerWallet);
});