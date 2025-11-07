import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class StandardCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    .cardforge-card {
      padding: 16px;
      background: var(--cardforge-bg-color, var(--card-background-color));
      border-radius: var(--cardforge-border-radius, 12px);
      color: var(--cardforge-text-color, var(--primary-text-color));
      box-shadow: var(--cardforge-shadow, var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1)));
    }
    .cardforge-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-weight: 500;
      color: var(--cardforge-primary-color, var(--primary-color));
    }
    .cardforge-content {
      min-height: 60px;
    }
    .cardforge-entity {
      display: flex;
      justify-content: space-between;
      padding: 12px 8px;
      border-bottom: 1px solid var(--divider-color);
      align-items: center;
    }
    .cardforge-empty {
      text-align: center;
      color: var(--disabled-text-color);
      padding: 40px 20px;
    }
    .cardforge-footer {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
      font-size: 0.8em;
      color: var(--secondary-text-color);
      display: flex;
      justify-content: space-between;
    }
  `;

  setConfig(config) {
    this.config = config;
    
    // 应用主题
    if (this.config.theme && window.ThemeManager) {
      window.ThemeManager.applyTheme(this, this.config.theme);
    }
  }

  render() {
    if (!this.config) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    const { header, content, footer } = this.config.layout;
    
    return html`
      <ha-card>
        <div class="cardforge-themed cardforge-card">
          ${header.visible ? this._renderHeader(header) : ''}
          <div class="cardforge-content">
            ${this._renderContent(content)}
          </div>
          ${footer.visible ? this._renderFooter(footer, content.entities.length) : ''}
        </div>
      </ha-card>
    `;
  }

  _renderHeader(header) {
    return html`
      <div class="cardforge-header">
        ${header.icon ? html`<ha-icon .icon=${header.icon}></ha-icon>` : ''}
        <span>${header.title}</span>
      </div>
    `;
  }

  _renderContent(content) {
    if (!content.entities || content.entities.length === 0) {
      return html`<div class="cardforge-empty">暂无实体，点击编辑按钮添加</div>`;
    }

    return html`
      ${content.entities.map(entityId => html`
        <div class="cardforge-entity">
          <span>${this._getEntityName(entityId)}</span>
          <span>${this._getEntityState(entityId)}</span>
        </div>
      `)}
    `;
  }

  _renderFooter(footer, entityCount) {
    return html`
      <div class="cardforge-footer">
        ${footer.show_timestamp ? html`<span>${new Date().toLocaleTimeString()}</span>` : ''}
        ${footer.show_entity_count ? html`<span>实体: ${entityCount}</span>` : ''}
      </div>
    `;
  }

  _getEntityName(entityId) {
    const entity = this.hass?.states[entityId];
    return entity?.attributes.friendly_name || entityId;
  }

  _getEntityState(entityId) {
    const entity = this.hass?.states[entityId];
    return entity?.state || '未知';
  }

  getCardSize() {
    const entityCount = this.config?.layout?.content?.entities?.length || 0;
    return Math.max(2, entityCount + 2);
  }
}

customElements.define('standard-card', StandardCard);