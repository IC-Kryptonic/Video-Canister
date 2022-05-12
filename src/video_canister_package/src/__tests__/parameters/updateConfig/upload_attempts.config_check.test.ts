// Tests that the public storage function correctly review that the parameters are provided with the right type
import { ICVideoStorage } from '../../../index';

jest.setTimeout(30_000);

describe('updateConfig function parameter tests', () => {
  const storage = new ICVideoStorage();

  describe('uploadAttemptsPerChunk', () => {
    const errorMessage = 'Erroneous parameter: uploadAttemptsPerChunk';

    test('uploadAttemptsPerChunk not number', () => {
      let expectedError = false;
      try {
        //@ts-ignore to allow erroneous call
        storage.updateConfig({ uploadAttemptsPerChunk: 'string' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('uploadAttemptsPerChunk < 0 ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ uploadAttemptsPerChunk: -1 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('uploadAttemptsPerChunk === 0 ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ uploadAttemptsPerChunk: 0 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('uploadAttemptsPerChunk > 0 ', () => {
      const uploadAttemptsPerChunk = 1;
      storage.updateConfig({ uploadAttemptsPerChunk });
      expect(storage.config.uploadAttemptsPerChunk).toBe(uploadAttemptsPerChunk);
    });
  });
});
