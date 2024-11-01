// const DOMAIN = 'https://staging.ipg-services.com';
// const TOKEN = 'MjRiNDE0Y2ItM2VkNi00NjRiLWE1MmYtMzQzOTNlMTlkZ897uhd'; // Staging
const DOMAIN = 'https://api.ipg-services.com';
const TOKEN = 'YzBmYjBhOTktNmUwMy00YzU0LWIwODctMzYxNzhmZjAyMWMz4fm'; // Prod
const DB_NAME = 'pixie';
const DB_USER = 'pixieapi';
const DB_PASS = 'pixsEeSwhQ2046';
const DB_URL = `mongodb://40.112.128.223:33576/${DB_NAME}`;
const AZURE_CONTENT_PATH = 'AzureContents';
const STORY_DOLL_CATEGORIES = ['DSC001', 'DSC002', 'DSC003'];
const STORY_DOLL_ALBUMS = ['DSA001', 'DSA002', 'DSA003'];
const MUSIC_DOLL_CATEGORIES = ['DC01', 'DC02', 'DC03'];
const MUSIC_DOLL_ALBUMS = ['DA001', 'DA002', 'DA003'];
const MUSIC_BOX_CATEGORIES = ['C01', 'C02', 'C03', 'C04', 'C05', 'LC01'];
const MUSIC_BOX_ALBUMS = ['A001', 'A002', 'A003', 'A004', 'A005', 'LA001'];
const CURATING_CATEGORIES = ['CU001', 'CU002', 'CU003'];
const CURATING_ALBUMS = ['CUA001', 'CUA002', 'CUA003'];
const EXPECT_EN_LOCALES = ['en-us'];
const EXPECT_ZH_LOCALES = ['zh-tw', 'zh-cn'];
const PRE_ACT = 'pre';
const POST_ACT = 'post';



module.exports = {
    DOMAIN,
    TOKEN,
    AZURE_CONTENT_PATH,
    STORY_DOLL_CATEGORIES,
    STORY_DOLL_ALBUMS,
    MUSIC_DOLL_ALBUMS,
    MUSIC_DOLL_CATEGORIES,
    MUSIC_BOX_CATEGORIES,
    MUSIC_BOX_ALBUMS,
    CURATING_CATEGORIES,
    CURATING_ALBUMS,
    EXPECT_EN_LOCALES,
    EXPECT_ZH_LOCALES,
    PRE_ACT,
    POST_ACT,
    DB_NAME,
    DB_PASS,
    DB_URL,
    DB_USER,
}