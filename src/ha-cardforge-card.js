// ha-cardforge-card/src/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginManager, FallbackPlugin } from './components/plugins.js';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true },
    _plugin: { state: true },
    _error: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._pluginManager = new PluginManager();
    this._plugin = null;
    this._error = null;
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    this._error = null;
    
    try {
      this._plugin = await this._pluginManager.loadPlugin(this._config.plugin);
      
      const validation = this._validateEntities();
      if (!validation.valid) {
        this._error = validation.errors.join(', ');
      }
      
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
      
    } catch (error) {
      this._error = `插件加载失败: ${error.message}`;
      console.error('卡片配置错误:', error);
      
      this._plugin = new FallbackPlugin(this._config.plugin, error.message);
      const buttonConfig = this._convertToButtonCard(this._config, this._plugin);
      super.setConfig(buttonConfig);
    }
  }

  _validateConfig(config) {
    return {
      plugin: '',
      theme: 'default',
      entities: {},
      custom: {},
      ...config
    };
  }

  _updateEntities() {
    this._entities.clear();
    if (!this.hass || !this._config.entities) return;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities.set(key, this.hass.states[entityId]);
      }
    });
  }

  _validateEntities() {
    const requirements = this._plugin?.getEntityRequirements?.() || { required: [] };
    const errors = [];
    
    requirements.required.forEach(req => {
      if (!this._config.entities?.[req.key]) {
        errors.push(`缺少必需实体: ${req.description}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }

  _convertToButtonCard(config, plugin) {
    const entities = Object.fromEntries(this._entities);
    
    // 预览模式使用模拟数据
    if (config._preview) {
      entities.time = entities.time || { state: '12:34', attributes: {} };
      entities.date = entities.date || { state: '2024-01-01', attributes: {} };
      entities.week = entities.week || { state: '星期一', attributes: {} };
      entities.weather = entities.weather || { 
        state: '晴朗', 
        attributes: { temperature: 25, humidity: 65 } 
      };
      entities.lunar = entities.lunar || { 
        state: '冬月廿三', 
        attributes: { lunar: { 年干支: '甲辰', 星期: '星期一' } } 
      };
    }

    // 获取插件生成的 HTML 和 CSS
    const template = plugin.getTemplate(config, entities);
    const styles = plugin.getStyles(config) + this._getThemeStyles(config.theme);
    
    // 创建 button-card 兼容的配置
    const buttonConfig = {
      type: 'custom:button-card',
      template: [
        {
          type: 'custom:template',
          entity: Object.keys(entities)[0] || 'sensor.time', // 需要一个实体引用
          content: template
        }
      ],
      styles: {
        // 将 CSS 转换为 button-card 的样式格式
        card: [
          {
            // 基础样式
            'border-radius': 'var(--ha-card-border-radius, 12px)',
            'box-shadow': 'var(--ha-card-box-shadow, none)',
            'overflow': 'hidden'
          }
        ],
        ...this._convertStylesToButtonCardFormat(styles)
      },
      ...this._applyTheme(config),
      // 添加自定义属性以便在模板中使用
      custom_fields: {
        cardforge_template: template,
        cardforge_styles: styles
      }
    };

    return buttonConfig;
  }

  _convertStylesToButtonCardFormat(css) {
    // 简单的 CSS 解析，将 CSS 转换为 button-card 样式格式
    const styles = {};
    const rules = css.split('}');
    
    rules.forEach(rule => {
      const parts = rule.split('{');
      if (parts.length === 2) {
        const selector = parts[0].trim();
        const properties = parts[1].trim();
        
        if (selector === '.cardforge-card' || selector.includes('cardforge-card')) {
          styles.card = this._parseCSSProperties(properties);
        } else if (selector.includes('.time-week') || selector.includes('.time-card') || 
                   selector.includes('.weather') || selector.includes('.clock-lunar') || 
                   selector.includes('.welcome')) {
          // 插件特定样式
          if (!styles.custom) styles.custom = {};
          styles.custom[selector.replace('.', '')] = this._parseCSSProperties(properties);
        }
      }
    });
    
    return styles;
  }

  _parseCSSProperties(cssProperties) {
    const properties = {};
    const declarations = cssProperties.split(';');
    
    declarations.forEach(decl => {
      const parts = decl.split(':');
      if (parts.length === 2) {
        const property = parts[0].trim();
        const value = parts[1].trim();
        properties[property] = value;
      }
    });
    
    return properties;
  }

  _getThemeStyles(theme) {
    const themes = {
      'default': `
        .cardforge-card { 
          background: var(--card-background-color); 
          color: var(--primary-text-color);
          border-radius: var(--ha-card-border-radius, 12px);
        }
      `,
      'dark': `
        .cardforge-card { 
          background: #1e1e1e; 
          color: white;
          border-radius: 12px;
        }
      `,
      'material': `
        .cardforge-card { 
          background: #fafafa; 
          color: #212121;
          border-radius: 8px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }
      `,
      'glass': `
        .cardforge-card { 
          background: rgba(255, 255, 255, 0.1); 
          color: white;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }
      `
    };
    return themes[theme] || themes.default;
  }

  _applyTheme(config) {
    const themeConfigs = {
      'dark': { 
        style: {
          'background': '#1e1e1e',
          'color': 'white'
        }
      },
      'material': { 
        style: {
          'background': '#fafafa',
          'color': '#212121'
        }
      },
      'glass': {
        style: {
          'background': 'rgba(255, 255, 255, 0.1)',
          'color': 'white',
          'backdrop-filter': 'blur(10px)'
        }
      }
    };
    return themeConfigs[config.theme] || {};
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      if (this._config) {
        this.setConfig(this._config);
      }
    }
  }

  // 重写 render 方法以处理错误显示
  render() {
    if (this._error) {
      // 创建简单的错误显示，不依赖 button-card 模板
      const errorElement = document.createElement('div');
      errorElement.className = 'cardforge-error';
      errorElement.innerHTML = `
        <style>
          .cardforge-error {
            padding: 16px;
            background: var(--error-color, #db4437);
            color: white;
            border-radius: 8px;
            text-align: center;
            margin: 8px;
          }
          .cardforge-error ha-icon {
            --mdc-icon-size: 24px;
            margin-right: 8px;
          }
        </style>
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <span>${this._error}</span>
      `;
      return errorElement;
    }
    
    return super.render();
  }

  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'time-week',
      theme: 'default',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date'
      }
    };
  }
}

export { HaCardForgeCard };