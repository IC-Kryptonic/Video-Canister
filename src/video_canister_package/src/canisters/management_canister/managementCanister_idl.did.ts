/* tslint:disable */
// @ts-ignore
export const idlFactory = ({ IDL }) => {
  const canister_settings = IDL.Record({
    'controller' : IDL.Opt(IDL.Principal),
  });
  return IDL.Service({
    'canister_status' : IDL.Func([IDL.Record({ canister_id: IDL.Principal })], [canister_settings], []),
  });
};