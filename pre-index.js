const { validateStoryDoll } = require('./chk-storyDolls');
const { validateMusicBox } = require('./chk-musicBox');
const { validateMusicDoll } = require('./chk-musicDolls');
const { validateCurating } = require('./chk-curating');
const { PRE_ACT, AZURE_CONTENT_PATH } = require('./variables.const');

/**
 * 上code之前的驗證，針對各seeders的init data比對各種屬性值是否相符
 * 若有錯誤則會產出error log
 */

async function main() {
  const opt = {
    action: PRE_ACT,
    dirPath: AZURE_CONTENT_PATH
  }
  await validateStoryDoll(opt);
  await validateMusicBox(opt);
  await validateMusicDoll(opt);
  await validateCurating(opt);
}

main().catch(err => console.log(err));