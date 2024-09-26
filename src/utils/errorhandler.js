import { logger } from './logger.js';

export const handleError = (context, error) => {
    logger.error(`Error in ${context}:`, error);
    // 可以在这里添加更多的错误处理逻辑，比如发送错误报告等
};
