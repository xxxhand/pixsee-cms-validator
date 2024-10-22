const { CustomMongoClient, CustomDefinition } = require('@xxxhand/app-common');
const { PRE_ACT, DB_URL, DB_NAME, DB_USER, DB_PASS } = require('./variables.const');
const categoryInfos = require('./init-data/cms-category-info.json');
const categoryDetails = require('./init-data/cms-category-detail.json');
const albumInfos = require('./init-data/cms-album-info.json');
const albumDetails = require('./init-data/cms-album-detail.json');
const mediaInfos = require('./init-data/cms-media-info.json');
const mediaDetails = require('./init-data/cms-media-detail.json');
const audioInfos = require('./init-data/cms-audio-info.json');
const playProfiles = require('./init-data/pixsee-play-profile.json');
const dollProfiles = require('./init-data/doll-profile.json');
const whiteNoises = require('./init-data/white-noise.json');

class ReadSource {

    constructor(act) {
        this.action = act;
        /** @type {CustomMongoClient} */
        this.dbClient = null;
    }

    async tryInitial() {
        if (this.action === PRE_ACT) {
            return;
        }
        /** @type {CustomDefinition.IMongoOptions} */
        const opt = {
            user: DB_USER,
            pass: DB_PASS,
            db: DB_NAME,
            directConnect: true,
        };
        this.dbClient = new CustomMongoClient(DB_URL, opt);
        await this.dbClient.tryConnect();
    }

    async tryClose() {
        if (this.action === PRE_ACT) {
            return;
        }
        await this.dbClient.close();
    }

    async getCategoryInfos() {
        if (this.action === PRE_ACT) {
            return categoryInfos;
        }
        const ary = await this.dbClient.getCollection('CmsCategoryInfos').find({}).toArray();
        return ary;
    }

    async getCategoryDetails() {
        if (this.action === PRE_ACT) {
            return categoryDetails;
        }
        const ary = await this.dbClient.getCollection('CmsCategoryDetails').find({}).toArray();
        return ary;
    }
    
    async getAlbumInfos() {
        if (this.action === PRE_ACT) {
            return albumInfos;
        }
        const ary = await this.dbClient.getCollection('CmsAlbumInfos').find({}).toArray();
        return ary;
    }
    
    async getAlbumDetails() {
        if (this.action === PRE_ACT) {
            return albumDetails;
        }
        const ary = await this.dbClient.getCollection('CmsAlbumDetails').find({}).toArray();
        return ary;
    }
    
    async getMediaInfos() {
        if (this.action === PRE_ACT) {
            return mediaInfos;
        }
        const ary = await this.dbClient.getCollection('CmsMediaInfos').find({}).toArray();
        return ary;
    }
    
    async getMediaDetails() {
        if (this.action === PRE_ACT) {
            return mediaDetails;
        }
        const ary = await this.dbClient.getCollection('CmsMediaDetails').find({}).toArray();
        return ary;
    }
    
    async getAudioInfos() {
        if (this.action === PRE_ACT) {
            const concatAry = [];
            audioInfos.forEach((x) => concatAry.push(x));
            whiteNoises.forEach((x) => concatAry.push(x));
            return concatAry;
        }
        const concatFids = [];
        audioInfos.forEach((x) => concatFids.push(x.fid))
        whiteNoises.forEach((x) => concatFids.push(x.fid))
        const q = {
            fid: { '$in': concatFids }
        };
        const ary = await this.dbClient.getCollection('AudioInfos').find(q).toArray();
        return ary;

    }
    
    async getPlayProfiles() {
        if (this.action === PRE_ACT) {
            return playProfiles;
        }
        const ary = await this.dbClient.getCollection('PixseePlayProfiles').find({}).toArray();
        return ary;
    }

    async getDollProfiles() {
        if (this.action === PRE_ACT) {
            return dollProfiles;
        }
        const ary = await this.dbClient.getCollection('DollProfiles').find({}).toArray();
        return ary;
    }
}

module.exports = {
    ReadSource
}
