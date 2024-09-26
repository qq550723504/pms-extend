import { pms } from "./shared.js";
import { logger } from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", async function () {
  const updatePendingState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: pms.config.MESSAGE_ACTIONS.GET_CACHE,
        data: {
          domain: pms.config.DATA_SOURCES.ALIEXPRESS,
        },
      });
      const pendingElement = document.getElementById("pms-pending");
      if (pendingElement) {
        pendingElement.textContent = response.length;
      }
    } catch (error) {
      logger.error("更新待处理状态时出错:", error);
    }
  };

  // 初始更新待处理状态
  await updatePendingState();

  // 获取 manifest 数据
  const manifest = chrome.runtime.getManifest();

  // 更新标题
  const titleElements = document.getElementsByClassName("title");
  Array.from(titleElements).forEach((element) => {
    element.textContent = `${manifest.name} ${manifest.version}`;
  });

  // 绑定按钮点击事件：授权
  const btnAuth = document.getElementById("btnAuth");
  if (btnAuth) {
    btnAuth.addEventListener("click", () => {
      window.open(pms.gather.url.auth);
    });
  }

  // 绑定按钮点击事件：清除历史
  const btnCleanHistory = document.getElementById("btnCleanHistory");
  if (btnCleanHistory) {
    btnCleanHistory.addEventListener("click", async () => {
      await pms.storage.clear();
      const finishedElement = document.getElementById("pms-finished");
      if (finishedElement) {
        finishedElement.textContent = "0";
      }
    });
  }

  // 绑定按钮点击事件：重置失败
  const btnResetFailed = document.getElementById("btnResetFailed");
  if (btnResetFailed) {
    btnResetFailed.addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({ action: pms.config.MESSAGE_ACTIONS.RESET_FAILED });
      } catch (error) {
        logger.error("重置失败时出错:", error);
      }
    });
  }

  // 初始加载成功和失败计数
  try {
    const history = (await pms.storage.get()) || [];
    const finishedElement = document.getElementById("pms-finished");
    if (finishedElement) {
      finishedElement.textContent = Array.isArray(history)
        ? history.length.toString()
        : "0";
    }

    const failedList =
      (await pms.storage.getByKey(pms.config.STORAGE_KEYS.FAILED_URLS)) || [];
    const failedElement = document.getElementById("pms-failed");
    if (failedElement) {
      failedElement.textContent = Array.isArray(failedList)
        ? failedList.length.toString()
        : "0";
    }
  } catch (error) {
    logger.error("加载计数时出错:", error);
    // 在出错时设置默认值
    const finishedElement = document.getElementById("pms-finished");
    const failedElement = document.getElementById("pms-failed");
    if (finishedElement) finishedElement.textContent = "0";
    if (failedElement) failedElement.textContent = "0";
  }

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: pms.config.MESSAGE_ACTIONS.CHECK_LOGIN
      });
      
      if (response.success) {
        // 用户已登录
        document.getElementById('btnAuth').textContent = '已登录';
        document.getElementById('btnAuth').classList.remove('btn-primary');
        document.getElementById('btnAuth').classList.add('btn-success');
        document.getElementById('btnAuth').disabled = true;
      } else {
        // 用户未登录
        document.getElementById('btnAuth').textContent = '登录';
        document.getElementById('btnAuth').disabled = false;
        document.getElementById('btnAuth').classList.remove('btn-success');
        document.getElementById('btnAuth').classList.add('btn-primary');
      }
    } catch (error) {
      logger.error("检查登录状态时出错:", error);
      document.getElementById('btnAuth').textContent = '登录';
      document.getElementById('btnAuth').disabled = false;
      document.getElementById('btnAuth').classList.remove('btn-success');
      document.getElementById('btnAuth').classList.add('btn-primary');
    }
  };

  // 调用检查登录状态函数
  await checkLoginStatus();

  // 登录按钮点击事件
  document.getElementById("btnAuth").addEventListener("click", function () {
    try {
      // 使用 URLS 常量中定义的 auth URL
      chrome.tabs.create({ url: pms.config.URLS.AUTH });
    } catch (error) {
      logger.error("打开登录页面时出错:", error);
    }
  });

});
