"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICVideoStorage = void 0;
const principal_1 = require("@dfinity/principal");
const common_1 = require("./common");
const constants_1 = require("./constants");
const defaultConfig = {
    spawnCanisterPrincipal: constants_1.SPAWN_PRINCIPAL_ID,
    indexCanisterPrincipal: constants_1.INDEX_PRINCIPAL_ID,
    chunkSize: constants_1.CHUNK_SIZE,
    storeOnIndex: true,
};
class ICVideoStorage {
    constructor(config) {
        this.config = JSON.parse(JSON.stringify(defaultConfig));
        if (config)
            this.updateConfig(config);
    }
    updateConfig(config) {
        if (config.chunkSize)
            this.config.chunkSize = config.chunkSize;
        if (config.storeOnIndex !== undefined)
            this.config.storeOnIndex = config.storeOnIndex;
        if (config.indexCanisterPrincipal)
            this.config.indexCanisterPrincipal = config.indexCanisterPrincipal;
        if (config.spawnCanisterPrincipal)
            this.config.spawnCanisterPrincipal = config.spawnCanisterPrincipal;
    }
    async uploadVideo(identity, walletId, video, cycles) {
        if (cycles < constants_1.REQUIRED_CYCLES) {
            throw Error('Not enough cycles, need at least ' + constants_1.REQUIRED_CYCLES + ' for video canister creation');
        }
        const videoPrincipal = await (0, common_1.createNewCanister)(identity, walletId, constants_1.REQUIRED_CYCLES, this.config.spawnCanisterPrincipal);
        await (0, common_1.checkController)(identity, walletId, videoPrincipal);
        const leftoverCycles = cycles - constants_1.REQUIRED_CYCLES;
        if (leftoverCycles > 0) {
            await (0, common_1.depositCycles)(identity, walletId, videoPrincipal, leftoverCycles);
        }
        const videoActor = await (0, common_1.getCanisterActor)(identity, "VIDEO_CANISTER" /* VIDEO_CANISTER */, videoPrincipal);
        let chunkNum = 0;
        if (video.videoBuffer.length !== 0) {
            chunkNum = Math.floor(video.videoBuffer.length / this.config.chunkSize) + 1;
        }
        await (0, common_1.executeVideoCanisterPut)(() => videoActor.put_meta_info({
            name: video.name,
            description: video.description,
            chunk_num: chunkNum,
        }), 'Could not put meta info into video canister');
        for (let i = 0; i < chunkNum; i++) {
            const chunkSlice = video.videoBuffer.slice(i * this.config.chunkSize, Math.min(video.videoBuffer.length, (i + 1) * this.config.chunkSize));
            const chunkArray = Array.from(chunkSlice);
            await (0, common_1.executeVideoCanisterPut)(() => videoActor.put_chunk(i, chunkArray), `Could not put chunk <${i}> into the video canister`);
        }
        if (this.config.storeOnIndex) {
            const indexActor = await (0, common_1.getCanisterActor)(identity, "INDEX_CANISTER" /* INDEX_CANISTER */, principal_1.Principal.fromText(this.config.indexCanisterPrincipal));
            await indexActor.post_video(videoPrincipal);
        }
        return videoPrincipal;
    }
    async getVideo(identity, principal) {
        const actor = await (0, common_1.getCanisterActor)(identity, "VIDEO_CANISTER" /* VIDEO_CANISTER */, principal);
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
            throw new Error('Unable to query video: ' + error);
        }
    }
    async changeOwner(oldIdentity, oldWallet, videoPrincipal, newOwner, newOwnerWallet) {
        await (0, common_1.changeCanisterController)(oldIdentity, oldWallet, videoPrincipal, newOwnerWallet);
        await (0, common_1.changeVideoOwner)(oldIdentity, videoPrincipal, newOwner);
    }
    async getMyVideos(identity) {
        const indexActor = await (0, common_1.getCanisterActor)(identity, "INDEX_CANISTER" /* INDEX_CANISTER */, principal_1.Principal.fromText(this.config.indexCanisterPrincipal));
        const optVideos = (await indexActor.get_my_videos());
        if (optVideos[0] === undefined) {
            return new Array();
        }
        else {
            return optVideos[0];
        }
    }
}
exports.ICVideoStorage = ICVideoStorage;
