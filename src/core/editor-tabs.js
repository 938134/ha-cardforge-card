// src/core/editor-tabs.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EditorTabs {
  static renderTabs(activeTab, onTabChange, hasPlugin = false) {
    return html`
      <div class="tabs-container">
        ${this._renderTabButton(0, 'mdi:view-grid-outline', '插件市场', activeTab, onTabChange)}
        ${this._renderTabButton(1, 'mdi:cog-outline', '实体配置', activeTab, onTabChange, !hasPlugin)}
        ${this._renderTabButton(2, 'mdi:palette-outline', '主题设置', activeTab, onTabChange)}
      </div>
    `;
  }

  static _renderTabButton(tabIndex, icon, label, activeTab, onTabChange, disabled = false) {
    const isActive = activeTab === tabIndex;
    return html`
      <button
        class="tab-button ${isActive ? 'active' : ''}"
        @click=${() => !disabled && onTabChange(tabIndex)}
        ?disabled=${disabled}
      >
        <ha-icon icon="${icon}"></ha-icon>
        <span>${label}</span>
      </button>
    `;
  }
}
