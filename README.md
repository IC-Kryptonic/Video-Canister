Disclaimer: This project & read-me is a WIP!!

# Decentralized Video Storage and Streaming on the Internet Computer

The mission of the Kryptonic project is to bring an easy solution to store and stream videos on the Internet Computer Blockchain. The project was developed in collaboration with the DFINITY team and supported with a 5k Grant.

# How you can use it

You have two options to directly use our API in your projects. You can directly integrate it using the related NPM package or you can use the source code from this repository directly in your application. Of course you are welcome to contribute and improve our solution by creating issues and PRs.

# Design Goals

Our motivation to build this API was the possibility to finally store assets directly on a Blockchain without media breaks on the DFINITY Internet Computer. However, figuring out how to store the asset in the best way on every new project is cumbersome. We wanted to give developers that work on applications with videos the opportunity to kickstart their project by benefitting on our work either by directly integrating our NPM package or using snippets from our source code. Further, we wanted to create a solution that works well with NFTs because many applications are currently build in the field of non-fungible tokens.

# Architecture

Our solution consists of four components:

- Video Canister: For each uploaded video, one Video Canister is created that stores the meta information and the video data itself
- Spawn Canister: This is the primary canister that the NPM package talks to in order to encapsulate the creation and installation of video canisters on the Internet Computer
- Index Canister: You can use this canister optionally with the NPM package in order to store which creator uploaded which video. For example, a canister like this would be useful if you built an application where you want to query all videos that a specific creator uploaded
- NPM package: The NPM package is available here (TODO). It allows you to easily integrate our streaming and storage API in your DAPP. Further information on the functions that the package exports are listed below

# User Actions

We define the following four main user actions for our API:

1. Uploading a video:
   ![](https://github.com/IC-Kryptonic/Video-Canister/blob/master/docs/diagrams/src/upload_video.png?raw=true)

#

2. Streaming / Getting a video:

![](https://github.com/IC-Kryptonic/Video-Canister/blob/master/docs/diagrams/src/get_video.png?raw=true)

#

3. Getting the principals (the smart contract identifier) for all uploaded videos from a specific creator:

![](https://github.com/IC-Kryptonic/Video-Canister/blob/master/docs/diagrams/src/get_my_videos.png?raw=true)

#

4. Changing the owner of a video. Technically, this means that the owner of the Smart Contract that a video is stored in is changed. This is useful if you use the video storage for NFTs, because if you transfer a token representing a video, the new token owner should also control the stored video:

![](https://github.com/IC-Kryptonic/Video-Canister/blob/master/docs/diagrams/src/change_owner.png?raw=true)

# Getting started

## Local development

### Prerequisites:

Follow [this](https://smartcontracts.org/docs/rust-guide/rust-quickstart.html) DFINITY tutorial to set up a local Internet Computer Replica.

### Installing the dependencies:

Run `npm install` in the following directories:

- `Video-Canister/`
- `Video-Canister/src/video_canister_package/`

### Deploying the Spawn Canister on the local replica

Run `./deploy.sh` in the root directory.

## Integrating our npm package

Install the `TODO :)` dependency through npm.

Then you can import the following functions from the package:

1. Upload a video

```
function uploadVideo(
  identity: Identity,
  walletId: Principal,
  video: VideoToStore,
  cycles: bigint,
)
```

2. Stream a video

```
function getVideo(
  identity: Identity,
  principal: Principal
): Promise<Video>
```

3. Change the owner of a video

```
function changeOwner(
  oldIdentity: Identity,
  oldWallet: Principal,
  videoPrincipal: Principal,
  newOwner: Principal,
  newOwnerWallet: Principal,
)
```
