// Tests that the public storage function correctly review that the parameters are provided with the right type
import { AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { UploadVideo, VideoToStore } from '../../../interfaces';
import { checkUploadVideoParams } from '../../../parameter-check';

jest.setTimeout(30_000);

describe('uploadVideo function parameter tests', () => {
  const anon = new AnonymousIdentity();
  const anonWalletPrincipal = 'rno2w-sqaaa-aaaaa-aaacq-cai';
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  const videoToStore: VideoToStore = {
    name: 'name',
    description: 'description',
    videoBuffer: Buffer.from([0, 1]),
  };

  const input: UploadVideo = {
    identity: anon,
    walletId: anonWallet,
    video: videoToStore,
    cycles: BigInt(5000),
  };

  describe('identity', () => {
    const errorMessage = 'Erroneous parameter: identity';

    test('identity not Identity', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.identity = 0;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid identity', () => {
      input.identity = anon;
      checkUploadVideoParams(input);
    });
  });
});
