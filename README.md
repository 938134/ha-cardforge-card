# HA-CardForge - 智能卡片工坊

> Forge Your Perfect Dashboard - 构建完美的智能家居仪表盘

一个革命性的 Home Assistant 自定义卡片系统，基于插件化架构，支持可视化编辑和智能数据绑定。

![编辑器界面](https://user-images.githubusercontent.com/xxx/editor.png)
![卡片预览](https://user-images.githubusercontent.com/xxx/cards.png)

## 🚀 核心特性

### 🧩 插件化架构
- **自动发现插件** - 系统自动加载所有可用卡片插件
- **统一接口规范** - 所有插件遵循相同的开发标准
- **热插拔设计** - 新增插件无需重启系统

### 🎨 可视化编辑系统
- **智能配置向导** - 根据插件类型自动调整配置界面
- **实时预览** - 配置更改即时反映在预览中
- **主题系统** - 内置多种视觉主题，支持自定义

### 📊 智能数据管理
- **三种实体策略**：
  - **自由布局** - 任意添加和排列内容块
  - **结构化配置** - 智能数据源绑定
  - **无状态模式** - 使用内置智能数据
- **实体验证** - 自动检测配置完整性

### 🎯 统一配置系统
- **基础设置** - 字体、对齐、间距、动画等统一配置
- **高级设置** - 插件特定功能配置
- **响应式设计** - 自动适配不同屏幕尺寸

## 🛠 安装指南

### 通过 HACS（推荐）
1. 在 HACS 中添加自定义仓库：`https://github.com/你的用户名/ha-cardforge`
2. 搜索 "CardForge" 并安装
3. 重启 Home Assistant
4. 在 Lovelace 中添加自定义卡片

### 手动安装
1. 下载最新版本的 `ha-cardforge.js` 到 `config/www/` 目录
2. 在 Lovelace 资源配置中添加：
```yaml
resources:
  - url: /local/ha-cardforge.js
    type: module
    