const fs = require('fs-extra');
const { ReadSource } = require('./read-source-data');
const {
  STORY_DOLL_CATEGORIES,
  STORY_DOLL_ALBUMS,
  EXPECT_EN_LOCALES,
  EXPECT_ZH_LOCALES,
} = require('./variables.const');

async function validateStoryDoll(opt = { action: '', dirPath: '' }) {

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
  const dollProfiles = await sourceData.getDollProfiles();
  await sourceData.tryClose();
  /** 取得來源資料 */

  const toValidateDollNames = ['Dragee', 'Unicoree', 'Owlee'];
  const supportedLocales = EXPECT_EN_LOCALES.concat(EXPECT_ZH_LOCALES);

  console.log(`Start checking story dolls ${STORY_DOLL_CATEGORIES}`);

  const storyDollsLog = `${opt.action}_storyDollsLog.txt`;
  const fails = [];

  if (fs.existsSync(storyDollsLog)) {
    await fs.unlink(storyDollsLog);
  }
  /** @type {string[]} */
  let validLocales = [];  

  for (const categoryId of STORY_DOLL_CATEGORIES) {
    // 檢查cms-category-info 
    console.log(`Check category ${categoryId} from cms-category-info`);
    const currCategory = categoryInfos.find(x => x.categoryId === categoryId);
    if (!currCategory) {
      fails.push(`Category ${categoryId} not found in cms-category-info`);
      continue;
    }
    if (!toValidateDollNames.includes(currCategory.fileName)) {
      fails.push(`[${categoryId}] has wrong file name ${currCategory.fileName} in cms-category-info`);
      continue;
    }
    if (currCategory.albums.length === 0) {
      fails.push(`[${categoryId}] album is empty in cms-category-info`);
      continue;
    }
    const validAlbums = currCategory.albums.map(x => STORY_DOLL_ALBUMS.find(y => y === x)).filter(z => !!z);
    if (validAlbums.length === 0) {
      fails.push(`[${categoryId}] has invalid albums in cms-category-info`)
      continue;
    }
    // 檢查cms-category-detail 
    // console.log(`[${categoryId}] Check detail from cms-category-detail`);
    const currCategoryDetails = categoryDetails.filter(x => x.categoryId === categoryId);
    if (currCategoryDetails.length === 0) {
      fails.push(`[${categoryId}] has no details in cms-category-detail`);
      continue;
    }
    if (currCategoryDetails.length !== supportedLocales.length) {
      fails.push(`[${categoryId}] has wrong detail length in cms-category-detail`);
      continue;
    }
    for (const currCategoryDetail of currCategoryDetails) {
      if (currCategoryDetail.subject !== currCategory.fileName) {
        fails.push(`[${categoryId}] has wrong subject ${currCategoryDetail.subject} in (cms-category-info & cms-category-detail)`);
        continue;
      }
      if (!supportedLocales.includes(currCategoryDetail.language)) {
        fails.push(`[${categoryId}][${currCategoryDetail.subject}] has wrong language  in cms-category-detail`);
        continue;
      }

    }

    // 檢查cms-album-info 
    for (const albumId of currCategory.albums) {
      // console.log(`Check album ${albumId} from cms-album-info`);
      const currAlbum = albumInfos.find(x => x.albumId === albumId);
      if (!currAlbum) {
        fails.push(`Album ${albumId} not found in cms-album-info`);
        continue;
      }
      if (currAlbum.fileName !== currCategory.fileName) {
        fails.push(`[${albumId}] file name not equals in (cms-category-info & cms-album-info)`);
        continue;
      }
      if (currAlbum.medias.length === 0) {
        fails.push(`[${albumId}] medias is empty in cms-album-info`);
        continue;
      }
      // 檢查cms-album-detail
      const currAlbumDetails = albumDetails.filter(x => x.albumId === currAlbum.albumId);
      if (currAlbumDetails.length === 0) {
        fails.push(`[${albumId}] not found album details in cms-album-detail`);
        continue;
      }
      validLocales.length = 0;
      validLocales = currAlbumDetails.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
      if (validLocales.length !== supportedLocales.length) {
        fails.push(`[${currCategory.categoryId}][${currAlbum.albumId}] has wrong locales in cms-album-detail`);
        continue;
      }
      let notMatchedSubject = currAlbumDetails.find(x => x.subject != currAlbum.fileName);
      if (notMatchedSubject) {
        fails.push(`[${albumId}][${currAlbum.fileName}] file name not equals in (cms-album-info & cms-album-detail)`);
        continue;
      }
      // 檢查cms-media-info 
      // console.log(`[${albumId}] Check media length equals and data exists from cms-media-info`);
      for (const mediaId of currAlbum.medias) {
        // console.log(`[${albumId}] Check media ${mediaId}`);
        const currMedia = mediaInfos.find(x => x.mid === mediaId);
        if (!currMedia) {
          fails.push(`[${albumId}][${mediaId}] not found in cms-media-info`);
          continue;
        }
        // TODO: Check DB: CmsMediaInfos
        let expectLocales = EXPECT_EN_LOCALES;
        if (mediaId.endsWith('zh')) {  // MS021_zh
          expectLocales = EXPECT_ZH_LOCALES;
        }

        // 檢查cms-media-detail 
        // console.log(`[${albumId}][${mediaId}] Check media detail have ${expectLocales.length} locales from cms-media-detail`);
        const currDetails = mediaDetails.filter(x => x.mid === mediaId);
        if (currDetails.length !== expectLocales.length) {
          fails.push(`[${albumId}][${mediaId}] media detail length is not match in cms-media-detail`);
          continue;
        }
        currDetails.forEach(x => {
          if (!expectLocales.includes(x.language)) {
            fails.push(`[${albumId}][${mediaId}][${x.language}] not supported in cms-media-detail`)
          }
        });
        // TODO: Check DB: CmsMediaDetails
        // 檢查cms-audio-info
        // console.log(`[${albumId}][${mediaId}] Check file size and fid equals to audio info from cms-audio-info`);
        const currFile = audioInfos.find(x => x.fid === currMedia.fid);
        if (!currFile) {
          throw new Error(`[${albumId}][${mediaId}][${currMedia.fid}] Not found in cms-audio-info`);
        }
        if (!currFile.systemCreate) {
          fails.push(`[${albumId}][${mediaId}] property systemCreate is false in cms-audio-info`);
          continue;
        }
        // console.log(`[${albumId}][${mediaId}][${currMedia.fid}] Check file size equals`);
        if (currFile.fileSize !== currMedia.fileSize) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} file size not equals in (cms-media-info & cms-audio-info)`);
          continue;
        }
        // console.log(`[${albumId}][${mediaId}][${currMedia.fid}] Check file name equals`);
        if (currFile.fileName !== currMedia.fileName) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} file name not equals in (cms-media-info & cms-audio-info)`);
          continue;
        }
        // Check real file and audio info and media info size are match
        const currDiskFile = await fs.stat(`${opt.dirPath}/${currFile.fileName}`);
        if (currDiskFile.size !== currFile.fileSize) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} file size not equals in (cms-media-info & cms-audio-info & ${opt.dirPath})`);
          continue;
        }
        // console.log(`[${albumId}][${mediaId}][${currMedia.fid}] Check file expresAt equals`);
        if (currFile.expiresAt !== currMedia.expiresAt) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} file expresAt not equals in (cms-media-info & cms-audio-info)`);
          continue;
        }
        if (currFile.lengthOfTime !== currMedia.lengthOfTime) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} file lengthOfTime not equals in (cms-media-info & cms-audio-info)`);
          continue;
        }
        // TODO: Check DB: AudioInfos
        // 檢查pixsee-play-profile
        const currProfile = playProfiles.find(x => x.fid === currMedia.fid);
        if (!currProfile) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} not found in pixsee-play-profile`);
          continue;
        }
        if (currProfile.subject !== currCategory.fileName) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong subject ${currProfile.subject} in (pixsee-play-profile & cms-category-info)`);
          continue;
        }
        // check file name
        const [myName, myExtension] = currMedia.fileName.split('.');
        if (currProfile.fileName !== myName) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong file name ${currProfile.fileName} in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        if (currProfile.format.toLowerCase() !== myExtension) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong file extension ${currProfile.format} in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        // check length
        if (currProfile.length !== currMedia.lengthOfTime) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong lengthOfTime ${currProfile.length} in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        // check mid
        if (currProfile.mid !== currMedia.mid) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong mid ${currProfile.mid} in (pixsee-play-profile & cms-media-info)`);
          continue;
        }
        // check translations
        if (currProfile.translations.length !== expectLocales.length) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong translations length in pixsee-play-profile`);
          continue;
        }
        validLocales.length = 0;
        validLocales = expectLocales.map(x => currProfile.translations.find(y => y.language === x)).filter(z => !!z);
        if (validLocales.length === 0) {
          fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}} has wrong translations  in (pixsee-play-profile & cms-media-detail)`);
          continue;
        }
        for (const trans of currProfile.translations) {
          const mDetail = mediaDetails.find(x => x.mid === currProfile.mid && x.language === trans.language);
          if (!mDetail) {
            fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}}[${trans.language}] not found in cms-media-detail`);
            continue;
          }
          if (trans.displayName !== mDetail.displayName) {
            fails.push(`[${albumId}][${mediaId}]{${currMedia.fid}}[${trans.language}] has wrong display name in (pixsee-play-profile & cms-media-detail)`);
            continue;
          }
        }

      }
    }

    // Check doll profiles
    const currDoll = dollProfiles.find(x => x.dollName === currCategory.fileName);
    if (!currDoll) {
      fails.push(`[${currCategory.fileName}] not found doll in doll-profile`);
      continue;
    }
    if (currDoll.defaultDisplayName !== currCategory.fileName) {
      fails.push(`[${currCategory.fileName}] defaultDisplayName not match in doll-profile`);
      continue;
    }
    validLocales.length = 0;
    validLocales = currDoll.translations.map(x => supportedLocales.findIndex(y => y === x.language)).filter(z => z >= 0);
    if (validLocales.length !== supportedLocales.length) {
      fails.push(`[${currCategory.fileName}] has wrong locales in doll-profile`);
      continue;
    }
    notMatchSubject = currDoll.translations.find(x => x.displayName !== currCategory.fileName);
    if (notMatchSubject) {
      fails.push(`[${currCategory.fileName}] translation.displayName not match in doll-profile`);
      continue;
    }
  }

  if (fails.length > 0) {
    console.log(`There are ${fails.length} fails, please take a look at ${storyDollsLog}`);
    await fs.writeFile(storyDollsLog, JSON.stringify(fails, '', 4), { encoding: 'utf-8' });
  }
}

module.exports = {
  validateStoryDoll
}
