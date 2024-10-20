import { logger } from '../utils/logger.js';
import { cleanText } from '../utils/textUtils.js';
import { getDomain } from '../utils/urlutils.js';

export const parser = {
  parsePageData: function (rawData) {
    try {
      const domain = getDomain(rawData.url);
      const parseMethod = this.getParseMethod(domain);

      if (!parseMethod) {
        throw new Error(`不支持的域名: ${domain}`);
      }

      const parsedData = parseMethod(rawData);
      return { success: true, data: parsedData };
    } catch (error) {
      logger.error('解析数据时出错:', error);
      return { success: false, error: error.message };
    }
  },

  getParseMethod: function (domain) {
    const parseMethods = {
      'www.aliexpress.com': this.parseAliexpress,
      'www.amazon.com': this.parseAmazon,
      'www.ebay.com': this.parseEbay,
      // 可以添加更多网站的解析方法
    };

    return parseMethods[domain];
  },

  parseAliexpress: function (rawData) {
    // 实现 Aliexpress 特定的解析逻辑
    return {
      id: rawData.id,
      source: 'aliexpress',
      url: rawData.url,
      title: rawData.title,
      stock: 999,
      unit: 'pcs',
      shortDescription: rawData.shortDescription,
      description: rawData.description,
      price: {
        price: rawData.price.match(/\d+(\.\d+)?/)[0],
        currency: rawData.currency,
      },
      package: {
        unit: 'pcs',
        weight: 1,
      },
      store: {
        name: rawData.storeName,
        link: rawData.storeLink,
        address: rawData.storeAddress
      },
      images: rawData.images,
      //attributes: rawData.skus,
      specifications: rawData.specifications,
      //variants: rawData.skus
    };
  },

  parseAmazon: function (rawData) {
    // 实现 Amazon 特定的解析逻辑
    return {
      url: rawData.url,
      title: rawData.title,
      price: rawData.price,
      description: rawData.description,
      images: rawData.images
    };
  },

  parseEbay: function (rawData) {
    // 实现 eBay 特定的解析逻辑
    return {
      url: rawData.url,
      title: rawData.title,
      price: rawData.price,
      description: rawData.description,
      images: rawData.images,
      specifications: rawData.specifications
    };
  },

  // 通用的解析方法...
};
