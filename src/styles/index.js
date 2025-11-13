// src/themes/index.js
export { BaseTheme } from './base-theme.js';
export { GlassTheme } from './glass-theme.js';
export { GradientTheme } from './gradient-theme.js';
export { NeonTheme } from './neon-theme.js';

export class ThemeManager {
  static themes = {
    'auto': BaseTheme,
    'glass': GlassTheme,
    'gradient': GradientTheme,
    'neon': NeonTheme
  };

  static getTheme(themeId) {
    return this.themes[themeId] || this.themes.auto;
  }

  static getAllThemes() {
    return Object.keys(this.themes).map(id => ({
      id,
      name: this.getTheme(id).themeName,
      description: this.getTheme(id).themeDescription,
      supportsGradient: this.getTheme(id).getThemeConfig().useGradient
    }));
  }

  static applyTheme(config, element) {
    const ThemeClass = this.getTheme(config.theme || 'auto');
    const theme = new ThemeClass(config);
    return theme.apply(element);
  }

  static getThemeConfig(themeId) {
    const ThemeClass = this.getTheme(themeId);
    return ThemeClass.getThemeConfig();
  }
}