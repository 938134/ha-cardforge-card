// src/editors/layout-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import { layoutEngine } from '../core/layout-engine.js';

export class LayoutEditor extends LitElement {
  static properties = {
    layoutConfig: { type: Object },
    _availableLayouts: { state: true },
    _selectedLayout: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .layout-editor {
        width: 100%;
      }

      .layout-selector {
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--cf-spacing-md);
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
      }

      .layout-option:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
      }

      .layout-option.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .layout-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .layout-name {
        font-size: 0.9em;
        font-weight: 500;
        text-align: center;
      }

      .layout-config {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-top: var(--cf-spacing-lg);
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--cf-spacing-md);
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
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._availableLayouts = [];
    this._selectedLayout = 'grid';
  }

  firstUpdated() {
    this._availableLayouts = layoutEngine.getAllLayouts();
    this._selectedLayout = this.layoutConfig?.style || 'grid';
  }

  render() {
    return html`
      <div class="layout-editor">
        ${this._renderLayoutSelector()}
        ${this._renderLayoutConfig()}
      </div>
    `;
  }

  _renderLayoutSelector() {
    return html`
      <div class="layout-selector">
        <div class="cf-text-md cf-font-medium cf-mb-md">选择布局方式</div>
        <div class="layout-options">
          ${this._availableLayouts.map(layout => html`
            <div 
              class="layout-option ${this._selectedLayout === layout.name ? 'selected' : ''}"
              @click=${() => this._selectLayout(layout.name)}
            >
              <ha-icon class="layout-icon" .icon=${layout.icon}></ha-icon>
              <div class="layout-name">${layout.label}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderLayoutConfig() {
    if (!this._selectedLayout) return '';

    const layoutConfigs = {
      grid: this._renderGridConfig(),
      flex: this._renderFlexConfig(),
      'header-content-footer': this._renderHCFConfig(),
      free: this._renderFreeConfig()
    };

    return html`
      <div class="layout-config">
        <div class="cf-text-md cf-font-medium cf-mb-md">布局设置</div>
        ${layoutConfigs[this._selectedLayout] || this._renderDefaultConfig()}
      </div>
    `;
  }

  _renderGridConfig() {
    const columns = this.layoutConfig?.columns || 3;
    const gap = this.layoutConfig?.gap || 'normal';

    return html`
      <div class="config-grid">
        <div class="config-field">
          <label class="config-label">列数</label>
          <ha-textfield
            .value=${columns}
            @input=${e => this._onLayoutConfigChanged('columns', parseInt(e.target.value) || 3)}
            type="number"
            min="1"
            max="6"
            outlined
          ></ha-textfield>
        </div>
        <div class="config-field">
          <label class="config-label">间距</label>
          <ha-combo-box
            .items=${[
              { value: 'compact', label: '紧凑' },
              { value: 'normal', label: '正常' },
              { value: 'loose', label: '宽松' }
            ]}
            .value=${gap}
            @value-changed=${e => this._onLayoutConfigChanged('gap', e.detail.value)}
          ></ha-combo-box>
        </div>
      </div>
    `;
  }

  _renderFlexConfig() {
    const direction = this.layoutConfig?.direction || 'row';
    const justify = this.layoutConfig?.justify || 'center';

    return html`
      <div class="config-grid">
        <div class="config-field">
          <label class="config-label">方向</label>
          <ha-combo-box
            .items=${[
              { value: 'row', label: '水平' },
              { value: 'column', label: '垂直' }
            ]}
            .value=${direction}
            @value-changed=${e => this._onLayoutConfigChanged('direction', e.detail.value)}
          ></ha-combo-box>
        </div>
        <div class="config-field">
          <label class="config-label">对齐方式</label>
          <ha-combo-box
            .items=${[
              { value: 'flex-start', label: '左对齐' },
              { value: 'center', label: '居中' },
              { value: 'flex-end', label: '右对齐' },
              { value: 'space-between', label: '两端对齐' }
            ]}
            .value=${justify}
            @value-changed=${e => this._onLayoutConfigChanged('justify', e.detail.value)}
          ></ha-combo-box>
        </div>
      </div>
    `;
  }

  _renderHCFConfig() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:check-circle"></ha-icon>
        <p class="empty-text">页眉-内容-页脚布局无需额外配置</p>
      </div>
    `;
  }

  _renderFreeConfig() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:arrow-all"></ha-icon>
        <p class="empty-text">自由布局请在预览中直接拖拽调整</p>
      </div>
    `;
  }

  _renderDefaultConfig() {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:help-circle"></ha-icon>
        <p class="empty-text">此布局暂无配置选项</p>
      </div>
    `;
  }

  _selectLayout(layoutName) {
    this._selectedLayout = layoutName;
    this._onLayoutConfigChanged('style', layoutName);
  }

  _onLayoutConfigChanged(key, value) {
    const layout = {
      ...this.layoutConfig,
      [key]: value
    };
    
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: { layout }
    }));
  }
}

if (!customElements.get('layout-editor')) {
  customElements.define('layout-editor', LayoutEditor);
}