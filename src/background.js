import { pms } from './shared.js';
import { logger } from './utils/logger.js';
import { handleError } from './utils/errorhandler.js';
// 消息处理器
const messageHandlers = {
  [pms.config.MESSAGE_ACTIONS.GET_CACHE]: async (request) => {
    return await pms.cache.get(request.data.domain);
  },
  [pms.config.MESSAGE_ACTIONS.GET_BY_KEY]: async (request) => {
    const result = await chrome.storage.local.get([request.data.key]);
    return result[request.data.key] || [];
  },
  [pms.config.MESSAGE_ACTIONS.CLEAN_HISTORY]: async (request) => {
    await pms.cache.clear(request.data.domain);
    return { success: true };
  },
  [pms.config.MESSAGE_ACTIONS.RESET_FAILED]: async () => {
    const urls = await pms.storage.getByKey(pms.config.STORAGE_KEYS.FAILED_URLS);
    await Promise.all(urls.map(url => pms.cache.add(url, pms.gather.source.ALIEXPRESS)));
    await chrome.storage.local.remove(pms.config.STORAGE_KEYS.FAILED_URLS);
    return { success: true };
  },
  [pms.config.MESSAGE_ACTIONS.CHECK_LOGIN]: async () => {
    try {
      const response = await fetch(pms.config.URLS.CHECK_LOGIN, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: data.success };
      } else {
        throw new Error('检查登录状态失败');
      }
    } catch (error) {
      logger.error("检查登录状态时出错:", error);
      return { success: false, error: error.message };
    }
  },
  [pms.config.MESSAGE_ACTIONS.CAPTURE_AND_SEND_DATA]: async (request) => {
    try {
      // 这里应该包含将数据发送到服务器的逻辑
      const result = await pms.queue.captureAndSendData(request.data);
      return { success: true, data: result };
    } catch (error) {
      logger.error('发送采集数据时出错:', error);
      return { success: false, error: error.message };
    }
  }
};

// 消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.action) {
    const handler = messageHandlers[request.action];
    if (handler) {
      handler(request)
        .then(sendResponse)
        .catch(error => sendResponse(handleError(error, request.action)));
    } else {
      sendResponse(handleError(new Error('未知的操作'), request.action));
    }
    return true; // 保持消息通道开放
  }
});

// 使用 chrome.alarms API 替代 setInterval
chrome.alarms.create('runPostProduct', { periodInMinutes: 1 });

// 监听闹钟事件
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'runPostProduct') {
    try {
      await pms.queue.runPostProduct(pms.config.DATA_SOURCES.ALIEXPRESS, false);
    } catch (error) {
      logger.error('Error in runPostProduct:', error);
    }
  }
});

// 其他 background.js 相关代码...