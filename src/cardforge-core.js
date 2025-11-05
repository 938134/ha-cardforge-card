export class HACardForge extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._entities = {};
    this._hass = null;
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = this._validateConfig(config);
    this._render();
    
    // 应用主题
    if (window.ThemeManager) {
      window.ThemeManager.applyTheme(this, this._config.theme || 'default');
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._updateEntityStates();
    
    // 更新时间戳
    if (this._config.layout.footer.show_timestamp) {
      const timestampElement = this._shadow.querySelector('.timestamp');
      if (timestampElement) {
        timestampElement.textContent = new Date().toLocaleTimeString();
      }
    }
  }

  _validateConfig(config) {
    const defaultConfig = {
      layout: {
        header: { 
          title: '', 
          icon: '', 
          visible: true,
          show_edit_button: true
        },
        content: { 
          plugin: 'simple-entities',
          entities: [],
          config: {}
        },
        footer: { 
          visible: true, 
          show_timestamp: false,
          show_entity_count: true
        }
      },
      styles: {},
      theme: 'default',
      marketplace: {
        enabled: true
      }
    };
    return this._deepMerge(defaultConfig, config);
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  _render() {
    this._shadow.innerHTML = this._generateHTML();
    this._attachEventListeners();
    this._updateEntityStates();
  }

  _generateHTML() {
    const { header, content, footer } = this._config.layout;
    
    return `
      <style>${this._generateStyles()}</style>
      <div class="ha-cardforge-container">
        ${header.visible ? this._renderHeader() : ''}
        <div class="ha-cardforge-content" id="content-area">
          ${this._renderContent()}
        </div>
        ${footer.visible ? this._renderFooter() : ''}
      </div>
    `;
  }

  _renderHeader() {
    const { title, icon, show_edit_button, show_marketplace_button } = this._config.layout.header;
    return `
      <div class="ha-cardforge-header">
        ${icon ? `<ha-icon class="header-icon" icon="${icon}"></ha-icon>` : ''}
        <span class="header-title">${title}</span>
        <div class="header-actions">
          ${show_marketplace_button !== false ? `
            <ha-icon class="marketplace-btn" icon="mdi:store" title="插件市场"></ha-icon>
          ` : ''}
          ${show_edit_button ? `
            <ha-icon class="edit-btn" icon="mdi:cog" title="编辑卡片"></ha-icon>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderContent() {
    const { plugin, entities, config } = this._config.layout.content;
    
    if (!entities || entities.length === 0) {
      return `
        <div class="content-empty">
          <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
          <p>点击配置内容区域</p>
          <button class="setup-btn">开始设置</button>
        </div>
      `;
    }

    // 使用插件系统渲染内容
    return this._renderWithPlugin(plugin, entities, config);
  }

  _renderWithPlugin(pluginId, entities, config) {
    // 这里后期会根据插件ID调用对应的渲染函数
    // 现在先使用默认的实体列表渲染
    
    const entityData = this._getEntityData(entities);
    
    return `
      <div class="plugin-content plugin-${pluginId}">
        <div class="entities-list">
          ${entityData.map(entity => `
            <div class="entity-item" data-entity="${entity.id}">
              <div class="entity-info">
                <span class="entity-name">${entity.name}</span>
                <span class="entity-domain">${entity.domain}</span>
              </div>
              <div class="entity-state">
                <span class="state-value">${entity.state}</span>
                ${entity.unit ? `<span class="state-unit">${entity.unit}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _getEntityData(entityIds) {
    if (!this._hass || !this._hass.states) {
      console.warn('Home Assistant states not available');
      return entityIds.map(entityId => ({
        id: entityId,
        name: entityId,
        domain: 'unknown',
        state: '未知',
        unit: ''
      }));
    }
    
    return entityIds.map(entityId => {
      const entity = this._hass.states[entityId];
      if (!entity) {
        return {
          id: entityId,
          name: entityId,
          domain: 'unknown',
          state: '不可用',
          unit: ''
        };
      }
      
      return {
        id: entityId,
        name: entity.attributes.friendly_name || entityId,
        domain: entityId.split('.')[0],
        state: entity.state,
        unit: entity.attributes.unit_of_measurement || ''
      };
    });
  }

  _updateEntityStates() {
    if (!this._hass || !this._hass.states) return;
    
    const entityItems = this._shadow.querySelectorAll('.entity-item');
    entityItems.forEach(item => {
      const entityId = item.dataset.entity;
      const entity = this._hass.states[entityId];
      if (entity) {
        const stateElement = item.querySelector('.state-value');
        if (stateElement) {
          stateElement.textContent = entity.state;
        }
      }
    });
  }

  _renderFooter() {
    const { show_timestamp, show_entity_count } = this._config.layout.footer;
    const timestamp = show_timestamp ? new Date().toLocaleTimeString() : '';
    const entityCount = show_entity_count ? this._config.layout.content.entities.length : 0;
    
    return `
      <div class="ha-cardforge-footer">
        <div class="footer-info">
          ${show_timestamp ? `<span class="timestamp">${timestamp}</span>` : ''}
          ${show_entity_count ? `<span class="entity-count">实体: ${entityCount}</span>` : ''}
        </div>
        <div class="footer-actions">
          <span class="powered-by">HA-CardForge</span>
        </div>
      </div>
    `;
  }

  _generateStyles() {
    return `
      .ha-cardforge-container {
        background: var(--cardforge-bg-color, var(--card-background-color, white));
        border-radius: var(--cardforge-border-radius, 12px);
        box-shadow: var(--cardforge-shadow, 0 2px 4px rgba(0,0,0,0.1));
        overflow: hidden;
        font-family: var(--card-font-family, inherit);
        color: var(--cardforge-text-color, var(--primary-text-color));
      }

      .ha-cardforge-header {
        display: flex;
        align-items: center;
        padding: 16px;
        background: var(--cardforge-header-bg, var(--primary-color));
        color: var(--cardforge-header-text, white);
        font-weight: 500;
      }

      .header-icon {
        margin-right: 8px;
      }

      .header-title {
        flex: 1;
        font-size: 1.1em;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .edit-btn, .marketplace-btn {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .edit-btn:hover, .marketplace-btn:hover {
        opacity: 1;
      }

      .ha-cardforge-content {
        padding: 20px;
        min-height: 120px;
      }

      .content-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--disabled-text-color);
        text-align: center;
        height: 120px;
      }

      .setup-btn {
        margin-top: 12px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .entity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(0,0,0,0.02);
        border-radius: 6px;
        border-left: 4px solid var(--primary-color);
      }

      .entity-info {
        display: flex;
        flex-direction: column;
      }

      .entity-name {
        font-weight: 500;
      }

      .entity-domain {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .entity-state {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
      }

      .state-unit {
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }

      .ha-cardforge-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--cardforge-footer-bg, rgba(0,0,0,0.03));
        border-top: 1px solid var(--divider-color);
        font-size: 0.9em;
        color: var(--cardforge-secondary-color, var(--secondary-text-color));
      }

      .footer-info {
        display: flex;
        gap: 16px;
      }

      .powered-by {
        font-size: 0.8em;
        opacity: 0.7;
      }
    `;
  }

  _attachEventListeners() {
    // 编辑按钮
    const editBtn = this._shadow.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this._openEditor());
    }

    // 插件市场按钮
    const marketplaceBtn = this._shadow.querySelector('.marketplace-btn');
    if (marketplaceBtn) {
      marketplaceBtn.addEventListener('click', () => this._openMarketplace());
    }

    // 设置按钮
    const setupBtn = this._shadow.querySelector('.setup-btn');
    if (setupBtn) {
      setupBtn.addEventListener('click', () => this._openEditor());
    }

    // 空内容区域点击事件
    const emptyContent = this._shadow.querySelector('.content-empty');
    if (emptyContent && !setupBtn) {
      emptyContent.addEventListener('click', () => this._openEditor());
    }
  }

  _openEditor() {
    if (window.HACardForgeEditor) {
      window.HACardForgeEditor.open(this._config, (newConfig) => {
        this.setConfig(newConfig);
      });
    }
  }

  _openMarketplace() {
    if (window.CardMarketplace) {
      window.CardMarketplace.openMarketplace();
    }
  }

  // Home Assistant 标准接口
  getCardSize() {
    return 3;
  }
}