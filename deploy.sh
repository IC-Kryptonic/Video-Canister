#!/bin/bash

#starting replica
dfx stop
dfx start --background --clean

#create and optimize video canister
dfx canister create video_canister
dfx build video_canister
ic-cdk-optimizer target/wasm32-unknown-unknown/release/video_canister.wasm -o target/wasm32-unknown-unknown/release/video_canister_opt.wasm

#deploy spawn canister
dfx deploy spawn_canister