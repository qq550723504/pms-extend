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
    // 等待 JSON-LD 脚本加载
    await this.waitForElement('script[type="application/ld+json"]');
    // 获取并解析 JSON-LD 数据
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    const jsonLdData = JSON.parse(jsonLdScript.textContent)[0];  // 假设我们只关心第一个对象
    const skuItemElement = await this.waitForElement('.sku-item--skus--StEhULs');
    const skuItems = skuItemElement.querySelectorAll('.sku-item--image--jMUnnGA');
    const descriptionElement = await this.waitForElement('#nav-description');
    const description = descriptionElement.querySelector("#product-description");
    const specificationElement = await this.waitForElement('.specification--list--GZuXzRX');
    const specificationMoreButton = await this.waitForElement('.specification--btn--Y4pYc4b');
    await specificationMoreButton.click();
    const specificationItems = specificationElement.querySelectorAll('.specification--prop--Jh28bKu');
    const skus = [];
    for (const skuItem of skuItems) {
        const sku = {};
        sku.name = skuItem.querySelector('img').alt;
        //点击每一个skuItem
        skuItem.click();
        //等待价格加载完毕
        const priceElement = await this.waitForElement('.product-price-value');
        sku.price = priceElement.textContent;
        skus.push(sku);
    }
    const specifications = [];
    for(const specification of specificationItems){
      const key = specification.querySelector('.specification--title--SfH3sA8').textContent;
      const value = specification.querySelector('.specification--desc--Dxx6W0W').textContent;
      specifications.push({key, value});
    }
    const imageElements = document.querySelectorAll('.slider--img--K0YbWW2 img');
    const images = [];
    for (const imageElement of imageElements) {
      images.push(this.removeAfterFirstJpg(imageElement.src));
    }
    return {
      url: jsonLdData.offers.url,
      id: jsonLdData.offers.url.match(/\/(\d+)\.html$/)[1],
      title: jsonLdData.name,
      price: jsonLdData.offers.price,
      currency: jsonLdData.offers.priceCurrency,
      images: images,
      description: description,
      skus: skus,
      specifications: specifications
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
  },
  removeAfterFirstJpg:function (url) {
    const index = url.indexOf('.jpg');
    if (index !== -1) {
        return url.slice(0, index + 4); // +4是为了包括“.jpg”
    }
    return url; // 如果没有找到“.jpg”，返回原字符串
  }
};