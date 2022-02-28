import { AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { getVideo } from '../index'

test('getVideo', async () => {
    const video = await getVideo(new AnonymousIdentity, Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai"));
    
    expect(video.name).toBe('test_name');
    expect(video.videoBuffer).toStrictEqual(Buffer.from([0xCA,0xFF,0xEE]))
});