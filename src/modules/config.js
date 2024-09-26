export const config = {
  gather: {
    source: {
      ALIEXPRESS: "ALIEXPRESS",
    },
  },
  URLS: {
    AUTH: "https://pms.sentaixin.com/Account/Login",
    CHECK_LOGIN: "https://pms.sentaixin.com/Account/CheckLoginAccount",
    CHECK_VERSION: "http://47.120.30.91:16115/down/iOJkvyffvlzq.json",
    POST_PRODUCT_API: "https://pms.sentaixin.com/api/services/app/Gather/CreatePost",
    POST_PRODUCT: "https://pms.sentaixin.com/AppAreaName/Gathers/Post",
  },
  MESSAGE_ACTIONS: {
    GET_CACHE: 'pms.getCache',
    GET_BY_KEY: 'pms.getByKey',
    CLEAN_HISTORY: 'pms.cleanHistory',
    RESET_FAILED: 'pms.resetFailed',
    CHECK_LOGIN: 'pms.checkLogin',
    CAPTURE_AND_SEND_DATA: 'pms.captureAndSendData',
    ADD_URL: 'pms.addUrl',
    MENU_CLICKED: 'pms.menuClicked'
  },
  DATA_SOURCES: {
    ALIEXPRESS: 'ALIEXPRESS'
  },
  STORAGE_KEYS: {
    FAILED_URLS: 'failedUrls'
  },
  CACHE: {
    TTL: 60000 // 1 minute in milliseconds
  },
  QUEUE: {
    RUNNING: 'running',
    STOPPED: 'stopped',
    BATCH_SIZE: 5
  },
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  }
};
