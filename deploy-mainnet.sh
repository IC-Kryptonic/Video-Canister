#!/bin/bash

dfx build video_canister

# deploy spawn canister
dfx deploy --network ic spawn_canister --with-cycles=200000000000

# deploy index canister
dfx deploy --network ic index_canister --with-cycles=200000000000

