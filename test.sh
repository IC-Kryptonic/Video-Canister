#!/bin/bash

#starting replica
dfx stop
dfx start --background --clean

#set deploy identity and deploy
dfx identity use default
dfx deploy video_canister --argument '(principal "nt2mv-ogwv4-u2nul-nq2vb-vtgvp-o6p7k-a6apg-tag3u-34uf5-ditv3-zqe")'

dfx canister call video_canister put_meta_info '(record {name = "test_name"; description = "test_desc"; chunk_num = 1})'
dfx canister call video_canister get_meta_info

dfx canister call video_canister put_chunk '(0, blob "\CA\FF\EE")'
dfx canister call video_canister get_chunk '(0)'

dfx canister call video_canister change_owner '(principal "nq6bu-anrhp-5mlmm-7y4nh-avvdn-e56p6-5srxc-gol7n-hag25-iqlmr-cae")'
dfx identity use Miles
dfx canister call video_canister change_owner '(principal "nt2mv-ogwv4-u2nul-nq2vb-vtgvp-o6p7k-a6apg-tag3u-34uf5-ditv3-zqe")'
dfx identity use default