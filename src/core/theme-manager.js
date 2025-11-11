// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();

  static init() {
    this._registerBuiltinThemes();
  }

  static _registerBuiltinThemes() {
    const builtinThemes = {
      'default': {
        id: 'default',
        name: '默认主题'
      },
      'dark': {
        id: 'dark', 
        name: '深色主题'
      },
      'material': {
        id: 'material',
        name: '材质设计'
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static getTheme(themeId) {
    return this._themes.get(themeId) || this._themes.get('default');
  }

  static getAllThemes() {
    return Array.from(this._themes.values());
  }

  // 简化主题应用，只在卡片组件中处理样式
  static applyTheme(element, themeId) {
    // 这里不实际应用样式，样式由各插件自己处理
    // 只是记录主题选择
    return true;
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };