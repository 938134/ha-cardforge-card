// src/core/theme-manager.js
class ThemeManager {
  static _themes = new Map();
  static _currentTheme = 'default';
  static _customThemes = new Map();
  static _systemThemes = new Map();

  static init() {
    this._registerBuiltinThemes();
    this._loadSystemThemes();
    this._loadCustomThemes();
    this._loadCurrentTheme();
    console.log(`🎨 主题管理器初始化完成，加载 ${this._themes.size} 个主题`);
  }

  static _registerBuiltinThemes() {
    const builtinThemes = {
      'default': {
        id: 'default',
        name: '默认主题',
        icon: '🎨',
        description: '使用 Home Assistant 默认主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color)',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-accent-color': 'var(--accent-color)',
          '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
        }
      },
      'dark': {
        id: 'dark',
        name: '深色主题',
        icon: '🌙',
        description: '适合暗色模式的深色主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#1e1e1e',
          '--cardforge-text-color': '#ffffff',
          '--cardforge-primary-color': '#bb86fc',
          '--cardforge-accent-color': '#03dac6',
          '--cardforge-border-radius': '12px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 4px 8px rgba(0,0,0,0.3)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #bb86fc, #03dac6)'
        }
      },
      'material': {
        id: 'material',
        name: '材质设计',
        icon: '⚡',
        description: 'Google Material Design 风格',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee',
          '--cardforge-accent-color': '#03dac6',
          '--cardforge-border-radius': '8px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #6200ee, #03dac6)'
        }
      },
      'minimal': {
        id: 'minimal',
        name: '极简风格',
        icon: '📱',
        description: '简洁的极简主义设计',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'transparent',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-accent-color': 'var(--accent-color)',
          '--cardforge-border-radius': '0px',
          '--cardforge-padding': '12px',
          '--cardforge-shadow': 'none',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
        }
      },
      'modern': {
        id: 'modern',
        name: '现代风格',
        icon: '💎',
        description: '现代时尚的设计风格',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': 'rgba(255, 255, 255, 0.9)',
          '--cardforge-text-color': '#2c3e50',
          '--cardforge-primary-color': '#3498db',
          '--cardforge-accent-color': '#9b59b6',
          '--cardforge-border-radius': '16px',
          '--cardforge-padding': '20px',
          '--cardforge-shadow': '0 8px 32px rgba(0,0,0,0.1)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #667eea, #764ba2)'
        }
      },
      'warm': {
        id: 'warm',
        name: '温暖色调',
        icon: '🔥',
        description: '温暖的橙色系主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#fff8f0',
          '--cardforge-text-color': '#5c4b37',
          '--cardforge-primary-color': '#e67e22',
          '--cardforge-accent-color': '#d35400',
          '--cardforge-border-radius': '12px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 4px 12px rgba(230, 126, 34, 0.2)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #e67e22, #d35400)'
        }
      },
      'cool': {
        id: 'cool',
        name: '冷色调',
        icon: '❄️',
        description: '冷静的蓝色系主题',
        type: 'builtin',
        variables: {
          '--cardforge-bg-color': '#f8fafc',
          '--cardforge-text-color': '#2d3748',
          '--cardforge-primary-color': '#3498db',
          '--cardforge-accent-color': '#2980b9',
          '--cardforge-border-radius': '12px',
          '--cardforge-padding': '16px',
          '--cardforge-shadow': '0 4px 12px rgba(52, 152, 219, 0.2)',
          '--cardforge-welcome-bg': 'linear-gradient(135deg, #3498db, #2980b9)'
        }
      }
    };

    Object.entries(builtinThemes).forEach(([id, theme]) => {
      this._themes.set(id, theme);
    });
  }

  static _loadSystemThemes() {
    try {
      // 检测并加载 Home Assistant 系统主题
      if (window.themes && window.themes.themes) {
        console.log('🔍 检测到系统主题:', Object.keys(window.themes.themes));
        
        Object.entries(window.themes.themes).forEach(([themeName, themeConfig]) => {
          if (themeConfig && typeof themeConfig === 'object') {
            const systemTheme = {
              id: `system-${themeName}`,
              name: `系统: ${themeName}`,
              icon: '🏠',
              description: `Home Assistant 系统主题: ${themeName}`,
              type: 'system',
              variables: this._convertSystemTheme(themeConfig, themeName)
            };
            this._systemThemes.set(systemTheme.id, systemTheme);
            this._themes.set(systemTheme.id, systemTheme);
          }
        });
        
        console.log(`✅ 加载 ${this._systemThemes.size} 个系统主题`);
      } else {
        console.log('ℹ️ 未检测到系统主题');
      }
    } catch (error) {
      console.warn('加载系统主题失败:', error);
    }
  }

  static _convertSystemTheme(systemTheme, themeName) {
    // 将系统主题转换为卡片工坊主题变量
    const getVariable = (key, fallback) => {
      // 尝试从系统主题获取变量
      if (systemTheme[key]) return systemTheme[key];
      
      // 尝试从 CSS 变量获取
      const cssVar = `--${key.replace(/_/g, '-')}`;
      if (systemTheme[cssVar]) return systemTheme[cssVar];
      
      return fallback;
    };

    return {
      '--cardforge-bg-color': getVariable('card_background_color', 'var(--card-background-color)'),
      '--cardforge-text-color': getVariable('primary_text_color', 'var(--primary-text-color)'),
      '--cardforge-primary-color': getVariable('primary_color', 'var(--primary-color)'),
      '--cardforge-accent-color': getVariable('accent_color', 'var(--accent-color)'),
      '--cardforge-border-radius': getVariable('ha_card_border_radius', 'var(--ha-card-border-radius, 12px)'),
      '--cardforge-padding': '16px',
      '--cardforge-shadow': getVariable('ha_card_box_shadow', 'var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1))'),
      '--cardforge-welcome-bg': `linear-gradient(135deg, ${getVariable('primary_color', 'var(--primary-color)')}, ${getVariable('accent_color', 'var(--accent-color)')})`
    };
  }

  static _loadCustomThemes() {
    try {
      const stored = localStorage.getItem('cardforge-custom-themes');
      if (stored) {
        const customThemes = JSON.parse(stored);
        customThemes.forEach(theme => {
          this._customThemes.set(theme.id, theme);
          this._themes.set(theme.id, { ...theme, type: 'custom' });
        });
        console.log(`✅ 加载 ${customThemes.length} 个自定义主题`);
      }
    } catch (error) {
      console.warn('加载自定义主题失败:', error);
    }
  }

  static _loadCurrentTheme() {
    try {
      const saved = localStorage.getItem('cardforge-current-theme');
      if (saved && this._themes.has(saved)) {
        this._currentTheme = saved;
        console.log(`🎯 加载当前主题: ${saved}`);
      } else {
        console.log('🎯 使用默认主题');
      }
    } catch (error) {
      console.warn('加载当前主题失败:', error);
    }
  }

  static _saveCustomThemes() {
    try {
      const customThemes = Array.from(this._customThemes.values());
      localStorage.setItem('cardforge-custom-themes', JSON.stringify(customThemes));
    } catch (error) {
      console.warn('保存自定义主题失败:', error);
    }
  }

  // 公共 API
  static getAllThemes() {
    return Array.from(this._themes.values());
  }

  static getBuiltinThemes() {
    return Array.from(this._themes.values()).filter(theme => theme.type === 'builtin');
  }

  static getSystemThemes() {
    return Array.from(this._systemThemes.values());
  }

  static getCustomThemes() {
    return Array.from(this._customThemes.values());
  }

  static getTheme(themeId) {
    const theme = this._themes.get(themeId);
    if (!theme) {
      console.warn(`主题 ${themeId} 不存在，返回默认主题`);
      return this._themes.get('default');
    }
    return theme;
  }

  static getCurrentTheme() {
    return this.getTheme(this._currentTheme);
  }

  static setCurrentTheme(themeId) {
    if (this._themes.has(themeId)) {
      this._currentTheme = themeId;
      localStorage.setItem('cardforge-current-theme', themeId);
      console.log(`✅ 设置当前主题: ${themeId}`);
      return true;
    } else {
      console.warn(`设置主题失败: ${themeId} 不存在`);
      return false;
    }
  }

  static applyTheme(element, themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    if (!theme) {
      console.warn(`应用主题失败: ${themeId} 不存在`);
      return false;
    }

    try {
      const root = element.shadowRoot || element;
      this._removeExistingTheme(root);
      this._injectThemeStyles(root, theme);
      
      console.log(`✅ 应用主题: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('应用主题失败:', error);
      return false;
    }
  }

  static _removeExistingTheme(root) {
    const existing = root.querySelector('style[data-cardforge-theme]');
    if (existing) {
      existing.remove();
    }
  }

  static _injectThemeStyles(root, theme) {
    const style = document.createElement('style');
    style.setAttribute('data-cardforge-theme', theme.id);
    
    let css = `
      /* 卡片工坊主题样式 - ${theme.name} */
      .cardforge-card {
        background: var(--cardforge-bg-color);
        color: var(--cardforge-text-color);
        border-radius: var(--cardforge-border-radius);
        padding: var(--cardforge-padding);
        box-shadow: var(--cardforge-shadow);
        transition: all 0.3s ease;
      }
      
      .cardforge-welcome {
        background: var(--cardforge-welcome-bg) !important;
        color: white !important;
        border: none !important;
      }
      
      .cardforge-primary {
        color: var(--cardforge-primary-color) !important;
      }
      
      .cardforge-accent {
        color: var(--cardforge-accent-color) !important;
      }
      
      .cardforge-border {
        border: 1px solid var(--cardforge-primary-color);
      }
    `;
    
    // 添加主题特定的样式覆盖
    css += this._getThemeOverrides(theme.id);
    
    style.textContent = css;
    root.appendChild(style);
  }

  static _getThemeOverrides(themeId) {
    const overrides = {
      'dark': `
        .cardforge-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cardforge-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }
      `,
      'material': `
        .cardforge-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cardforge-card:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
      `,
      'minimal': `
        .cardforge-card {
          border: none;
          background: transparent;
        }
      `,
      'modern': `
        .cardforge-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .cardforge-card:hover {
          backdrop-filter: blur(16px);
        }
      `,
      'warm': `
        .cardforge-card {
          border: 1px solid rgba(230, 126, 34, 0.2);
        }
        .cardforge-card:hover {
          border-color: rgba(230, 126, 34, 0.4);
        }
      `,
      'cool': `
        .cardforge-card {
          border: 1px solid rgba(52, 152, 219, 0.2);
        }
        .cardforge-card:hover {
          border-color: rgba(52, 152, 219, 0.4);
        }
      `,
      'default': `
        .cardforge-card {
          border: 1px solid var(--divider-color);
        }
      `
    };
    
    return overrides[themeId] || overrides['default'];
  }

  // 自定义主题管理
  static createCustomTheme(themeData) {
    const themeId = `custom-${Date.now()}`;
    const theme = {
      id: themeId,
      name: themeData.name || '自定义主题',
      icon: themeData.icon || '🎨',
      description: themeData.description || '用户自定义主题',
      type: 'custom',
      variables: {
        ...this.getTheme('default').variables,
        ...themeData.variables
      },
      created: new Date().toISOString()
    };

    this._customThemes.set(themeId, theme);
    this._themes.set(themeId, theme);
    this._saveCustomThemes();
    
    console.log(`✅ 创建自定义主题: ${themeId}`);
    return themeId;
  }

  static updateCustomTheme(themeId, themeData) {
    if (this._customThemes.has(themeId)) {
      const theme = this._customThemes.get(themeId);
      const updatedTheme = {
        ...theme,
        ...themeData,
        updated: new Date().toISOString()
      };
      
      this._customThemes.set(themeId, updatedTheme);
      this._themes.set(themeId, updatedTheme);
      this._saveCustomThemes();
      
      console.log(`✅ 更新自定义主题: ${themeId}`);
      return true;
    }
    console.warn(`更新主题失败: ${themeId} 不存在`);
    return false;
  }

  static deleteCustomTheme(themeId) {
    if (this._customThemes.has(themeId)) {
      if (this._currentTheme === themeId) {
        this.setCurrentTheme('default');
      }
      this._customThemes.delete(themeId);
      this._themes.delete(themeId);
      this._saveCustomThemes();
      
      console.log(`✅ 删除自定义主题: ${themeId}`);
      return true;
    }
    console.warn(`删除主题失败: ${themeId} 不存在`);
    return false;
  }

  // 工具方法
  static getThemeVariables(themeId = null) {
    const theme = this.getTheme(themeId || this._currentTheme);
    return theme ? theme.variables : {};
  }

  static exportTheme(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) {
      console.warn(`导出主题失败: ${themeId} 不存在`);
      return null;
    }
    
    const exportedTheme = {
      ...theme,
      exported: new Date().toISOString(),
      version: '1.0.0'
    };
    
    console.log(`✅ 导出主题: ${themeId}`);
    return exportedTheme;
  }

  static importTheme(themeData) {
    if (!themeData.id || !themeData.variables) {
      console.warn('导入主题失败: 无效的主题数据');
      throw new Error('无效的主题数据');
    }
    
    const themeId = themeData.id.startsWith('custom-') ? themeData.id : `custom-${themeData.id}`;
    
    const theme = {
      id: themeId,
      name: themeData.name || '导入的主题',
      icon: themeData.icon || '📥',
      description: themeData.description || '从外部导入的主题',
      type: 'custom',
      variables: themeData.variables,
      imported: new Date().toISOString()
    };
    
    this._customThemes.set(themeId, theme);
    this._themes.set(themeId, theme);
    this._saveCustomThemes();
    
    console.log(`✅ 导入主题: ${themeId}`);
    return themeId;
  }

  // 刷新系统主题（当HA主题变化时调用）
  static refreshSystemThemes() {
    console.log('🔄 刷新系统主题...');
    
    // 清除现有系统主题
    this._systemThemes.forEach((theme, id) => {
      this._themes.delete(id);
    });
    this._systemThemes.clear();
    
    // 重新加载系统主题
    this._loadSystemThemes();
    
    console.log(`✅ 刷新完成，当前主题总数: ${this._themes.size}`);
  }

  // 获取主题预览颜色
  static getThemePreview(themeId) {
    const theme = this.getTheme(themeId);
    if (!theme) return null;
    
    return {
      backgroundColor: theme.variables['--cardforge-bg-color'],
      textColor: theme.variables['--cardforge-text-color'],
      primaryColor: theme.variables['--cardforge-primary-color']
    };
  }

  // 验证主题配置
  static validateTheme(themeData) {
    const requiredVars = [
      '--cardforge-bg-color',
      '--cardforge-text-color', 
      '--cardforge-primary-color'
    ];
    
    const missingVars = requiredVars.filter(varName => !themeData.variables?.[varName]);
    
    if (missingVars.length > 0) {
      return {
        valid: false,
        errors: [`缺少必要的变量: ${missingVars.join(', ')}`]
      };
    }
    
    return { valid: true };
  }
}

// 初始化
ThemeManager.init();

export { ThemeManager };