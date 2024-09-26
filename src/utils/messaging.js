import { logger } from './logger.js';

export const sendMessage = (action, data) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action, data }, response => {
            if (chrome.runtime.lastError) {
                logger.error(`Error sending message: ${action}`, chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
};
