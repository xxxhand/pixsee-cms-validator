const axios = require('axios').default;
const fs = require('fs-extra');
const { ReadSource } = require('./read-source-data');
const constants = require('./variables.const');


/**
 * 
 * @param {string[]} albums 
 */
async function downloadContents() {
    // if (fs.existsSync(constants.AZURE_CONTENT_PATH)) {
    //     fs.removeSync(constants.AZURE_CONTENT_PATH);
    // }
    // fs.mkdirSync(constants.AZURE_CONTENT_PATH);

    const toVlidateAlbums = constants.STORY_DOLL_ALBUMS
        .concat(constants.MUSIC_DOLL_ALBUMS)
        .concat(constants.MUSIC_BOX_ALBUMS);

    for (const sa of constants.CURATING_ALBUMS) {
        for (let i = 1; i <= 12; i++) {
            toVlidateAlbums.push(`${sa}-${i.toString()}`);
        }
    }
    const specialDownloadMids = [];
    const myLog = 'downloadContentLog.txt';
    const fails = [];

    const sourceData = new ReadSource(constants.PRE_ACT);
    await sourceData.tryInitial();
    const albumInfos = await sourceData.getAlbumInfos();
    const mediaInfos = await sourceData.getMediaInfos();
    await sourceData.tryClose();

    console.log(`Load albums ${toVlidateAlbums}`);
    for (const aid of toVlidateAlbums) {
        const currAlbum = albumInfos.find(x => x.albumId === aid);
        if (!currAlbum) {
            fails.push(`[${aid}] Not found in cms-album-info`);
            continue;
        }
        console.log(`[${aid}] start downloading ${currAlbum.medias.length} files`);
        for (const mid of currAlbum.medias) {
            if (specialDownloadMids.length > 0) {
                if (!specialDownloadMids.includes(mid)) {
                    continue;
                }
            }
            const currMedia = mediaInfos.find(x => x.mid === mid);
            if (!currMedia) {
                fails.push(`[${aid}][${mid}] Not found in cms-media-info`);
                continue;
            }
            // Download file from azure storage
            const savedFile = `${constants.AZURE_CONTENT_PATH}/${currMedia.fileName}`;
            // const isExists = await fs.exists(savedFile);
            // if (isExists) {
            //     continue;
            // }
            try {
                const res = await axios.get(`${constants.DOMAIN}${currMedia.url}&access_token=${constants.TOKEN}`, { responseType: 'arraybuffer' });
                const buf = Buffer.from(res.data, 'binary');
                await fs.writeFile(savedFile, buf);
            } catch (error) {
                fails.push(`[${aid}][${mid}] download fail`);
                fails.push(`[${aid}][${mid}] ${error.message}`);
                continue;
            }
            // Check file size match
            const currFile = await fs.stat(savedFile);
            if (currFile.size !== currMedia.fileSize) {
                fails.push(`[${aid}][${mid}] file size not match in cms-media-info`);
                continue;
            }
        }
    }

    if (fails.length > 0) {
        console.log(`There are ${fails.length} fails, please take a look at ${myLog}`);
        await fs.writeFile(myLog, JSON.stringify(fails, '', 4), { encoding: 'utf-8' });
    }
    console.log('Download done');
}

downloadContents();