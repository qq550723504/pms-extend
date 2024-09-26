import { logger } from '../utils/logger.js';
import { getDomain } from '../utils/urlutils.js';

export const capture = {
  capturePageData: async function(url) {
    try {
      logger.info("开始采集页面数据:", url);
      
      const domain = getDomain(url);
      const captureMethod = this.getCaptureMethod(domain);
      
      if (!captureMethod) {
        throw new Error(`不支持的域名: ${domain}`);
      }

      const rawData = await captureMethod.call(this, url);
      
      logger.info("原始数据采集成功:", url);
      return rawData;
    } catch (error) {
      logger.error("采集页面数据时出错:", error);
      throw error;
    }
  },

  getCaptureMethod: function(domain) {
    const captureMethods = {
      'www.aliexpress.com': this.captureAliexpress,
      'www.amazon.com': this.captureAmazon,
      'www.ebay.com': this.captureEbay,
      // 可以添加更多网站的捕获方法
    };

    return captureMethods[domain];
  },

  captureAliexpress: async function(url) {
    return {
      url: url,
      titleElement: await this.waitForElement('h1'),
      priceElement: await this.waitForElement('.product-price-value'),
      descriptionElement: await this.waitForElement('.product-description'),
      imageElements: document.querySelectorAll('.product-image'),
      specificationElements: document.querySelectorAll('.specification-item')
    };
  },

  captureAmazon: async function(url) {
    await this.waitForElement('#productTitle');
    return {
      url: url,
      titleElement: document.querySelector('#productTitle'),
      priceElement: document.querySelector('.a-price-whole'),
      descriptionElement: document.querySelector('#productDescription'),
      imageElements: document.querySelectorAll('.imgTagWrapper img'),
      specificationElements: document.querySelectorAll('.prodDetTable tr')
    };
  },

  captureEbay: async function(url) {
    await this.waitForElement('h1.x-item-title__mainTitle');
    return {
      url: url,
      titleElement: document.querySelector('h1.x-item-title__mainTitle'),
      priceElement: document.querySelector('.x-price-primary'),
      descriptionElement: document.querySelector('#desc_wrapper'),
      imageElements: document.querySelectorAll('.ux-image-carousel-item img'),
      specificationElements: document.querySelectorAll('.ux-labels-values__labels-content')
    };
  },

  waitForElement: function(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`等待元素 ${selector} 超时`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }
};