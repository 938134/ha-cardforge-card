// src/editors/layout-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class LayoutEditor extends LitElement {
  static properties = {
    config: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .layout-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
      }

      .layout-option:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
      }

      .layout-option.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .layout-preview {
        width: 80px;
        height: 60px;
        display: flex;
        margin-bottom: var(--cf-spacing-sm);
      }

      .vertical-preview {
        flex-direction: column;
      }

      .vertical-preview > div {
        flex: 1;
        background: var(--cf-primary-color);
        margin: 1px;
        border-radius: 2px;
      }

      .horizontal-preview {
        flex-direction: row;
      }

      .horizontal-preview > div {
        flex: 1;
        background: var(--cf-primary-color);
        margin: 1px;
        border-radius: 2px;
      }

      .grid-preview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
      }

      .grid-preview > div {
        background: var(--cf-primary-color);
        border-radius: 2px;
      }

      .layout-name {
        font-size: 0.85em;
        font-weight: 500;
      }
    `
  ];

  render() {
    const layouts = [
      { type: 'vertical', name: '垂直布局', preview: 'vertical' },
      { type: 'horizontal', name: '水平布局', preview: 'horizontal' },
      { type: 'grid', name: '网格布局', preview: 'grid' },
      { type: 'card-grid', name: '卡片网格', preview: 'grid' }
    ];

    const currentLayout = this.config?.layout?.type || 'vertical';

    return html`
      <div class="layout-options">
        ${layouts.map(layout => html`
          <div 
            class="layout-option ${currentLayout === layout.type ? 'selected' : ''}"
            @click=${() => this._selectLayout(layout.type)}
          >
            <div class="layout-preview ${layout.preview}-preview">
              ${this._renderLayoutPreview(layout.preview)}
            </div>
            <div class="layout-name">${layout.name}</div>
          </div>
        `)}
      </div>

      <div class="cf-text-sm cf-text-secondary">
        当前布局: ${layouts.find(l => l.type === currentLayout)?.name || '垂直布局'}
      </div>
    `;
  }

  _renderLayoutPreview(type) {
    switch (type) {
      case 'vertical':
        return html`<div></div><div></div><div></div>`;
      case 'horizontal':
        return html`<div></div><div></div><div></div>`;
      case 'grid':
        return html`<div></div><div></div><div></div><div></div>`;
      default:
        return html`<div></div><div></div>`;
    }
  }

  _selectLayout(layoutType) {
    const newConfig = {
      ...this.config,
      layout: {
        type: layoutType,
        sections: ['main']
      },
      sections: {
        main: { blocks: [] }
      }
    };

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }
}

if (!customElements.get('layout-editor')) {
  customElements.define('layout-editor', LayoutEditor);
}

export { LayoutEditor };
