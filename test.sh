#!/bin/bash


#fail on error
set -e


#start replica
dfx stop
dfx start --background --clean
dfx identity use default


#create and optimize video canister
dfx canister create video_canister
dfx build video_canister
ic-cdk-optimizer target/wasm32-unknown-unknown/release/video_canister.wasm -o target/wasm32-unknown-unknown/release/video_canister_opt.wasm


#deploy spawn canister
dfx deploy spawn_canister


#create test identities with wallets

dfx identity use anonymous
anon="$(dfx identity get-principal)"
anon_wallet="$(dfx identity get-wallet)"

#create video canister
video_principal="$(dfx canister --wallet=$anon_wallet call --with-cycles 200000000000 spawn_canister create_new_canister "(principal \"$anon\")")"
video_principal=${video_principal%"\" })"}
video_principal=${video_principal#"(variant { created = principal \""}
echo "video canister id $video_principal"
dfx canister call $video_principal put_meta_info '(record {name = "test_name"; description = "test_desc"; chunk_num = 1 : nat64})'
dfx canister call $video_principal put_chunk '(0 : nat64, blob "\CA\FF\EE")'

#start package tests
pushd src/video_canister_package
npm test
popd

#clean up
dfx identity use default
dfx stop