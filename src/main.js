// src/main.js (更新版本)
import { HaCardForgeCard } from './main-card.js';
import { CardEditor } from './ui/card-editor.js';
import { PluginBrowser } from './ui/plugin-browser.js';
import { EntityPicker } from './ui/entity-picker.js';
import { PluginManager } from './core/plugin-manager.js';

// 注册内置插件
import { TimeWeekPlugin } from './plugins/time-week.js';
import { TimeCardPlugin } from './plugins/time-card.js';
import { WeatherPlugin } from './plugins/weather.js';
import { ClockLunarPlugin } from './plugins/clock-lunar.js';
import { WelcomePlugin } from './plugins/welcome.js';

// 安全的组件注册函数
function safeDefine(elementName, elementClass) {
  if (!customElements.get(elementName)) {
    customElements.define(elementName, elementClass);
    console.log(`✅ 注册组件: ${elementName}`);
  } else {
    console.log(`⚠️ 组件已注册: ${elementName}`);
  }
}

// 注册所有组件
safeDefine('ha-cardforge-card', HaCardForgeCard);
safeDefine('ha-cardforge-editor', CardEditor);
safeDefine('plugin-browser', PluginBrowser);
safeDefine('entity-picker', EntityPicker);

// 初始化插件管理器
const pluginManager = new PluginManager();
pluginManager.registerPlugin(TimeWeekPlugin);
pluginManager.registerPlugin(TimeCardPlugin);
pluginManager.registerPlugin(WeatherPlugin);
pluginManager.registerPlugin(ClockLunarPlugin);
pluginManager.registerPlugin(WelcomePlugin);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件市场的卡片系统',
    preview: true
  });
}

console.log('🎉 卡片工坊初始化完成');