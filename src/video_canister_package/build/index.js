"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICVideoStorage = void 0;
const agent_1 = require("@dfinity/agent");
const principal_1 = require("@dfinity/principal");
const common_1 = require("./common");
const constants_1 = require("./constants");
const parameter_check_1 = require("./parameter-check");
class ICVideoStorage {
    constructor(config) {
        this.config = JSON.parse(JSON.stringify(constants_1.DEFAULT_CONFIG));
        if (config)
            this.updateConfig(config);
    }
    updateConfig(config) {
        (0, parameter_check_1.checkUpdateConfigParams)(config);
        if (config.chunkSize !== undefined)
            this.config.chunkSize = config.chunkSize;
        if (config.uploadAttemptsPerChunk !== undefined)
            this.config.uploadAttemptsPerChunk = config.uploadAttemptsPerChunk;
        if (config.storeOnIndex !== undefined)
            this.config.storeOnIndex = config.storeOnIndex;
        if (config.indexCanisterPrincipalId)
            this.config.indexCanisterPrincipalId = config.indexCanisterPrincipalId;
        if (config.spawnCanisterPrincipalId)
            this.config.spawnCanisterPrincipalId = config.spawnCanisterPrincipalId;
        if (config.host)
            this.config.host = config.host;
    }
    async uploadVideo(input) {
        const { identity, walletId, video, cycles } = (0, parameter_check_1.checkUploadVideoParams)(input);
        if (cycles < constants_1.REQUIRED_CYCLES) {
            throw Error('Not enough cycles, need at least ' + constants_1.REQUIRED_CYCLES + ' for video canister creation');
        }
        const httpAgent = await (0, common_1.getHttpAgent)(identity, this.config.host);
        const videoPrincipal = await (0, common_1.createNewCanister)(identity, walletId, cycles, this.config.spawnCanisterPrincipalId, httpAgent);
        await (0, common_1.checkController)(walletId, videoPrincipal, httpAgent);
        const leftoverCycles = cycles - constants_1.REQUIRED_CYCLES;
        if (leftoverCycles > 0) {
            await (0, common_1.depositCycles)(walletId, videoPrincipal, leftoverCycles, httpAgent);
        }
        let chunkNum = 0;
        if (video.videoBuffer.length !== 0) {
            chunkNum = Math.floor(video.videoBuffer.length / this.config.chunkSize) + 1;
        }
        await this.updateMetadata({
            identity,
            videoPrincipal,
            newName: video.name,
            newDescription: video.description,
        });
        await this.updateVideo({
            identity,
            videoPrincipal,
            newChunkNum: chunkNum,
            newVideoBuffer: video.videoBuffer,
        });
        if (this.config.storeOnIndex) {
            const indexActor = await (0, common_1.getCanisterActor)("INDEX_CANISTER" /* INDEX_CANISTER */, principal_1.Principal.fromText(this.config.indexCanisterPrincipalId), httpAgent);
            await indexActor.post_video(videoPrincipal);
        }
        return videoPrincipal;
    }
    async getVideo(principal) {
        (0, parameter_check_1.checkGetVideoParams)(principal);
        const httpAgent = await (0, common_1.getHttpAgent)(new agent_1.AnonymousIdentity(), this.config.host);
        const actor = await (0, common_1.getCanisterActor)("VIDEO_CANISTER" /* VIDEO_CANISTER */, principal, httpAgent);
        try {
            const metaInfo = (await actor.get_meta_info());
            const chunksAsPromises = [];
            for (let i = 0; i < metaInfo.chunk_num; i++) {
                chunksAsPromises.push(actor.get_chunk(i));
            }
            const chunkBuffers = [];
            const nestedBytes = (await Promise.all(chunksAsPromises))
                .map((val) => (val[0] ? val[0] : null))
                .filter((v) => v !== null);
            nestedBytes.forEach((bytes) => {
                const bytesAsBuffer = Buffer.from(new Uint8Array(bytes));
                chunkBuffers.push(bytesAsBuffer);
            });
            return {
                name: metaInfo.name,
                description: metaInfo.description,
                version: metaInfo.version,
                owner: metaInfo.owner,
                videoBuffer: Buffer.concat(chunkBuffers),
            };
        }
        catch (error) {
            console.error(error);
            throw new Error('Unable to query video: ' + error);
        }
    }
    async changeOwner(input) {
        const { oldIdentity, oldWallet, videoPrincipal, newOwner, newOwnerWallet } = (0, parameter_check_1.checkChangeOwnerParams)(input);
        const httpAgent = await (0, common_1.getHttpAgent)(oldIdentity, this.config.host);
        await (0, common_1.changeCanisterController)(oldWallet, videoPrincipal, newOwnerWallet, httpAgent);
        await (0, common_1.changeVideoOwner)(videoPrincipal, newOwner, httpAgent);
    }
    async getMyVideos(identity) {
        (0, parameter_check_1.checkGetMyVideosParams)(identity);
        const httpAgent = await (0, common_1.getHttpAgent)(identity, this.config.host);
        const indexActor = await (0, common_1.getCanisterActor)("INDEX_CANISTER" /* INDEX_CANISTER */, principal_1.Principal.fromText(this.config.indexCanisterPrincipalId), httpAgent);
        const optVideos = (await indexActor.get_my_videos());
        if (optVideos[0] === undefined) {
            return new Array();
        }
        else {
            return optVideos[0];
        }
    }
    async updateMetadata(input) {
        const { identity, videoPrincipal, newName, newDescription } = (0, parameter_check_1.checkUpdateMetadataParams)(input);
        const httpAgent = await (0, common_1.getHttpAgent)(identity, this.config.host);
        const videoActor = await (0, common_1.getCanisterActor)("VIDEO_CANISTER" /* VIDEO_CANISTER */, videoPrincipal, httpAgent);
        await (0, common_1.executeVideoCanisterPut)(() => videoActor.put_meta_info({
            name: [newName],
            description: [newDescription],
            // chunk_num is set in updateVideo
            chunk_num: [],
        }), 'Could not put meta info into video canister');
    }
    async updateVideo(input) {
        const { identity, videoPrincipal, newChunkNum, newVideoBuffer } = (0, parameter_check_1.checkUpdateVideoParams)(input);
        const httpAgent = await (0, common_1.getHttpAgent)(identity, this.config.host);
        const videoActor = await (0, common_1.getCanisterActor)("VIDEO_CANISTER" /* VIDEO_CANISTER */, videoPrincipal, httpAgent);
        const promises = [];
        await (0, common_1.executeVideoCanisterPut)(() => videoActor.put_meta_info({
            // name is set in updateVideo
            name: [],
            // description is set in updateVideo
            description: [],
            chunk_num: [newChunkNum],
        }), 'Could not put chunk_num into video canister');
        for (let i = 0; i < newChunkNum; i++) {
            const chunkSlice = newVideoBuffer.slice(i * this.config.chunkSize, Math.min(newVideoBuffer.length, (i + 1) * this.config.chunkSize));
            const chunkArray = Array.from(chunkSlice);
            promises.push((0, common_1.uploadChunk)(() => videoActor.put_chunk(i, chunkArray), this.config.uploadAttemptsPerChunk, `Could not put chunk <${i}> into the video canister`));
        }
        await Promise.all(promises);
    }
}
exports.ICVideoStorage = ICVideoStorage;
