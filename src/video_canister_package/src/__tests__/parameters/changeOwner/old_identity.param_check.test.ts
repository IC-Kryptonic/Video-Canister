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

  describe('oldIdentity', () => {
    const errorMessage = 'Erroneous parameter: oldIdentity';

    test('oldIdentity missing', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      delete changeOwner.oldIdentity;
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('oldIdentity not Identity', () => {
      let expectedError = false;
      // @ts-ignore to allow erroneous parameter
      changeOwner.oldIdentity = 'test';
      try {
        checkChangeOwnerParams(changeOwner);
      } catch (error) {
        if (String(error).includes(errorMessage)) {
          expectedError = true;
        }
      }
      expect(expectedError).toBe(true);
    });

    test('valid oldIdentity', () => {
      checkChangeOwnerParams(changeOwner);
    });
  });
});
