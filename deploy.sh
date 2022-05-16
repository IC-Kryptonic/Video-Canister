#!/bin/bash

#starting replica
dfx stop
dfx start --background --clean

#create and optimize video canister
dfx canister create video_canister
dfx build video_canister

#deploy spawn canister
dfx deploy spawn_canister

#deploy index canister
dfx deploy index_canister