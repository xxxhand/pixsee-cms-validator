const { validateStoryDoll } = require('./chk-storyDolls');
const { validateMusicBox } = require('./chk-musicBox');
const { validateMusicDoll } = require('./chk-musicDolls');
const { validateCurating } = require('./chk-curating');
const { POST_ACT, AZURE_CONTENT_PATH } = require('./variables.const');

async function main() {
  const opt = {
    action: POST_ACT,
    dirPath: AZURE_CONTENT_PATH
  }
  await validateStoryDoll(opt);
  await validateMusicBox(opt);
  await validateMusicDoll(opt);
  await validateCurating(opt);
  console.log('Done');
}

main().catch(err => console.error(err));