// Tests that the public storage function correctly review that the parameters are provided with the right type
import { ICVideoStorage } from '../../../index';

jest.setTimeout(30_000);

describe('updateConfig function parameter tests', () => {
  const storage = new ICVideoStorage();

  describe('indexCanisterPrincipalId', () => {
    const errorMessage = 'Erroneous parameter: indexCanisterPrincipalId';

    test('indexCanisterPrincipalId not string', () => {
      let expectedError = false;
      try {
        //@ts-ignore to allow erroneous call
        storage.updateConfig({ indexCanisterPrincipalId: 0 });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('indexCanisterPrincipalId random string ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ indexCanisterPrincipalId: 'string' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('indexCanisterPrincipalId flawed canister id ', () => {
      let expectedError = false;
      try {
        storage.updateConfig({ indexCanisterPrincipalId: 'rno2w-sqaaa-aaaaa-aaacq-cki' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('indexCanisterPrincipalId valid canister id ', () => {
      const indexCanisterPrincipalId = 'rno2w-sqaaa-aaaaa-aaacq-cai';
      storage.updateConfig({ indexCanisterPrincipalId });
      expect(storage.config.indexCanisterPrincipalId).toBe(indexCanisterPrincipalId);
    });
  });
});
