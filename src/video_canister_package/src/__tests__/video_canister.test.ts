import { AnonymousIdentity, CanisterSettings } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { getManagementCanisterActor } from '../common';
import { CreationVideo, getVideo, uploadVideo } from '../index'

jest.setTimeout(20_000);

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

    //const managementActor = await getManagementCanisterActor(anon);

//    let status = await managementActor.canister_status(principal);

    //expect(status.controller[0]?.toString).toBe(anon.getPrincipal.toString);
});