import { logger } from './logger.js';

const DB_NAME = 'PmsExtensionDB';
const DB_VERSION = 1;
const STORE_NAME = 'urls';

let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            logger.error('IndexedDB error:', event.target.error);
            reject('Error opening database');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            }
        };
    });
}

export const indexedDBStorage = {
    async init() {
        if (!db) {
            await openDB();
        }
    },

    async add(url, domain, status = 'pending') {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ url, domain, status, timestamp: Date.now() });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    },

    async get(domain) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result.filter(item => item.domain === domain);
                resolve(results);
            };
        });
    },

    async remove(url) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(url);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    },

    async clear(domain) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.domain === domain) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    },

    async updateStatus(url, status) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(url);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    data.status = status;
                    data.timestamp = Date.now();
                    store.put(data);
                    resolve();
                } else {
                    reject('URL not found');
                }
            };
        });
    }
};
