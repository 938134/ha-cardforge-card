// src/editors/dashboard/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    block: { type: Object },
    onSave: { type: Object },
    onCancel: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .inline-editor {
        background: var(--cf-surface);
        border: 1px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-sm);
      }

      .editor-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
      }

      .placeholder-text {
        color: var(--cf-text-secondary);
        text-align: center;
        padding: var(--cf-spacing-lg);
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.onSave = () => {};
    this.onCancel = () => {};
  }

  render() {
    return html`
      <div class="inline-editor">
        <div class="editor-title">编辑内容块</div>
        <div class="placeholder-text">
          内联编辑器功能正在开发中...
          <br>
          即将支持块属性的快速编辑
        </div>
      </div>
    `;
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}

export { InlineBlockEditor };