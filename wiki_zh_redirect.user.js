// ==UserScript==
// @name         维基百科中文统一跳转 (修复方言跳转)
// @namespace    https://greasyfork.org/scripts/your-script
// @version      1.3
// @description  方言(粤/吴/客/闽/赣/古) -> 中文; 移动版 -> 桌面版; 繁简变体 -> zh-cn
// @author       能用就行
// @license      MIT
// @include      /^https?:\/\/(zh|zh-min-nan|zh-yue|wuu|cdo|zh-classical|hak|gan)\.(m\.)?wikipedia\.org\/.*$/
// @run-at       document-start
// @grant        none
// ... 其他信息 ...
// @updateURL    https://raw.githubusercontent.com/nyjx/ssscriptzzz/main/wiki_zh_redirect.user.js
// @downloadURL  https://raw.githubusercontent.com/nyjx/ssscriptzzz/main/wiki_zh_redirect.user.js
// ==/UserScript==

(function() {
    'use strict';

    const currentUrl = new URL(window.location.href);
    const host = currentUrl.hostname;
    const parts = host.split('.');

    // =========================================================
    // 步骤 1: 强制移动版 -> 桌面版
    // =========================================================
    if (parts.includes('m')) {
        const newHost = parts.filter(part => part !== 'm').join('.');
        currentUrl.hostname = newHost;
        window.location.replace(currentUrl.href);
        return;
    }

    // =========================================================
    // 步骤 2: 主站 (zh) 变体统一 (zh-tw, zh-hk -> zh-cn)
    // =========================================================
    if (host === 'zh.wikipedia.org') {
        const pathParts = currentUrl.pathname.split('/');
        const variants = ['wiki', 'zh', 'zh-hans', 'zh-hant', 'zh-hk', 'zh-mo', 'zh-my', 'zh-sg', 'zh-tw'];

        if (pathParts.length > 1 && variants.includes(pathParts[1])) {
            // 如果不是 zh-cn，则跳转
            if (pathParts[1] !== 'zh-cn') {
                pathParts[1] = 'zh-cn';
                currentUrl.pathname = pathParts.join('/');
                window.location.replace(currentUrl.href);
            }
        }
    }

    // =========================================================
    // 步骤 3: 方言站点跳转 (DOM 读取)
    // =========================================================
    else {
        // 使用 DOMContentLoaded 确保页面元素已存在
        window.addEventListener('DOMContentLoaded', () => {

            // 定义一组可能的选择器，按优先级尝试查找“中文”链接
            // 1. .interlanguage-link-target[hreflang="zh"]: 新版标准通用选择器
            // 2. li.interwiki-zh a: 旧版/侧边栏标准选择器
            // 3. .uls-language-list a[hreflang="zh"]: ULS 弹窗选择器
            const selectors = [
                '.interlanguage-link-target[hreflang="zh"]',
                'li.interwiki-zh a',
                '.uls-language-list a[hreflang="zh"]',
                'a[title="中文"]', // 最后的兜底
            ];

            let zhLink = null;

            // 遍历查找
            for (let selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.href) {
                    zhLink = el;
                    console.log(`[WikiRedirect] Found link using selector: ${selector}`);
                    break;
                }
            }

            if (zhLink) {
                // 找到链接，跳转
                window.location.replace(zhLink.href);
            } else {
                console.log('[WikiRedirect] No Chinese (zh) link found on this page.');
            }
        });
    }

})();
