import { AnonymousIdentity, CanisterSettings } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { getManagementCanisterActor } from '../common';
import { CreationVideo, getVideo, uploadVideo } from '../index';

jest.setTimeout(20_000);

const videoCanisterVersion = 0n;

test('getVideo', async () => {
    const video = await getVideo(new AnonymousIdentity, Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"));
    
    expect(video.name).toBe('test_name');
    expect(video.videoBuffer).toStrictEqual(Buffer.from([0xCA,0xFF,0xEE]))
});

test('createVideo', async () =>{

    const video: CreationVideo = {
        "name": "test1",
        "description": "this is a desc",
        "videoBuffer": Buffer.from([0xCA,0xFF,0xEE])
    }

    const anon = new AnonymousIdentity();
    const anonWallet = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai");

    const creationCycles: bigint = BigInt(200_000_000_000);

    const principal: Principal = await uploadVideo(anon, anonWallet, video, creationCycles);

    const uploadedVideo = await getVideo(anon, principal);

    expect(uploadedVideo.name).toBe(video.name);
    expect(uploadedVideo.description).toBe(video.description);
    expect(uploadedVideo.videoBuffer).toStrictEqual(video.videoBuffer);
    expect(uploadedVideo.owner).toStrictEqual(anon.getPrincipal());
    expect(uploadedVideo.version).toStrictEqual(videoCanisterVersion);
});