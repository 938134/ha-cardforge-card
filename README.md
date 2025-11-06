# HA-CardForge - Home Assistant 自定义卡片

> Forge Your Perfect Dashboard

一个强大的 Home Assistant 自定义卡片，支持可视化编辑和实体数据绑定。
<img src="https://user-images.githubusercontent.com/xxx/1.png" width="400">
<img src="https://user-images.githubusercontent.com/xxx/2.png" width="400">

## 特性

- 🎨 三部分布局（标题、内容、页脚）
- ✏️ 可视化编辑器
- 📊 实体数据绑定
- 🎯 简洁易用的配置

## 安装

### 通过 HACS（推荐）
1. 在 HACS 中添加自定义仓库：`https://github.com/你的用户名/ha-cardforge`
2. 搜索 HA-CardForge 并安装
3. 在 Lovelace 中添加卡片

### 手动安装
1. 下载 `dist/ha-cardforge.js` 到你的 `www` 目录
2. 在 Lovelace 资源中添加：
```yaml
resources:
  - url: /local/ha-cardforge.js
    type: module
