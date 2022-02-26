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
dfx identity new alice
dfx identity new bob

dfx identity use alice
alice_wallet="$(dfx identity get-wallet)"

dfx identity use bob
bob_wallet="$(dfx identity get-wallet)"


#create video canister
video_principal="$(dfx canister --wallet=$bob_wallet call --with-cycles 200000000000 spawn_canister create_new_canister)"
video_principal=${video_principal%"\" })"}
video_principal=${video_principal#"(variant { created = principal \""}
echo "video canister id $video_principal"


#test video canister

dfx canister --wallet=$bob_wallet call $video_principal put_meta_info '(record {name = "test_name"; description = "test_desc"; chunk_num = 1 : nat64})'
dfx canister call $video_principal get_meta_info

dfx canister --wallet=$bob_wallet call $video_principal put_chunk '(0 : nat64, blob "\CA\FF\EE")'
dfx canister call $video_principal get_chunk '(0 : nat64)'

dfx canister --wallet=$bob_wallet call $video_principal change_owner "(principal \"$alice_wallet\")"
dfx canister --wallet=$bob_wallet call aaaaa-aa update_settings "(record { canister_id = principal \"$video_principal\"; settings = record { controller = opt principal \"$alice_wallet\"; freezing_threshold = null; controllers = null; memory_allocation = null; compute_allocation = null}})"
dfx identity use alice
dfx canister --wallet=$alice_wallet call $video_principal change_owner "(principal \"$bob_wallet\")"
dfx canister --wallet=$alice_wallet call aaaaa-aa update_settings "(record { canister_id = principal \"$video_principal\"; settings = record { controller = opt principal \"$bob_wallet\"; freezing_threshold = null; controllers = null; memory_allocation = null; compute_allocation = null}})"


#clean up
dfx identity use default
dfx identity remove alice
dfx identity remove bob
dfx stop