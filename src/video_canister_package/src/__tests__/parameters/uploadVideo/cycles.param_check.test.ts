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

  let videoToStore: VideoToStore = {
    name: 'name',
    description: 'description',
    videoBuffer: Buffer.from([0, 1]),
  };

  let input: UploadVideo = {
    identity: anon,
    walletId: anonWallet,
    video: videoToStore,
    cycles: BigInt(5000),
  };

  beforeEach(() => {
    videoToStore = {
      name: 'name',
      description: 'description',
      videoBuffer: Buffer.from([0, 1]),
    };
    input = { identity: anon, walletId: anonWallet, video: videoToStore, cycles: BigInt(5000) };
  });

  describe('cycles', () => {
    const errorMessage = 'Erroneous parameter: cycles';

    test('cycles not bigint', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.cycles = 50;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('cycles < 0', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.cycles = BigInt(-50);
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid cycles', () => {
      checkUploadVideoParams(input);
    });
  });
});
