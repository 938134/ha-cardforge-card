// src/editors/layout-toolbar.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class LayoutToolbar extends LitElement {
  static properties = {
    layout: { type: String },
    gridConfig: { type: Object },
    _showGridSettings: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .layout-toolbar {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        flex-wrap: wrap;
      }

      .layout-options {
        display: flex;
        gap: var(--cf-spacing-sm);
        background: var(--cf-background);
        border-radius: var(--cf-radius-md);
        padding: 4px;
      }

      .layout-option {
        padding: 8px 12px;
        border: none;
        background: transparent;
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .layout-option:hover {
        background: rgba(var(--cf-rgb-primary), 0.1);
        color: var(--cf-primary-color);
      }

      .layout-option.active {
        background: var(--cf-primary-color);
        color: white;
      }

      .grid-settings {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin-top: var(--cf-spacing-md);
      }

      .setting-field {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .setting-label {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        white-space: nowrap;
      }

      .grid-visual {
        display: grid;
        gap: 2px;
        margin-left: var(--cf-spacing-sm);
      }

      .grid-cell {
        width: 8px;
        height: 8px;
        background: var(--cf-border);
        border-radius: 1px;
        transition: all var(--cf-transition-fast);
      }

      .grid-cell.active {
        background: var(--cf-primary-color);
      }

      .toggle-button {
        background: none;
        border: none;
        color: var(--cf-primary-color);
        cursor: pointer;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .theme-selector {
        min-width: 120px;
      }

      @media (max-width: 768px) {
        .layout-toolbar {
          gap: var(--cf-spacing-md);
        }
        
        .layout-options {
          order: 2;
          width: 100%;
          justify-content: center;
        }
        
        .theme-selector {
          order: 1;
        }
        
        .grid-settings {
          flex-direction: column;
          align-items: stretch;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this.layout = 'grid';
    this.gridConfig = { columns: 4, gap: '8px' };
    this._showGridSettings = false;
  }

  render() {
    return html`
      <div class="layout-toolbar">
        <div class="layout-options">
          ${this._renderLayoutOption('grid', 'mdi:view-grid', '网格')}
          ${this._renderLayoutOption('flex', 'mdi:view-stream', '弹性')}
          ${this._renderLayoutOption('absolute', 'mdi:arrow-all', '绝对')}
        </div>

        ${this.layout === 'grid' ? html`
          <button class="toggle-button" @click=${this._toggleGridSettings}>
            <ha-icon icon="mdi:cog"></ha-icon>
            网格设置
          </button>
        ` : ''}

        <div class="theme-selector">
          <ha-select
            .label="主题"
            .value=${'auto'}
            @closed=${e => e.stopPropagation()}
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="auto">跟随系统</ha-list-item>
            <ha-list-item value="glass">毛玻璃</ha-list-item>
            <ha-list-item value="gradient">渐变</ha-list-item>
            <ha-list-item value="neon">霓虹</ha-list-item>
            <ha-list-item value="ink-wash">水墨</ha-list-item>
          </ha-select>
        </div>

        ${this._showGridSettings && this.layout === 'grid' ? html`
          <div class="grid-settings">
            <div class="setting-field">
              <span class="setting-label">列数:</span>
              <ha-textfield
                .value=${this.gridConfig.columns}
                @input=${e => this._updateGridConfig('columns', parseInt(e.target.value) || 1)}
                type="number"
                min="1"
                max="12"
                style="width: 60px;"
              ></ha-textfield>
              <div class="grid-visual" style="grid-template-columns: repeat(${this.gridConfig.columns}, 1fr);">
                ${Array.from({ length: this.gridConfig.columns * 2 }, (_, i) => html`
                  <div class="grid-cell ${i < this.gridConfig.columns ? 'active' : ''}"></div>
                `)}
              </div>
            </div>

            <div class="setting-field">
              <span class="setting-label">间距:</span>
              <ha-textfield
                .value=${this.gridConfig.gap.replace('px', '')}
                @input=${e => this._updateGridConfig('gap', e.target.value + 'px')}
                type="number"
                min="0"
                max="20"
                style="width: 60px;"
              ></ha-textfield>
              <span class="setting-label">px</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderLayoutOption(layout, icon, label) {
    const isActive = this.layout === layout;
    
    return html`
      <button 
        class="layout-option ${isActive ? 'active' : ''}"
        @click=${() => this._changeLayout(layout)}
        title="${label}布局"
      >
        <ha-icon icon="${icon}"></ha-icon>
        ${label}
      </button>
    `;
  }

  _changeLayout(layout) {
    this.layout = layout;
    this._showGridSettings = layout === 'grid';
    
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: {
        layout,
        gridConfig: this.gridConfig
      }
    }));
  }

  _toggleGridSettings() {
    this._showGridSettings = !this._showGridSettings;
  }

  _updateGridConfig(key, value) {
    this.gridConfig = {
      ...this.gridConfig,
      [key]: value
    };
    
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: {
        layout: this.layout,
        gridConfig: this.gridConfig
      }
    }));
  }
}

if (!customElements.get('layout-toolbar')) {
  customElements.define('layout-toolbar', LayoutToolbar);
}

export { LayoutToolbar };