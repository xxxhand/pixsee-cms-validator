const fs = require('fs-extra');
const {
  CURATING_CATEGORIES,
  CURATING_ALBUMS,
  EXPECT_EN_LOCALES,
  EXPECT_ZH_LOCALES,
} = require('./variables.const');
const { ReadSource } = require('./read-source-data');

async function validateCurating(opt = { action: '', dirPath: '' }) {

  /** 取得來源資料 */
  const sourceData = new ReadSource(opt.action);
  await sourceData.tryInitial();
  const categoryInfos = await sourceData.getCategoryInfos();
  const categoryDetails = await sourceData.getCategoryDetails();
  const albumInfos = await sourceData.getAlbumInfos();
  const albumDetails = await sourceData.getAlbumDetails();
  const mediaInfos = await sourceData.getMediaInfos();
  const mediaDetails = await sourceData.getMediaDetails();
  const audioInfos = await sourceData.getAudioInfos();
  const playProfiles = await sourceData.getPlayProfiles();
  await sourceData.tryClose();
  /** 取得來源資料 */    

  const supportedLocales = EXPECT_EN_LOCALES.concat(EXPECT_ZH_LOCALES);
  const toValidateCategory = [];
  const toVlidateAlbums = [];
  for (const sc of CURATING_CATEGORIES) {
    for (let i = 1; i <= 12; i++) {
      toValidateCategory.push(`${sc}-${i.toString()}`);
    }
  }
  for (const sa of CURATING_ALBUMS) {
    for (let i = 1; i <= 12; i++) {
      toVlidateAlbums.push(`${sa}-${i.toString()}`);
    }
  }
  console.log(`Start checking music dolls ${toValidateCategory}`);

  const myFailLog = `${opt.action}_curatingLog.txt`;
  const fails = [];
  if (fs.existsSync(myFailLog)) {
    await fs.unlink(myFailLog);
  }
  // Check category info
  for (const cid of toValidateCategory) { 
    console.log(`Check category ${cid}`);
    const currCategory = categoryInfos.find(x => x.categoryId === cid);
    if (!currCategory) {
      fails.push(`[${cid}] not found in cms-category-info`);
      continue;
    }
    const validAlbums = currCategory.albums.map(x => toVlidateAlbums.find(y => y === x)).filter(z => !!z);
    if (validAlbums.length === 0) {
      fails.push(`[${cid}] has invalid albums in cms-category-info`);
      continue;
    }
    // Check category detail
    const categoryDetailAry = categoryDetails.filter(x => x.categoryId === cid);
    if (categoryDetailAry.length === 0) {
      fails.push(`[${cid}] has no detail in cms-category-detail`);
      continue;
    }
    let validLocales = categoryDetailAry.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
    if (validLocales.length !== supportedLocales.length) {
      fails.push(`[${cid}] has wrong locales in cms-category-detail`);
      continue;
    }
    // Check album info
    for (const aid of currCategory.albums) { 
      const currAlbum = albumInfos.find(x => x.albumId === aid);
      if (!currAlbum) {
        fails.push(`[${cid}][${aid}] not found in cms-album-info`);
        continue;
      }
      if (currAlbum.medias.length === 0) {
        fails.push(`[${cid}][${aid}] has no medias in cms-album-info`);
        continue;
      }
      if (currAlbum.fileName !== currCategory.fileName) {
        fails.push(`[${cid}][${aid}][${x.language}] has wrong subject in cms-album-info`);
        return;
      }
      // Check album detail
      const currAlbumDetails = albumDetails.filter(x => x.albumId === aid);
      if (currAlbumDetails.length === 0) {
        fails.push(`[${cid}][${aid}] not found detail in cms-album-detail`);
        continue;
      }
      validLocales = currAlbumDetails.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
      if (validLocales.length !== supportedLocales.length) {
        fails.push(`[${cid}][${aid}] has wrong locales in cms-album-detail`);
        continue;
      }
      // Check media info
      for (const mid of currAlbum.medias) {
        const currMedia = mediaInfos.find(x => x.mid === mid);
        if (!currMedia) {
          fails.push(`[${cid}][${aid}][${mid}] not found in cms-media-info`);
          continue;
        }
        // Check media detail
        const currMediaDetails = mediaDetails.filter(x => x.mid === mid);
        if (currMediaDetails.length === 0) {
          fails.push(`[${cid}][${aid}][${mid}] not found detail in cms-media-detail`);
          continue;
        }
        validLocales = currMediaDetails.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
        if (validLocales.length !== supportedLocales.length) {
          fails.push(`[${cid}][${aid}][${mid}] has wrong locales in cms-media-detail`);
          continue;
        }
        // Check audio info
        const currFile = audioInfos.find(x => x.fid === currMedia.fid);
        if (!currFile) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} not found in cms-audio-info`);
          continue;
        }
        if (currFile.fileSize !== currMedia.fileSize) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file size not match in (cms-audio-info & cms-media-info)`);
          continue;
        }
        // Check real file and audio info and media info size are match
        const currDiskFile = await fs.stat(`${opt.dirPath}/${currFile.fileName}`);
        if (currDiskFile.size !== currFile.fileSize) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file size not equals in (cms-media-info & cms-audio-info & ${opt.dirPath})`);
          continue;
        }             
        if (currFile.fileName !== currMedia.fileName) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file name not match in (cms-audio-info & cms-media-info)`);
          continue;
        }
        if (currFile.lengthOfTime !== currMedia.lengthOfTime) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file lengOfTime not match in (cms-audio-info & cms-media-info)`);
          continue;
        }
        if (currFile.expiresAt !== currMedia.expiresAt) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file expiresAt not match in (cms-audio-info & cms-media-info)`);
          continue;
        }
        // Check play profile
        const currProfile = playProfiles.find(x => x.fid === currMedia.fid);
        if (!currProfile) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} not found in pixsee-play-profile`);
          continue;
        }
        const theLastDotIndex = currMedia.fileName.lastIndexOf('.');
        const myName = currMedia.fileName.substring(0, theLastDotIndex);
        const myExtension = currMedia.fileName.substring(theLastDotIndex + 1, currMedia.fileName.length);
        if (currProfile.fileName !== myName) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file name not match in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        if (currProfile.format.toLowerCase() !== myExtension) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} file extension not match in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        if (currProfile.length !== currMedia.lengthOfTime) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} lengthOfTime not match in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        if (currProfile.mid !== currMedia.mid) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} mid not match in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        validLocales = currProfile.translations.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
        if (validLocales.length !== supportedLocales.length) {
          fails.push(`[${cid}][${aid}][${mid}]{${currMedia.fid}} has wrong locales in pixsee-play-profile`);
          continue;
        }
        for (const trans of currProfile.translations) {
          const mDetail = mediaDetails.find(x => x.mid === currProfile.mid && x.language === trans.language);
          if (!mDetail) {
            fails.push(`[${cid}][${aid}][${mid}]{${trans.language}} has wrong locales in (pixsee-play-profile & cms-media-detail)`);
            continue;
          }
          if (trans.displayName !== mDetail.displayName) {
            fails.push(`[${cid}][${aid}][${mid}]{${trans.language}} has wrong display name in (pixsee-play-profile & cms-media-detail)`);
            continue;
          }
        }        
      }

    }    
  }

  // Write file if fail
  if (fails.length > 0) {
    console.log(`There are ${fails.length} fails, please take a look at ${myFailLog}`);
    await fs.writeFile(myFailLog, JSON.stringify(fails, '', 4), { encoding: 'utf-8' });
  }
}

module.exports = {
  validateCurating
}
