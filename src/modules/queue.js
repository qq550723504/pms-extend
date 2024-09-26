import { logger } from '../utils/logger.js';
import { cache } from './cache.js';
import { parser } from './parser.js';

export const queue = {
  RUNNING: "running",
  STOPPED: "stopped",
  state: "stopped",
  timer: null,

  isRunning: function () {
    return this.state === this.RUNNING;
  },

  run: function () {
    this.state = this.RUNNING;
  },

  stop: function () {
    this.state = this.STOPPED;
  },

  runPostProduct: async function (domain, auto = false) {
    if (!auto && this.isRunning()) return;

    this.run();

    try {
      const items = await cache.get(domain);
      const pendingItems = items.filter(item => item.status === 'pending');

      if (pendingItems.length === 0) {
        this.stop();
        return;
      }

      const batchSize = 5; // 可以根据需要调整批处理大小
      const batch = pendingItems.slice(0, batchSize);

      const results = await Promise.all(batch.map(async (item) => {
        logger.info("正在处理:", item.url);
        try {
          const rep = await this.captureAndSendData({
            url: item.url,
            parser: parser.aliexpress, // 使用导入的 parser
          });

          if (rep.success) {
            logger.info("处理成功:", item.url);
            await cache.updateStatus(item.url, 'success');
            return { success: true, url: item.url };
          } else {
            logger.info("处理失败:", item.url);
            await cache.updateStatus(item.url, 'failed');
            return { success: false, url: item.url };
          }
        } catch (error) {
          logger.error("处理出错:", item.url, error);
          await cache.updateStatus(item.url, 'error');
          return { success: false, url: item.url, error };
        }
      }));

      const successCount = results.filter(r => r.success).length;
      logger.info(`批处理完成，成功: ${successCount}, 失败: ${batch.length - successCount}`);

      if (pendingItems.length > batchSize) {
        // 如果还有剩余项，继续处理
        this.runPostProduct(domain, true);
      } else {
        this.stop();
      }
    } catch (error) {
      logger.error("runPostProduct 出错:", error);
      this.stop();
    }
  },

  sendDataToServer: async function (data) {
    try {
      // 这里应该包含实际发送数据到服务器的逻辑
      const response = await fetch(pms.config.gather.url.postProductApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('服务器响应不成功');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('发送数据到服务器时出错:', error);
      throw error;
    }
  },
};
