// src/editors/config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class ConfigEditor extends LitElement {
  static properties = {
    schema: { type: Object },
    config: { type: Object },
    _unifiedSchema: { state: true }
  };

  static styles = [
    foundationStyles,
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
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
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

      /* 配置分类样式 */
      .config-category {
        margin-bottom: var(--cf-spacing-lg);
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .category-icon {
        font-size: 1.2em;
        opacity: 0.8;
      }

      .category-title {
        font-weight: 600;
        font-size: 1em;
        color: var(--cf-text-primary);
      }

      .category-description {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-left: auto;
      }

      /* ha-combo-box 样式修复 */
      ha-combo-box {
        width: 100%;
        --paper-input-container-color: var(--cf-text-secondary);
        --paper-input-container-focus-color: var(--cf-primary-color);
        --paper-input-container-input-color: var(--cf-text-primary);
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .switch-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        ha-combo-box {
          --paper-input-container-color: var(--cf-dark-text-secondary);
          --paper-input-container-focus-color: var(--cf-primary-color);
          --paper-input-container-input-color: var(--cf-dark-text);
        }
      }

      /* 响应式优化 */
      @media (max-width: 1024px) {
        .config-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .switch-group {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .config-grid {
          gap: var(--cf-spacing-sm);
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
      'font_size': {
        type: 'select',
        label: '字体大小',
        options: ['较小', '正常', '较大', '超大'],
        default: '正常'
      },
      'text_alignment': {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      'spacing': {
        type: 'select',
        label: '内容间距',
        options: ['紧凑', '正常', '宽松', '超宽'],
        default: '正常'
      },
      'border_style': {
        type: 'select',
        label: '边框样式',
        options: ['无', '细线', '粗线', '虚线', '阴影', '发光'],
        default: '无'
      },
      'border_radius': {
        type: 'select',
        label: '圆角大小',
        options: ['无圆角', '小圆角', '中圆角', '大圆角', '圆形'],
        default: '中圆角'
      },
      'color_theme': {
        type: 'select',
        label: '颜色主题',
        options: ['跟随系统', '浅色', '深色', '主色', '强调色', '渐变'],
        default: '跟随系统'
      },
      'animation_style': {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放', '弹跳', '打字机', '逐字显示'],
        default: '淡入'
      },
      'animation_duration': {
        type: 'select',
        label: '动画时长',
        options: ['快速', '正常', '慢速'],
        default: '正常'
      }
    };
  }

  render() {
    // 如果没有特定schema，只显示统一配置
    const effectiveSchema = Object.keys(this.schema || {}).length > 0 ? this.schema : this._unifiedSchema;
    
    if (Object.keys(effectiveSchema).length === 0) {
      return html`
        <div class="config-editor">
          <div class="cf-text-sm cf-text-secondary cf-text-center cf-p-md">
            此卡片无需额外配置
          </div>
        </div>
      `;
    }

    // 合并统一配置和卡片特定配置
    const mergedSchema = this._mergeSchemas(effectiveSchema);
    
    return html`
      <div class="config-editor">
        ${this._renderCategorizedFields(mergedSchema)}
      </div>
    `;
  }

  _mergeSchemas(schema = this.schema) {
    const merged = {};
    
    // 1. 先添加基础设置分类（统一配置）
    const baseFields = {};
    Object.entries(this._unifiedSchema).forEach(([key, field]) => {
      baseFields[key] = field;
    });
    
    if (Object.keys(baseFields).length > 0) {
      merged['基础设置'] = baseFields;
    }
    
    // 2. 再添加卡片特定配置到"高级设置"分类
    const cardSpecificFields = {};
    Object.entries(schema).forEach(([key, field]) => {
      if (!this._isUnifiedField(key)) {
        cardSpecificFields[key] = field;
      }
    });
    
    if (Object.keys(cardSpecificFields).length > 0) {
      merged['高级设置'] = cardSpecificFields;
    }
    
    return merged;
  }

  _isUnifiedField(key) {
    return Object.keys(this._unifiedSchema).includes(key);
  }

  _renderCategorizedFields(categorizedSchema) {
    return Object.entries(categorizedSchema).map(([category, fields]) => {
      if (Object.keys(fields).length === 0) return '';
      
      const booleanFields = Object.entries(fields).filter(([_, field]) => field.type === 'boolean');
      const otherFields = Object.entries(fields).filter(([_, field]) => field.type !== 'boolean');

      return html`
        <div class="config-category">
          <div class="category-header">
            <span class="category-icon">${this._getCategoryIcon(category)}</span>
            <span class="category-title">${category}</span>
            <span class="category-description">${this._getCategoryDescription(category)}</span>
          </div>
          
          <!-- 布尔类型配置 -->
          ${booleanFields.length > 0 ? html`
            <div class="switch-group">
              ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
            </div>
          ` : ''}
          
          <!-- 其他类型配置 -->
          ${otherFields.length > 0 ? html`
            <div class="config-grid">
              ${otherFields.map(([key, field]) => this._renderOtherField(key, field))}
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  _getCategoryIcon(category) {
    const icons = {
      '基础设置': '⚙️',
      '高级设置': '🔧'
    };
    return icons[category] || '📁';
  }

  _getCategoryDescription(category) {
    const descriptions = {
      '基础设置': '调整基本外观和动画设置',
      '高级设置': '配置卡片特定功能'
    };
    return descriptions[category] || '';
  }

  _renderBooleanField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;
    
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
  }

  _renderOtherField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
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

if (!customElements.get('config-editor')) {
  customElements.define('config-editor', ConfigEditor);
}