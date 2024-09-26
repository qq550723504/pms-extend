import { sendMessage } from '../utils/messaging.js';
import { handleError } from '../utils/errorhandler.js';
import { config } from './config.js';

export const storage = {
    failedKey: "failedUrls",

    async get() {
        try {
            return await sendMessage("pms.getCache", {
                domain: config.gather.source.ALIEXPRESS,
            });
        } catch (error) {
            handleError('storage.get', error);
            throw error;
        }
    },

    async getByKey(key) {
        try {
            return await sendMessage("pms.getByKey", { key });
        } catch (error) {
            handleError('storage.getByKey', error);
            throw error;
        }
    },

    async clear() {
        try {
            await sendMessage("pms.cleanHistory", {
                domain: config.gather.source.ALIEXPRESS,
            });
        } catch (error) {
            handleError('storage.clear', error);
            throw error;
        }
    },

    async addByKey(key, url) {
        try {
            return await sendMessage("pms.addByKey", { key, url });
        } catch (error) {
            handleError('storage.addByKey', error);
            throw error;
        }
    },
};
