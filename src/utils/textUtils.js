/**
 * 清理文本，去除多余的空白字符和特殊字符
 * @param {string} text - 需要清理的文本
 * @returns {string} 清理后的文本
 */
export function cleanText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .trim() // 去除首尾空白
    .replace(/\s+/g, ' ') // 将多个空白字符替换为单个空格
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // 去除零宽度字符
}

/**
 * 提取数字，去除非数字字符
 * @param {string} text - 包含数字的文本
 * @returns {number} 提取出的数字，如果没有数字则返回 NaN
 */
export function extractNumber(text) {
  if (typeof text !== 'string') return NaN;
  
  const match = text.match(/[-+]?(\d*\.\d+|\d+)/);
  return match ? parseFloat(match[0]) : NaN;
}

/**
 * 截断文本到指定长度，并添加省略号
 * @param {string} text - 需要截断的文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * 将文本转换为 URL 友好的 slug
 * @param {string} text - 需要转换的文本
 * @returns {string} 转换后的 slug
 */
export function slugify(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除非单词字符（除了空格和连字符）
    .replace(/\s+/g, '-') // 将空格替换为连字符
    .replace(/--+/g, '-') // 将多个连字符替换为单个连字符
    .trim(); // 去除首尾空白
}

/**
 * 将首字母大写
 * @param {string} text - 需要处理的文本
 * @returns {string} 首字母大写的文本
 */
export function capitalizeFirstLetter(text) {
  if (typeof text !== 'string') return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}
