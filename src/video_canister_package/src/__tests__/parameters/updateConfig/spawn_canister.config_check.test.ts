// Tests that the public storage function correctly review that the parameters are provided with the right type
import { ICVideoStorage } from '../../../index';

jest.setTimeout(30_000);

describe('updateConfig function parameter tests', () => {
  const storage = new ICVideoStorage();

  describe('spawnCanisterPrincipalId', () => {
    const errorMessage = 'Erroneous parameter: spawnCanisterPrincipalId';

    test('spawnCanisterPrincipalId not string', () => {
      let expectedError = false;
      try {
        //@ts-ignore to allow erroneous call
        storage.updateConfig({ spawnCanisterPrincipalId: 0 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('spawnCanisterPrincipalId random string ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ spawnCanisterPrincipalId: 'string' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('spawnCanisterPrincipalId flawed canister id ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ spawnCanisterPrincipalId: 'rno2w-sqaaa-aaaaa-aaacq-cki' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('spawnCanisterPrincipalId valid canister id ', () => {
      const spawnCanisterPrincipalId = 'rno2w-sqaaa-aaaaa-aaacq-cai';
      storage.updateConfig({ spawnCanisterPrincipalId });
      expect(storage.config.spawnCanisterPrincipalId).toBe(spawnCanisterPrincipalId);
    });
  });
});
