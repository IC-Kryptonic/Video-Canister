"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idlFactory = void 0;
/* tslint:disable */
// @ts-ignore
const idlFactory = ({ IDL }) => {
    const ChangeOwnerResponse = IDL.Variant({
        'missing_rights': IDL.Null,
        'success': IDL.Null,
    });
    const Chunk = IDL.Vec(IDL.Nat8);
    const MetaInfo = IDL.Record({
        'owner': IDL.Principal,
        'name': IDL.Text,
        'description': IDL.Text,
        'version': IDL.Nat64,
        'chunk_num': IDL.Nat64,
    });
    const PutChunkResponse = IDL.Variant({
        'out_of_bounds': IDL.Null,
        'missing_rights': IDL.Null,
        'success': IDL.Null,
    });
    const PutMetaInfo = IDL.Record({
        name: IDL.Opt(IDL.Text),
        description: IDL.Opt(IDL.Text),
        chunk_num: IDL.Opt(IDL.Nat64),
    });
    const PutMetaInfoResponse = IDL.Variant({
        'missing_rights': IDL.Null,
        'success': IDL.Null,
    });
    return IDL.Service({
        'change_owner': IDL.Func([IDL.Principal], [ChangeOwnerResponse], []),
        'get_chunk': IDL.Func([IDL.Nat64], [IDL.Opt(Chunk)], ['query']),
        'get_meta_info': IDL.Func([], [MetaInfo], ['query']),
        'put_chunk': IDL.Func([IDL.Nat64, Chunk], [PutChunkResponse], []),
        'put_meta_info': IDL.Func([PutMetaInfo], [PutMetaInfoResponse], []),
    });
};
exports.idlFactory = idlFactory;
