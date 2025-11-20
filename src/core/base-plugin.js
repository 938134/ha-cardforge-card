// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 必须实现的接口 ===
  getTemplate(config, data) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  getManifest() {
    throw new Error('必须实现 getManifest 方法');
  }

  // === 可选的生命周期方法 ===
  onConfigChange(newConfig, oldConfig) {}
  onEntitiesChange(newEntities, oldEntities) {}
  onThemeChange(newTheme, oldTheme) {}

  // === 工具方法 ===
  _renderSafeHTML(content) {
    if (!content) return '';
    return String(content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderIf(condition, template) {
    return condition ? template : '';
  }
}