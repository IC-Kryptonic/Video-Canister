# DISCLAIMER

This package is a WIP and not intended for public use as of now.

We do not warrant proper functionality of the package and do not bear the reponsibility of any (financial) damage caused by using it.

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
