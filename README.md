# Decentralized Video Storage and Streaming on the Internet Computer

# Motivation for this Project

The mission of the Kryptonic project is to provide an easy solution for storing and streaming videos on the Internet Computer Blockchain. The project was developed in collaboration with the DFINITY team and supported with a 5k Grant.

# Get Started Immediately

Install and use our storage and streaming [package](https://www.npmjs.com/package/ic-video-storage).

# Design Goals

Our motivation to build this API was the Internet Computer's ability to store assets directly on a Blockchain without media breaks at a reasonable price.

However, figuring out how to store the asset in the best way on every new project is cumbersome. We wanted to give developers that work on applications with videos the opportunity to kickstart their project by benefitting on our work either by directly integrating our NPM package or using snippets from our source code.

Further, we wanted to create a solution that works well with NFTs because many applications are currently being built in that field. Therefore, we decided to stay away from storing multiple videos within one canister.

# Architecture

Our solution consists of four components:

- [Video Canister](https://github.com/IC-Kryptonic/Video-Canister/tree/master/src/video_canister): For each uploaded video, one video canister is created that stores the meta information and the video data itself

- [Spawn Canister](https://github.com/IC-Kryptonic/Video-Canister/tree/master/src/spawn_canister): This is the primary canister that the NPM package talks to in order to encapsulate the creation and installation of video canisters on the Internet Computer. There is a publicly deployed spawn canister that the package uses by default. You can also deploy your own spawn canister.

- [Index Canister](https://github.com/IC-Kryptonic/Video-Canister/tree/master/src/index_canister): You can use this canister optionally with the NPM package in order to store which creator uploaded which video. For example, a canister like this would be useful if you built an application where you want to query all videos that a specific creator uploaded. There is a publicly deployed index canister that the package uses by default. You can also deploy your own index canister.

- [Video Canister](https://github.com/IC-Kryptonic/Video-Canister/tree/master/src/video_canister_package): The NPM package allows you to easily integrate our streaming and storage API in your DAPP.

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

# Local development

If you want to work on this project locally to contribute to our work or adjust it to your needs, do the following:

### Prerequisites:

Follow [this](https://smartcontracts.org/docs/rust-guide/rust-quickstart.html) DFINITY tutorial to set up a local Internet Computer Replica.

### Installing the Dependencies:

Run `npm install` in the following directories:

- `Video-Canister/`

- `Video-Canister/src/video_canister_package/`

### Deploying the Spawn & Index Canister on the Local Replica

Run `./deploy.sh` in the root directory.

### Running the Test Suite

Run `./test.sh` in the root directory.
