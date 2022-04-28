# !!Disclaimer: This project & read-me is a WIP!!

# General Project Information

The mission of the Kryptonic project is to provide an easy solution for storing and streaming videos on the Internet Computer Blockchain. The project was developed in collaboration with the DFINITY team and supported with a 5k Grant.

# Structure of this Readme

[Documentation of the NPM package](#using-the-npm-package)

[Documentation of the overall project](#decentralized-video-storage-and-streaming-on-the-internet-computer)

# Using the NPM Package

## Feature Overview

This package allows you to:

- Upload videos in the .mp4 format to the Internet Computer Blockchain
- Download videos stored on the Internet Computer Blockchain
- Retreive the location of stored videos for a specific user from an index canister
- Change the owner of a video

## Getting Started

### Install the Package

`npm install ic-video-storage`

### Initialize a Storage Object in Your Application

```
import { ICVideoStorage } from 'ic-video-storage';

// TODO: Replace the following with your project configuration
const storageConfig = {
  //...
};

const storage = new ICVideoStorage(storageConfig);
```

### Adjust the Storage Config

The storage config comprises the following parameters. If you do not intend to change any default parameters, you don't need to provide a config object when initializing the storage object.

| Parameter name         | Parameter Type | Default Value               | Purpose                                                                                 |
| ---------------------- | -------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| spawnCanisterPrincipal | String         | ryjl3-tyaaa-aaaaa-aaaba-cai | On-chain location of the spawn canister used to create video canisters                  |
| indexCanisterPrincipal | String         | rkp4c-7iaaa-aaaaa-aaaca-cai | On-chain location of the index canister used to remember the location of created videos |
| storeOnIndex           | boolean        | true                        | Determines if location of created video canister is remembered in index canister        |
| chunkSize              | number         | 1024                        | Size of the chunks that an uploaded video is split into in bytes (< 2MB)                |
|                        |                |                             |

**! Important:** Both default values for the spawn and the index canister are valid canister adresses of decentralized smart contracts that were deployed to be used with this package. Only overwrite these values if you want to deploy independent spawn / index canisters that are controlled by you.

### Uploading a Video

```
import { VideoToStore } from 'ic-video-storage';

//...

const file: Buffer  =  await  fs.promises.readFile(path);

const  video: VideoToStore = {
  name:  'My Favourite Video',
  description:  'Memories from 2021',
  videoBuffer:  file,
};

// ATTENTION: Replace identity and wallet
const  anon = new  AnonymousIdentity();
const  anonWallet = Principal.fromText(anonWalletPrincipal);

const  cycles: bigint = BigInt(200_000_000_000);


// the returned principal is the location of the created video canister contract
const  principal: Principal = await storage.uploadVideo(
  anon,                  // type: Identity
  anonWallet,            // type: Principal
  video,                 // type: VideoToStore
  cycles				 // type: BigInt
);
```

### Streaming a Video with Known Location

```
// REPLACE: storage location of the video
const principal: Principal = Principal.fromText('renrk-eyaaa-aaaaa-aaada-cai')

// REPLACE: identity that was used to store the video
const identity: Identity = new AnonymousIdentity();


const video: Video = await storage.getVideo(
  identity,
  principal
);

/*
* type Video:
*	name: string
*	description: string
*	version: bigint
*	owner: Principal
*	videoBuffer: Buffer
*/
```

### Querying the Uploaded Videos Remembered in the Index Canister for a Specific User

```
// REPLACE: identity of the user
const identity: Identity = new AnonymousIdentity();

const  myVideos: Principal[] = await  storage.getMyVideos(identity);
```

### Transferring the Ownership of a Video (Canister)

```
await  storage.changeOwner(
  prevOwner,				// type: Identity
  prewOwnerWallet,			// type: Principal
  storedVideo, 				// type: Principal
  newOwner, 				// type: Identity
  newOwnerWallet			// type: Principal
 );
```

# Decentralized Video Storage and Streaming on the Internet Computer

## Design Goals

Our motivation to build this API was the possibility to finally store assets directly on a Blockchain without media breaks on the DFINITY Internet Computer. However, figuring out how to store the asset in the best way on every new project is cumbersome. We wanted to give developers that work on applications with videos the opportunity to kickstart their project by benefitting on our work either by directly integrating our NPM package or using snippets from our source code. Further, we wanted to create a solution that works well with NFTs because many applications are currently build in the field of non-fungible tokens.

## Architecture

Our solution consists of four components:

- Video Canister: For each uploaded video, one Video Canister is created that stores the meta information and the video data itself

- Spawn Canister: This is the primary canister that the NPM package talks to in order to encapsulate the creation and installation of video canisters on the Internet Computer

- Index Canister: You can use this canister optionally with the NPM package in order to store which creator uploaded which video. For example, a canister like this would be useful if you built an application where you want to query all videos that a specific creator uploaded

- NPM package: The NPM package is available here (TODO). It allows you to easily integrate our streaming and storage API in your DAPP. Further information on the functions that the package exports are listed below

## User Actions

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

## Getting started

## Local development

### Prerequisites:

Follow [this](https://smartcontracts.org/docs/rust-guide/rust-quickstart.html) DFINITY tutorial to set up a local Internet Computer Replica.

### Installing the dependencies:

Run `npm install` in the following directories:

- `Video-Canister/`

- `Video-Canister/src/video_canister_package/`

### Deploying the Spawn Canister on the local replica

Run `./deploy.sh` in the root directory.

### Running the test suite

Run `./test.sh` in the root directory.
