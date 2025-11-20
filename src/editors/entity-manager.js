// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { LayoutStrategy } from '../core/layout-strategy.js';
import './layout-editors.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentMode: { state: true },
    _strategyInfo: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .entity-manager {
        width: 100%;
      }

      .strategy-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .strategy-icon {
        color: var(--cf-primary-color);
      }

      .strategy-info {
        flex: 1;
      }

      .strategy-title {
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }

      .strategy-description {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._currentMode = 'entity_driven';
    this._strategyInfo = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._updateStrategyInfo();
    }
  }

  _updateStrategyInfo() {
    this._strategyInfo = LayoutStrategy.getStrategyInfo(this.pluginManifest);
    this._currentMode = this._strategyInfo.mode;
  }

  render() {
    if (!this.pluginManifest) {
      return html`
        <div class="entity-manager">
          <div class="cf-flex cf-flex-center cf-p-lg">
            <div class="cf-text-sm cf-text-secondary">请先选择卡片插件</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="entity-manager">
        <div class="strategy-header">
          <ha-icon class="strategy-icon" .icon=${this._strategyInfo.icon}></ha-icon>
          <div class="strategy-info">
            <div class="strategy-title">${this._strategyInfo.name}</div>
            <div class="strategy-description">${this._strategyInfo.description}</div>
          </div>
        </div>

        <layout-editor-manager
          .hass=${this.hass}
          .config=${this.config}
          .pluginManifest=${this.pluginManifest}
          @entities-changed=${this._onEntitiesChanged}
        ></layout-editor-manager>
      </div>
    `;
  }

  _onEntitiesChanged(e) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: e.detail
    }));
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}