# DISCLAIMER

Storing data on a Blockchain causes costs that cannot be refunded. Please use this package with care.

We do not warrant flawless functionality of this package and do not bear the reponsibility of any (financial) damage caused by using it.

This package is published under the MIT license (see repository for details).

# ic-video-storage

JavaScript and TypeScript library to easily store and stream videos using the [Internet Computer](https://dfinity.org/).

[Installation](#installation)

[Usage](#usage)

- [Initializing](#initialization) the storage object and updating the config
- [Uploading](#uploading-a-video-to-a-new-canister) a video to a new canister
- [Overriding](#overriding-the-metadata-in-a-video-canister) the video metadata in a canister
- [Overriding](#overriding-the-video-in-a-canister) the video in a canister
- [Streaming](#streaming-a-video-from-a-canister) a video from a canister
- [Retrieving](#querying-the-uploaded-videos-remembered-in-the-index-canister-for-a-specific-user) the created video canisters for a user
- [Changing](#transferring-the-ownership-of-a-video-canister) the owner of a video canister

[Motivation and Design Principles](https://github.com/IC-Kryptonic/Video-Canister#Design-Goals)

[Canister Source Code](https://github.com/IC-Kryptonic/Video-Canister)

#

# Installation

Install the Package:

`npm install ic-video-storage`

#

# Usage

## Initialization

Initialize a storage object in your application:

`new ICVideoStorage(storageConfig: StorageConfig)`

Example:

```
import { ICVideoStorage } from 'ic-video-storage';

// TODO: Replace the following with your project configuration
const storageConfig = {
  //...
};

const storage = new ICVideoStorage(storageConfig);
```

If you need to chang the config for an existing storage object you can overwrite the properties with the `updateConfig` function:

`updateConfig(config: StorageConfig)`

#### Storage Config Properties

The storage config comprises the parameters defined in the table below. If you do not intend to change any default parameters, you don't need to provide a config object when initializing the storage object.

| Parameter name           | Parameter Type | Default Value                 | Purpose                                                                                         |
| ------------------------ | -------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| spawnCanisterPrincipalId | string         | fvyzl-oaaaa-aaaal-qaxvq-cai\* | On-chain location of the spawn canister used to create video canisters                          |
| indexCanisterPrincipalId | string         | fa7ig-piaaa-aaaal-qaxwa-cai\* | On-chain location of the index canister used to remember the location of created videos         |
| storeOnIndex             | boolean        | true                          | Determines if location (principal) of created video canister(s) is remembered in index canister |
| chunkSize                | number         | 100000                        | Size of the chunks that an uploaded video is split into in bytes (0.001MB <= chunkSize <= 2MB)  |
| uploadAttemptsPerChunk   | number         | 3                             | Maximum number of upload attempts per chunk before the upload throws an error.                  |
| host                     | string         | https://ic0.app               | Internet Computer host                                                                          |

###

**\*Important:** Both default values for the spawn and the index canister are valid canister adresses of decentralized smart contracts that were deployed to be used with this package.
Only overwrite these values if you want to deploy independent spawn / index canisters that are controlled by you. The source code of both canisters can be found [here](https://github.com/IC-Kryptonic/Video-Canister).

#

## Uploading a video to a new canister

The `uploadVideo` function of the storage object uses the spawn canister to create a new video canister, sets the metadata and stores the provided video in the created canister. It returns the principal of the created canister:

`async uploadVideo(input: UploadVideo): Promise<Principal>`

Properties of type `UploadVideo` (Object)

- identity: Identity
- walletId: Principal
- video: VideoToStore (Object)
  - name: string
  - description: string
  - videoBuffer: Buffer
- cycles: bigint

**Attention**: The defined cycles are withdrawn from the specified wallet to create the new canister. The minimum cycles required amount to 200_000_000_000. All unused cycles are sent to created video canister.

Example:

```
import { ICVideoStorage, VideoToStore } from 'ic-video-storage';

//...

const storage = new ICVideoStorage();

// exemplary way of reading the file (in this case from disk)
const file: Buffer  =  await  fs.promises.readFile(path);

const  video: VideoToStore = {
  name:  'My Favourite Video',
  description:  'Memories from 2021',
  videoBuffer:  file,
};

// ATTENTION: Replace identity and wallet
const  anon = new  AnonymousIdentity();
const  anonWallet = Principal.fromText(anonWalletPrincipal);

// send enough cycles to create the video canister and upload the video
const  cycles: bigint = BigInt(200_000_000_000);


// the returned principal is the location of the created video canister contract
const  principal: Principal = await storage.uploadVideo({
    identity: anon,
    walletId: anonWallet,
    video: video,
    cycles: cycles
});
```

### Estimating the Required Amount of Cycles

The amount of cycles required to create the video canister depends on the file size of the video. You can calculate an estimate of the required cycles with the `calculateCycleEstimate` function

`calculateCycleEstimate(fileSize: number): bigint`

_Disclaimer_: This function is still experimental and not optimized. It might estimate more cycles than needed. However, the cycle surplus is sent to the video canister.

#

## Overriding the Metadata in a Video Canister

The `updateMetadata` function enables the owner of a video canister to update/override the metadata.

`async updateMetadata(input: UpdateMetadata)`

Properties of type `UpdateMetadata` (input object):

- identity: Identity (identity used to make the call, must be the current owner of the canister)
- videoPrincipal: Principal (principal of the video canister)
- newName: string (new video name)
- newDescription: string (new video description)

#

## Overriding the Video in a Canister

The `updateVideo` function enables the owner of a video canister to update/override the video stored in the canister.

` async updateVideo(input: UpdateVideo)`

Properties of type `UpdateVideo` (input object):

- identity: Identity (identity used to make the call, must be the current owner of the canister)
- videoPrincipal: Principal (principal of the video canister)
- newChunkNum: number (number of chunks that the Buffer is split into)
- newVideoBuffer: Buffer (new video)

#

## Streaming a Video from a Canister

The `getVideo` function retrieves a stored video at a known location (provided through the `principal` parameter).

`async getVideo(principal: Principal): Promise<Video>`

Properties of type `Video` (returned object):

- name: string
- description: string
- version: bigint (canister version; needed in case we upgrade the video canister code in the future)
- owner: Principal
- videoBuffer: Buffer

#

## Querying the Uploaded Videos Remembered in the Index Canister for a Specific User

The `getMyVideos` function queries the index canister (either the default one or the one provided in the config) to retrieve the principals of all video canisters that were created for a given `identity` (i.e. user) and remembered by the index canister.

`async getMyVideos(identity: Identity): Promise<Principal[]>`

#

## Transferring the Ownership of a Video Canister

The `changeOwner` method changes the owner of a video canister (for example useful in a NFT scenario).

`async changeOwner(input: ChangeOwner)`

Properties of type `ChangeOwner` (input object):

- oldIdentity: Identity
- oldWallet: Principal
- videoPrincipal: Principal
- newOwner: Principal
- newOwnerWallet: Principal
