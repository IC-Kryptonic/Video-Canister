// Tests that the public storage function correctly review that the parameters are provided with the right type
import { AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { checkGetVideoParams } from '../../../parameter-check';

jest.setTimeout(30_000);

describe('getVideo function parameter tests', () => {
  const anon = new AnonymousIdentity();
  const anonWalletPrincipal = 'rno2w-sqaaa-aaaaa-aaacq-cai';
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  describe('principal', () => {
    const errorMessage = 'Erroneous parameter: principal';

    test('principal not Principal', () => {
      let expectedError = false;
      try {
        // @ts-ignore to allow erroneous parameter
        checkGetVideoParams(anon, 'test');
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid principal', () => {
      checkGetVideoParams(anon, anonWallet);
    });
  });
});
