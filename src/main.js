// src/main.js
import { HaCardForgeEditor } from './editors/ha-cardforge-editor.js';
import { PluginRegistry } from './core/plugin-registry.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

// 注册到 Home Assistant 自定义卡片
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持自动发现和实时预览',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

// 导出公共 API
window.CardForge = {
  version: '1.0.0',
  core: {
    HaCardForgeCard,
    PluginRegistry
  },
  editors: {
    HaCardForgeEditor
  },
  utils: {
    createCard: (config) => {
      const card = document.createElement('ha-cardforge-card');
      card.setConfig(config);
      return card;
    },
    getAvailablePlugins: () => PluginRegistry.getAllPlugins(),
    generatePluginTemplate: (pluginId, pluginName) => 
      PluginRegistry.generatePluginStub(pluginId, pluginName)
  }
};

console.log('🎉 卡片工坊初始化完成');
