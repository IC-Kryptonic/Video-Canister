#!/bin/bash

dfx build video_canister
# TODO check if this step is not already executed when building the video_canister
ic-cdk-optimizer target/wasm32-unknown-unknown/release/video_canister.wasm -o target/wasm32-unknown-unknown/release/video_canister_opt.wasm

# deploy spawn canister
dfx deploy --network ic spawn_canister --with-cycles=200000000000

# deploy index canister
dfx deploy --network ic index_canister --with-cycles=200000000000

