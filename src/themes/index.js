// src/themes/index.js
import { autoTheme } from './auto-theme.js';
import { glassTheme } from './glass-theme.js';
import { gradientTheme } from './gradient-theme.js';
import { neonTheme } from './neon-theme.js';
import { poetryTheme } from './poetry-theme.js'; 

class ThemeManager {
  constructor() {
    this.themes = new Map();
    this._initializeThemes();
  }

  _initializeThemes() {
    // 注册所有主题
    this.registerTheme(autoTheme);
    this.registerTheme(glassTheme);
    this.registerTheme(gradientTheme);
    this.registerTheme(neonTheme);
    this.registerTheme(poetryTheme); 
  }

  registerTheme(theme) {
    if (!theme.id || !theme.name) {
      console.warn('主题缺少必要属性，跳过注册:', theme);
      return;
    }
    this.themes.set(theme.id, theme);
    console.log(`✅ 注册主题: ${theme.name}`);
  }

  getTheme(themeId) {
    return this.themes.get(themeId) || this.themes.get('auto');
  }

  getAllThemes() {
    return Array.from(this.themes.values());
  }

  getThemeStyles(themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (theme && typeof theme.getStyles === 'function') {
      return theme.getStyles(config);
    }
    return '';
  }

  getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    return theme?.preview || {};
  }

  // 应用主题到元素
  applyTheme(element, themeId, config = {}) {
    const theme = this.getTheme(themeId);
    if (!theme || !element) return;

    // 移除其他主题类
    this.getAllThemes().forEach(t => {
      element.classList.remove(`theme-${t.id}`);
    });

    // 添加当前主题类
    element.classList.add(`theme-${themeId}`);

    // 应用主题样式
    if (typeof theme.applyTheme === 'function') {
      theme.applyTheme(element, config);
    }
  }

  // 获取主题配置选项
  getThemeConfig(themeId) {
    const theme = this.getTheme(themeId);
    return theme?.config || {};
  }
}

// 创建全局主题管理器实例
const themeManager = new ThemeManager();

export { themeManager, ThemeManager };
export default themeManager;