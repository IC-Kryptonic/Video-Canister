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

  describe('newOwnerWallet', () => {
    const errorMessage = 'Erroneous parameter: newOwnerWallet';

    test('newOwnerWallet missing', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete changeOwner.newOwnerWallet;
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('newOwnerWallet not Principal', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      changeOwner.newOwnerWallet = 'test';
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid newOwnerWallet', () => {
      checkChangeOwnerParams(changeOwner);
    });
  });
});
