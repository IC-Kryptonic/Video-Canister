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

  describe('video', () => {
    const errorMessage = 'Erroneous parameter: video';

    test('video not object', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.video = '53w5';
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object missing name', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete input.video.name;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object name not string', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.video.name = 2;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object missing description', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete input.video.description;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object description not string', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.video.description = 2;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object missing videoBuffer', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete input.video.videoBuffer;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object name not Buffer', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      input.video.videoBuffer = 2;
      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('video object name empty Buffer', () => {
      let expectedError = false;
      input.video.videoBuffer = Buffer.from([]);

      try {
        checkUploadVideoParams(input);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid videoToStore', () => {
      input.video = videoToStore;
      checkUploadVideoParams(input);
    });
  });
});
