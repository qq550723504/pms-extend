import { pms } from "./shared.js";
import { logger } from "./utils/logger.js";
import { getDomain } from "./utils/urlutils.js";

export function main() {
  let gatherButton = null;

  async function handleGatherClick() {

    try {
      // 更新按钮状态为"正在采集"
      updateButtonState("gathering");

      // 获取当前页面URL
      const url = window.location.href;

      // 调用采集函数
      const rawData = await pms.capture.capturePageData(url);

      // 解析采集到的数据
      const parsedResult = pms.parser.parsePageData(rawData);

      if (!parsedResult.success) {
        throw new Error(parsedResult.error || "数据解析失败");
      }

      // 发送采集数据到后台脚本
      const response = await chrome.runtime.sendMessage({
        action: pms.config.MESSAGE_ACTIONS.CAPTURE_AND_SEND_DATA,
        data: parsedResult.data,
      });

      if (response.success) {
        logger.info("数据采集成功");
        updateButtonState("gathered");
      } else {
        throw new Error(response.error || "采集失败");
      }
    } catch (error) {
      logger.error("采集过程中出错:", error);
      updateButtonState("failed");
    }
  }

  function updateButtonState(state) {
    if (!gatherButton) return;

    const states = {
      gathering: { class: "pms-gathering", text: "采集中", disabled: true },
      gathered: { class: "pms-gathered", text: "已采集", disabled: true },
      failed: { class: "pms-failed", text: "采集失败", disabled: false },
      default: { class: "pms-gather", text: "采集", disabled: false }
    };

    const { class: className, text, disabled } = states[state] || states.default;
    gatherButton.className = `btn-pms ${className}`;
    gatherButton.textContent = text;
    gatherButton.disabled = disabled;
  }

  function createGatherButton() {
    const button = document.createElement("button");
    button.title = "点击开始采集";
    button.textContent = "采集";
    button.style.cssText = `
        position: fixed;
        top: 100px;
        right: 50px;
        z-index: 9999;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        background-color: #4CAF50;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    `;
    button.addEventListener("click", handleGatherClick);
    document.body.appendChild(button);
    return button;
  }

  function init() {
    logger.info('初始化采集按钮');
    const currentDomain = getDomain(window.location.href);
    const supportedDomains = ['www.aliexpress.com', 'www.amazon.com', 'www.ebay.com']; // 添加支持的域名

    if (supportedDomains.includes(currentDomain)) {
      gatherButton = createGatherButton();
      updateButtonState("default");
    } else {
      logger.info(`不支持的域名: ${currentDomain}`);
    }
  }

  // 确保在 DOM 加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

