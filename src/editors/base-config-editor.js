// src/editors/base-config-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class BaseConfigEditor extends LitElement {
  static properties = {
    config: { type: Object }
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
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      /* 响应式优化 */
      @media (max-width: 1024px) {
        .config-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
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
    return html`
      <div class="config-editor">
        <div class="config-grid">
          ${Object.entries(this._unifiedSchema).map(([key, field]) => 
            this._renderField(key, field)
          )}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    const currentValue = this.config[key] !== undefined ? this.config[key] : field.default;

    switch (field.type) {
      case 'select':
        const items = field.options.map(option => ({
          value: option,
          label: option
        }));
        
        return html`
          <div class="config-field">
            <label class="config-label">${field.label}</label>
            <ha-combo-box
              .items=${items}
              .value=${currentValue}
              @value-changed=${e => this._onConfigChanged(key, e.detail.value)}
              allow-custom-value
            ></ha-combo-box>
          </div>
        `;
        
      default:
        return html`
          <div class="config-field">
            <label class="config-label">${field.label}</label>
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

if (!customElements.get('base-config-editor')) {
  customElements.define('base-config-editor', BaseConfigEditor);
}