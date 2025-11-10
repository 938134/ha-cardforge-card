// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // 必需方法 - 子类必须实现
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // 主题变化回调 - 子类可重写
  onThemeChanged(themeId, themeVariables) {
    // 默认实现，子类可重写以响应主题变化
    console.log(`主题已更改为: ${themeId}`, themeVariables);
  }

  // 获取主题化样式 - 工具方法
  _getThemedStyles(config, baseStyles) {
    const theme = config.theme || 'default';
    const themeVars = ThemeManager.getThemeVariables(theme);
    
    return `
      .cardforge-card {
        background: var(--cardforge-background, ${themeVars['--cardforge-bg-color']});
        color: var(--cardforge-text-color, ${themeVars['--cardforge-text-color']});
        border-radius: var(--cardforge-border-radius, ${themeVars['--cardforge-border-radius']});
        padding: var(--cardforge-padding, ${themeVars['--cardforge-padding']});
        box-shadow: var(--cardforge-shadow, ${themeVars['--cardforge-shadow']});
      }
      ${baseStyles}
    `;
  }

  // 获取主题背景色
  _getThemeBackground(config) {
    const theme = config.theme || 'default';
    const themeVars = ThemeManager.getThemeVariables(theme);
    return themeVars['--cardforge-background'] || themeVars['--cardforge-bg-color'];
  }

  // 获取主题主色
  _getThemePrimaryColor(config) {
    const theme = config.theme || 'default';
    const themeVars = ThemeManager.getThemeVariables(theme);
    return themeVars['--cardforge-primary-color'];
  }

  // 获取主题文字色
  _getThemeTextColor(config) {
    const theme = config.theme || 'default';
    const themeVars = ThemeManager.getThemeVariables(theme);
    return themeVars['--cardforge-text-color'];
  }

  // 可选方法 - 实体需求定义
  getEntityRequirements() {
    return [];
  }

  // 工具方法
  _getEntityState(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _formatTime(timeStr) {
    if (!timeStr) return '00:00';
    return timeStr.split(':').slice(0, 2).join(':');
  }

  _formatDate(dateStr) {
    if (!dateStr) return '2000-01-01';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  }
}