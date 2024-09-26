import { logger } from '../utils/logger.js';
import { indexedDBStorage } from '../utils/db.js';
import { handleError } from '../utils/errorhandler.js';
import { cleanUrl } from '../utils/urlutils.js';

export const cache = {
    async getAll(domain) {
        try {
            return await indexedDBStorage.get(domain);
        } catch (error) {
            handleError('cache.getAll', error);
            throw error;
        }
    },

    async clear(domain) {
        try {
            await indexedDBStorage.clear(domain);
        } catch (error) {
            handleError('cache.clear', error);
            throw error;
        }
    },

    async get(domain) {
        try {
            return await indexedDBStorage.get(domain);
        } catch (error) {
            handleError('cache.get', error);
            throw error;
        }
    },

    async add(url, domain) {
        try {
            const cleanedUrl = cleanUrl(url);
            await indexedDBStorage.add(cleanedUrl, domain);
            logger.info(`Added URL to cache: ${cleanedUrl}`);
        } catch (error) {
            handleError('cache.add', error);
            throw error;
        }
    },

    async remove(url, domain) {
        try {
            const cleanedUrl = cleanUrl(url);
            await indexedDBStorage.remove(cleanedUrl);
            logger.info(`Removed URL from cache: ${cleanedUrl}`);
        } catch (error) {
            handleError('cache.remove', error);
            throw error;
        }
    },

    async updateStatus(url, status) {
        try {
            const cleanedUrl = cleanUrl(url);
            await indexedDBStorage.updateStatus(cleanedUrl, status);
            logger.info(`Updated status for URL: ${cleanedUrl} to ${status}`);
        } catch (error) {
            handleError('cache.updateStatus', error);
            throw error;
        }
    }
};
