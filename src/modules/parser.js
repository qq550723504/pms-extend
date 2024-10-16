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
      url: rawData.url,
      title: rawData.title,
      price: {
        price: rawData.price.match(/\d+(\.\d+)?/)[0],
        currency: rawData.currency,
      },
      description: rawData.description,
      images: rawData.images,
      specifications: rawData.specifications.map(spec => {
        return {
          name: spec.key,
          value: spec.value
        }
      }),
      variants: rawData.skus.map(sku => {
        return {
          attrs: sku.name,
          currency: rawData.currency,
          price: sku.price.match(/\d+(\.\d+)?/)[0],
          stock: 999
        }
      }),
      createdAt: new Date().toISOString(),
      stock: 999
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
