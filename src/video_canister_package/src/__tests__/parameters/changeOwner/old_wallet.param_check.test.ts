// Tests that the public storage function correctly review that the parameters are provided with the right type
import { AnonymousIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { ChangeOwner } from '../../../interfaces';
import { checkChangeOwnerParams } from '../../../parameter-check';

jest.setTimeout(30_000);

describe('changeOwner function parameter tests', () => {
  const anon = new AnonymousIdentity();
  const anonWalletPrincipal = 'rno2w-sqaaa-aaaaa-aaacq-cai';
  const anonWallet = Principal.fromText(anonWalletPrincipal);

  let changeOwner: ChangeOwner = {
    oldIdentity: anon,
    oldWallet: anonWallet,
    videoPrincipal: anonWallet,
    newOwner: anonWallet,
    newOwnerWallet: anonWallet,
  };

  beforeEach(() => {
    changeOwner = {
      oldIdentity: anon,
      oldWallet: anonWallet,
      videoPrincipal: anonWallet,
      newOwner: anonWallet,
      newOwnerWallet: anonWallet,
    };
  });

  describe('oldWallet', () => {
    const errorMessage = 'Erroneous parameter: oldWallet';

    test('oldWallet missing', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete changeOwner.oldWallet;
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('oldWallet not Principal', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      changeOwner.oldWallet = 'test';
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid oldWallet', () => {
      checkChangeOwnerParams(changeOwner);
    });
  });
});
