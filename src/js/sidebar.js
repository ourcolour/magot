/**
 * sidebar.js
 * @author CC.Yao
 */

// --------------------
// Events
// --------------------
/**
 * DOMContentLoaded 事件
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('SidePane loaded');
    // 可添加API调用或交互逻辑
    await getData();
});
/**
 * 注册分析按钮点击事件
 */
document.querySelector('.btn-analyze')?.addEventListener('click', async (evt) => {
    // Dom
    const $checkAll     = document.querySelector('.check-all');
    const $tableRowList = document.querySelectorAll('.result tr td a.url');

    // 查询数据
    await getData();

    // 触发全选
    if (0 < $tableRowList.length) {
        $checkAll.click();
    }
});
/**
 * 注册全选按钮点击事件
 */
document.querySelector('.check-all')?.addEventListener('change', (evt) => {
    checkAll(evt.target.checked);
});
/**
 * 注册复制按钮点击事件
 * @param isChecked
 */
document.querySelector('.btn-copy')?.addEventListener('click', (evt) => {
    copyLinkList();
});

// --------------------
// Functions
// --------------------

// 磁力链接正则
const MAGNET_LINK_REGEX = /^(?<url>(magnet\:\?|ftp\:\/\/|ed2k\:\/\/)[^"']+)$/si;

/**
 * 复制链接列表
 */
function copyLinkList() {
    // 提取链接
    const $trList  = document.querySelectorAll('.result tr:has(input[name="check"]:checked)');
    const hrefList = Array.from($trList).map(($tr) => $tr.querySelector('.url').href);
    const value    = hrefList.join('\r\n');

    // 复制
    copyToClipboard(value);
}

/**
 * 赋值链接到剪贴板
 */
function copyToClipboard(value) {
    navigator.clipboard
        .writeText(value)
        .catch(() => {
            const $input = document.createElement('input');
            $input.value = value;
            document.body.appendChild($input);
            $input.select();
            document.execCommand('copy');
            document.body.removeChild($input);
        });
}

/**
 * 全选表格项
 * @param isChecked
 */
function checkAll(isChecked) {
    // Nodes
    const $checkList = document.querySelectorAll('.result input[name="check"]');
    // 排除自己
    for (const $check of $checkList) {
        if ('-1' === $check.value) {
            continue;
        }
        $check.checked = isChecked;
    }
}

/**
 * 触发复制链接显示状态
 */
function toggleDownloadAvailableStatus() {
    // Nodes
    const $checkList  = document.querySelectorAll('.result input[name="check"]');
    const $copyButton = document.querySelector('.btn-copy');
    const $totalCount = document.querySelector('.total-count');

    // 没有表格项目
    if (1 > $checkList.length) {
        $copyButton.style.display = 'none';
        $totalCount.innerHTML     = 0;
    } else {
        $copyButton.style.display = 'inline-flex';
        $totalCount.innerHTML     = $checkList.length;
    }
}

/**
 * 获取数据
 * @returns {Promise<void>}
 */
async function getData() {
    // Nodes
    const result    = document.querySelector('.result');
    const $checkAll = document.querySelector('.check-all');

    // 显示链接
    result.innerHTML = await buildResultTable();

    // 全选checkbox取消选择
    $checkAll.checked = false;

    // 触发复制链接显示状态
    toggleDownloadAvailableStatus();
}

/**
 * 构建结果表格
 * @param dataList
 * @returns {string}
 */
async function buildResultTable() {
    /**
     * 提取磁力链接
     * @param html
     */
    async function _extractLinkList() {
        // 获取当前tab
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tabs || 1 > tabs.length) {
            return null;
        }
        const currentTab = tabs[0];

        // 提取所有<a>标签
        const data = await chrome.scripting.executeScript({
            target: {tabId: currentTab.id}, func: () => {
                // 提取所有 <a> 标签的 href 和 title 属性
                return Array.from(document.querySelectorAll('a'), a => ({
                    href: a.href, title: a.title, html: a.textContent
                }));
            }
        });
        if (!data || 1 > data.length || !data[0].result || 1 > data[0].result) {
            return null;
        }
        const $aList = data[0].result;

        // 根据正则筛选有效项
        const result = [];
        $aList.forEach(($a) => {
            // 提取属性
            const href      = $a.href;
            const title     = $a.title;
            const innerHTML = $a.html;

            if (href.match(MAGNET_LINK_REGEX)) {
                $a.type = 'magnet'
                result.push($a);
            }
        });

        return result;
    }

    /**
     * 构建结果表格行
     * @param item
     * @param index
     * @returns {string}
     */
    function _buildRow(item, index) {
        return `<tr>
                    <td>
                        <input type="checkbox" name="check" value="${index}">
                    </td>
                    <td>${index}</td>
                    <td>
                        <a class="url" href="${item.href}" title="${item.href}" target="_blank">${item.html}</a>
                    </td>
                    <td>
                        <a class="url" href="${item.href}">
                            <iconpark-icon name="${'magnet' === item.type ? 'magnet-gkn1jh56' : 'link-one'}"></iconpark-icon>
                        </a>
                    </td>
                 </tr>`;
    }

    // 提取磁力链接
    let dataList = await _extractLinkList();
    if (!dataList) {
        dataList = []
    }
    // 所有行
    const rowHtmlList = dataList.map((item, index) => _buildRow(item, index + 1));

    // 构建html
    let html = `<td colspan="4">（无）</td>`;
    if (0 < rowHtmlList.length) {
        html = rowHtmlList.join('');
    }

    return `${html}`;
}

// --------------------
// Init
// --------------------
(async () => {
    await getData();
})();