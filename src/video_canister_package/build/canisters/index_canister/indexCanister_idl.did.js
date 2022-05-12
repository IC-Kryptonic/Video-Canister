"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idlFactory = void 0;
/* tslint:disable */
// @ts-ignore
const idlFactory = ({ IDL }) => {
    return IDL.Service({
        get_my_videos: IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Principal))], ['query']),
        post_video: IDL.Func([IDL.Principal], [], []),
    });
};
exports.idlFactory = idlFactory;
