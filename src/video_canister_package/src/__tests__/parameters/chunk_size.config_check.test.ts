// Tests that the public storage function correctly review that the parameters are provided with the right type
import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE } from '../../constants';
import { ICVideoStorage } from '../../index';

jest.setTimeout(30_000);

describe('updateConfig function parameter tests', () => {
  const storage = new ICVideoStorage();

  describe('chunkSize', () => {
    const errorMessage = 'Erroneous parameter: chunkSize';

    test('chunkSize not number', () => {
      let expectedError = false;
      try {
        //@ts-ignore to allow erroneous call
        storage.updateConfig({ chunkSize: 'string' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('chunkSize < 0 ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ chunkSize: -1 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('chunkSize === 0 ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ chunkSize: 0 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('chunkSize === MIN_CHUNK_SIZE ', () => {
      const chunkSize = MIN_CHUNK_SIZE;
      storage.updateConfig({ chunkSize });
      expect(storage.config.chunkSize).toBe(chunkSize);
    });

    test('chunkSize > MIN_CHUNK_SIZE ', () => {
      const chunkSize = MIN_CHUNK_SIZE + 1;
      storage.updateConfig({ chunkSize });
      expect(storage.config.chunkSize).toBe(chunkSize);
    });

    test('chunkSize === MAX_CHUNK_SIZE ', () => {
      const chunkSize = MAX_CHUNK_SIZE;
      storage.updateConfig({ chunkSize });
      expect(storage.config.chunkSize).toBe(chunkSize);
    });

    test('chunkSize > MAX_CHUNK_SIZE ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ chunkSize: MAX_CHUNK_SIZE + 1 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });
  });
});
