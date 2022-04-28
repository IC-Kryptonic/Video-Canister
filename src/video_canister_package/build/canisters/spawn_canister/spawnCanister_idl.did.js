"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idlFactory = void 0;
/* tslint:disable */
// @ts-ignore
const idlFactory = ({ IDL }) => {
    const CreateCanisterResponse = IDL.Variant({
        created: IDL.Principal,
        insufficient_funds: IDL.Null,
        canister_installation_error: IDL.Null,
        change_controller_error: IDL.Null,
        canister_creation_error: IDL.Null,
    });
    return IDL.Service({
        create_new_canister: IDL.Func([], [CreateCanisterResponse], []),
    });
};
exports.idlFactory = idlFactory;
