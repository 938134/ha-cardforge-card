// src/editors/config-editors.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

// === 统一配置编辑器（合并基础和高级）===
export class UnifiedConfigEditor extends LitElement {
  static properties = {
    config: { type: Object },
    pluginManifest: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .config-editor {
        width: 100%;
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        width: 100%;
      }

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .config-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
      }

      .switch-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        transition: all var(--cf-transition-fast);
        min-height: 52px;
      }

      .switch-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .number-input {
        width: 100%;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .section-divider {
        height: 1px;
        background: var(--cf-border);
        margin: var(--cf-spacing-lg) 0;
        position: relative;
      }

      .section-divider::before {
        content: '高级设置';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--cf-background);
        padding: 0 var(--cf-spacing-md);
        color: var(--cf-text-secondary);
        font-size: 0.8em;
      }

      @media (max-width: 1024px) {
        .config-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .switch-group {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  constructor() {
    super();
    this._unifiedSchema = this._getUnifiedSchema();
  }

  _getUnifiedSchema() {
    return {
      // 基础设置
      'font_size': {
        type: 'select',
        label: '字体大小',
        options: ['较小', '正常', '较大', '超大'],
        default: '正常',
        category: 'basic'
      },
      'text_alignment': {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中',
        category: 'basic'
      },
      'spacing': {
        type: 'select',
        label: '内容间距',
        options: ['紧凑', '正常', '宽松', '超宽'],
        default: '正常',
        category: 'basic'
      },
      
      // 外观设置
      'border_style': {
        type: 'select',
        label: '边框样式',
        options: ['无', '细线', '粗线', '虚线', '阴影', '发光'],
        default: '无',
        category: 'appearance'
      },
      'border_radius': {
        type: 'select',
        label: '圆角大小',
        options: ['无圆角', '小圆角', '中圆角', '大圆角', '圆形'],
        default: '中圆角',
        category: 'appearance'
      },
      'color_theme': {
        type: 'select',
        label: '颜色主题',
        options: ['跟随系统', '浅色', '深色', '主色', '强调色', '渐变'],
        default: '跟随系统',
        category: 'appearance'
      },
      
      // 动画效果
      'animation_style': {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放', '弹跳', '打字机', '逐字显示'],
        default: '淡入',
        category: 'animation'
      },
      'animation_duration': {
        type: 'select',
        label: '动画时长',
        options: ['快速', '正常', '慢速'],
        default: '正常',
        category: 'animation'
      }
    };
  }

  _getFilteredSchema() {
    const supportedFeatures = this.pluginManifest?.supported_features || {};
    const pluginSchema = this.pluginManifest?.config_schema || {};
    const fullSchema = this._unifiedSchema;
    
    const filteredSchema = {};
    
    // 功能映射：配置项 -> 支持的功能
    const featureMap = {
      'font_size': 'fonts',
      'text_alignment': 'alignment', 
      'spacing': 'spacing',
      'border_style': 'borders',
      'border_radius': 'borders',
      'color_theme': 'colors',
      'animation_style': 'animations',
      'animation_duration': 'animations'
    };
    
    // 过滤统一配置项
    Object.entries(fullSchema).forEach(([key, field]) => {
      const feature = featureMap[key];
      if (!feature || supportedFeatures[feature] !== false) {
        filteredSchema[key] = field;
      }
    });
    
    // 添加插件特定配置项
    Object.entries(pluginSchema).forEach(([key, field]) => {
      filteredSchema[key] = {
        ...field,
        category: 'plugin'
      };
    });
    
    return filteredSchema;
  }

  _groupFieldsByCategory(fields) {
    const groups = {
      basic: [],
      appearance: [],
      animation: [],
      plugin: []
    };
    
    Object.entries(fields).forEach(([key, field]) => {
      const category = field.category || 'basic';
      if (groups[category]) {
        groups[category].push([key, field]);
      }
    });
    
    return groups;
  }

  render() {
    const filteredSchema = this._getFilteredSchema();
    
    if (Object.keys(filteredSchema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="empty-state">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    const fieldGroups = this._groupFieldsByCategory(filteredSchema);
    const hasPluginFields = fieldGroups.plugin.length > 0;
    const hasAppearanceFields = fieldGroups.appearance.length > 0 || fieldGroups.animation.length > 0;

    return html`
      <div class="config-editor">
        <!-- 基础设置 -->
        ${fieldGroups.basic.length > 0 ? html`
          <div class="config-grid">
            ${fieldGroups.basic.map(([key, field]) => this._renderField(key, field))}
          </div>
        ` : ''}
        
        <!-- 外观和动画设置 -->
        ${hasAppearanceFields ? html`
          <div class="section-divider"></div>
          <div class="config-grid">
            ${fieldGroups.appearance.map(([key, field]) => this._renderField(key, field))}
            ${fieldGroups.animation.map(([key, field]) => this._renderField(key, field))}
          </div>
        ` : ''}
        
        <!-- 插件特定设置 -->
        ${hasPluginFields ? html`
          <div class="section-divider"></div>
          <div class="config-grid">
            ${fieldGroups.plugin.map(([key, field]) => this._renderField(key, field))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'boolean':
        return html`
          <div class="switch-item">
            <span class="switch-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </span>
            <ha-switch
              .checked=${!!currentValue}
              @change=${e => this._onConfigChanged(key, e.target.checked)}
            ></ha-switch>
          </div>
        `;

      case 'select':
        const items = field.options.map(option => ({
          value: option,
          label: option
        }));
        
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-combo-box
              .items=${items}
              .value=${currentValue}
              @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
        `;
        
      case 'number':
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              class="number-input"
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              type="number"
              min=${field.min}
              max=${field.max}
              outlined
            ></ha-textfield>
          </div>
        `;
        
      default:
        return html`
          <div class="config-field">
            <label class="config-label">
              ${field.label}
              ${field.required ? html`<span class="required-star">*</span>` : ''}
            </label>
            <ha-textfield
              .value=${currentValue}
              @input=${e => this._onConfigChanged(key, e.target.value)}
              outlined
            ></ha-textfield>
          </div>
        `;
    }
  }

  _onConfigChanged(key, value) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: {
          [key]: value
        }
      }
    }));
  }
}

// 注册自定义元素
if (!customElements.get('unified-config-editor')) {
  customElements.define('unified-config-editor', UnifiedConfigEditor);
}
