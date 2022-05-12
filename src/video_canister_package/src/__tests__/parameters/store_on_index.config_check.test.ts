// Tests that the public storage function correctly review that the parameters are provided with the right type
import { ICVideoStorage } from '../../index';

jest.setTimeout(30_000);

describe('updateConfig function parameter tests', () => {
  const storage = new ICVideoStorage();

  describe('storeOnIndex', () => {
    const errorMessage = 'Erroneous parameter: storeOnIndex';

    test('storeOnIndex not boolean', () => {
      let expectedError = false;
      try {
        //@ts-ignore to allow erroneous call
        storage.updateConfig({ storeOnIndex: 'string' });
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('set storeOnIndex to true', () => {
      storage.updateConfig({ storeOnIndex: true });
      expect(storage.config.storeOnIndex).toBe(true);
    });

    test('set storeOnIndex to false', () => {
      storage.updateConfig({ storeOnIndex: false });
      expect(storage.config.storeOnIndex).toBe(false);
    });
  });
});
