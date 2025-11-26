// src/editors/card-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { DEFAULT_CONFIG } from '../core/config-schema.js';
import './layout-editor.js';
import './theme-editor.js';
import './content-editor.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _activeSection: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .editor-section {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
      }

      .section-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }
    `
  ];

  constructor() {
    super();
    this.config = { ...DEFAULT_CONFIG };
    this._activeSection = 'main';
  }

  setConfig(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  render() {
    return html`
      <div class="editor-container">
        <!-- 布局编辑 -->
        <div class="editor-section">
          <div class="section-title">🏗️ 布局结构</div>
          <layout-editor
            .config=${this.config}
            @config-changed=${this._onConfigChanged}
          ></layout-editor>
        </div>

        <!-- 主题编辑 -->
        <div class="editor-section">
          <div class="section-title">🎨 主题风格</div>
          <theme-editor
            .config=${this.config}
            @config-changed=${this._onConfigChanged}
          ></theme-editor>
        </div>

        <!-- 内容编辑 -->
        <div class="editor-section">
          <div class="section-title">📦 块内容管理</div>
          <content-editor
            .config=${this.config}
            .hass=${this.hass}
            .activeSection=${this._activeSection}
            @config-changed=${this._onConfigChanged}
            @section-changed=${this._onSectionChanged}
          ></content-editor>
        </div>
      </div>
    `;
  }

  _onConfigChanged(e) {
    this.config = e.detail.config;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _onSectionChanged(e) {
    this._activeSection = e.detail.sectionId;
  }
}

if (!customElements.get('card-forge-editor')) {
  customElements.define('card-forge-editor', CardEditor);
}

export { CardEditor };
