# Chrome侧边栏插件开发环境初始化

1. 目录结构：
   - manifest.json：插件配置文件
   - sidebar.html：侧边栏界面
   - icons/sidepane.png：侧边栏图标（需自行准备）
   - background.js：后台脚本
   - sidebar.js：侧边栏逻辑

2. 开发步骤：
   1. 在Chrome地址栏输入 `chrome://extensions/`
   2. 打开右上角"开发者模式"
   3. 点击"加载已解压的扩展程序"，选择当前项目根目录
   4. 通过菜单或快捷键打开侧边栏（默认快捷键：Ctrl+Shift+Y）