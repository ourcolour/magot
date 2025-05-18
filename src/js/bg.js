// --------------------
// Service Worker
// --------------------


// --------------------
// Inits
// --------------------
console.log('Background service worker started');

/**
 * 注册打开侧边栏
 */
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});

/**
 * 插件成功加载
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

/**
 * 监听页面更新事件
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`页面更新: ${changeInfo.status} ${tabId} ${JSON.stringify(changeInfo)}`);
    if ('loading' === changeInfo.status) {
        // // 页面加载完成，通知 popup.js 重新获取数据
        // chrome.runtime.sendMessage({
        //     type : 'pageLoading',
        //     tabId: tabId,
        //     url  : tab.url,
        // });
    }
});
/**
 * 监听tab切换事件
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    // // 获取当前激活标签页的 ID
    // const tabId = activeInfo.tabId;
    //
    // // 获取当前 tab 信息
    // chrome.tabs.get(tabId, function (tab) {
    //     // 页面激活，通知 popup.js 重新获取数据
    //     chrome.runtime.sendMessage({
    //         type : 'tabActivated',
    //         tabId: tabId,
    //         url  : tab.url,
    //     });
    // });
});

/**
 * 接受消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`收到消息: ${message} Sender: ${sender} Response: ${sendResponse}`);

    /* 解析命令 */
    // 下载图片
    if ('getMagnetList' === message.type) {
        extractMagnetLinkList().then(data =>
            sendResponse({data: data})
        );
    }
});

// --------------------
// Functions
// --------------------

// 磁力链接正则
const MAGNET_LINK_REGEX = /(?:["']^(?<url>(magnet\:\?|ftp\:\/\/|ed2k\:\/\/)[^"']+)$["'])/gi;

/**
 * 提取磁力链接
 * @param html
 */
async function extractMagnetLinkList() {
    // 获取当前tab
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tabs || 1 > tabs.length) {
        return null;
    }
    const currentTab = tabs[0];

    // html
    const data = await chrome.scripting.executeScript({
        target: {tabId: currentTab.id},
        func  : () => document.documentElement.outerHTML,
    });
    if (!data || 1 > data.length || !data[0].result) {
        return null;
    }
    const html = data[0].result;
    console.log(`HTML: ${html}`);

    // 所有匹配结果
    const matchList = html.matchAll(MAGNET_LINK_REGEX);
    const result    = [];
    for (const match of matchList) {
        const url = match.groups?.url;
        console.log(`MAGNET: ${url}`);
        result.push(url)
    }

    return result;
}
