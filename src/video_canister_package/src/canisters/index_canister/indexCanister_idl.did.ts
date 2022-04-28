/* tslint:disable */
// @ts-ignore
export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    get_my_videos : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(IDL.Principal))],
        ['query'],
      ),
    post_video : IDL.Func([IDL.Principal], [], []),
  });
};