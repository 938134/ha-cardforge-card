// src/editors/dashboard/dashboard-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

export class DashboardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object }
  };

  static styles = [
    designSystem,
    css`
      .dashboard-editor {
        width: 100%;
        text-align: center;
        padding: var(--cf-spacing-xl);
      }

      .placeholder-icon {
        font-size: 3em;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-md);
      }

      .placeholder-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-sm);
      }

      .placeholder-description {
        color: var(--cf-text-secondary);
        line-height: 1.5;
      }
    `
  ];

  render() {
    return html`
      <div class="dashboard-editor">
        <div class="placeholder-icon">📊</div>
        <div class="placeholder-title">仪表盘编辑器</div>
        <div class="placeholder-description">
          仪表盘自由布局功能正在开发中...
          <br>
          即将支持网格布局和内容块管理
        </div>
      </div>
    `;
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}