export const cleanUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
};
export const getDomain = (url) => {
    const urlObj = new URL(url);
    return urlObj.hostname;
};