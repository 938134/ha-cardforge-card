export class CardForge extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._entities = {};
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = this._validateConfig(config);
    this._render();
  }

  _validateConfig(config) {
    const defaultConfig = {
      layout: {
        header: { title: '', icon: '', visible: true },
        content: { plugin: '', entities: [] },
        footer: { visible: true, show_timestamp: false }
      },
      styles: {},
      theme: 'default'
    };
    return { ...defaultConfig, ...config };
  }

  _render() {
    this._shadow.innerHTML = this._generateHTML();
    this._attachEventListeners();
  }

  _generateHTML() {
    const { header, content, footer } = this._config.layout;
    
    return `
      <style>${this._generateStyles()}</style>
      <div class="cardforge-container">
        ${header.visible ? this._renderHeader() : ''}
        <div class="cardforge-content" id="content-area">
          ${this._renderContent()}
        </div>
        ${footer.visible ? this._renderFooter() : ''}
      </div>
    `;
  }

  _renderHeader() {
    const { title, icon } = this._config.layout.header;
    return `
      <div class="cardforge-header">
        ${icon ? `<ha-icon class="header-icon" icon="${icon}"></ha-icon>` : ''}
        <span class="header-title">${title}</span>
        <div class="header-actions">
          <ha-icon class="edit-btn" icon="mdi:cog" title="编辑卡片"></ha-icon>
        </div>
      </div>
    `;
  }

  _renderContent() {
    const { plugin, entities } = this._config.layout.content;
    
    if (!plugin) {
      return `
        <div class="content-empty">
          <ha-icon icon="mdi:plus-circle"></ha-icon>
          <p>点击配置内容区域</p>
        </div>
      `;
    }

    // 简单的内容展示（后期替换为插件系统）
    return `
      <div class="content-plugin">
        <div class="plugin-placeholder">
          <ha-icon icon="mdi:widgets"></ha-icon>
          <h3>${plugin}</h3>
          <div class="entity-list">
            ${entities.map(entity => `
              <div class="entity-item">
                <span class="entity-name">${entity}</span>
                <span class="entity-state" id="state-${entity}">--</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  _renderFooter() {
    const { show_timestamp } = this._config.layout.footer;
    const timestamp = show_timestamp ? new Date().toLocaleTimeString() : '';
    
    return `
      <div class="cardforge-footer">
        <div class="footer-info">
          ${show_timestamp ? `<span class="timestamp">${timestamp}</span>` : ''}
        </div>
      </div>
    `;
  }

  _generateStyles() {
    return `
      .cardforge-container {
        background: var(--card-background-color, white);
        border-radius: var(--card-border-radius, 12px);
        box-shadow: var(--card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        overflow: hidden;
        font-family: var(--card-font-family, inherit);
      }

      .cardforge-header {
        display: flex;
        align-items: center;
        padding: 16px;
        background: var(--header-bg-color, var(--primary-color));
        color: var(--header-text-color, white);
        font-weight: 500;
      }

      .header-icon {
        margin-right: 8px;
      }

      .header-title {
        flex: 1;
        font-size: 1.1em;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .edit-btn {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .edit-btn:hover {
        opacity: 1;
      }

      .cardforge-content {
        padding: 20px;
        min-height: 120px;
      }

      .content-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--disabled-text-color);
        cursor: pointer;
        height: 100%;
      }

      .content-empty:hover {
        color: var(--primary-color);
      }

      .plugin-placeholder {
        text-align: center;
        color: var(--secondary-text-color);
      }

      .entity-list {
        margin-top: 16px;
        text-align: left;
      }

      .entity-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .cardforge-footer {
        padding: 12px 16px;
        background: var(--footer-bg-color, rgba(0,0,0,0.03));
        border-top: 1px solid var(--divider-color);
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }

      .footer-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `;
  }

  _attachEventListeners() {
    // 编辑按钮点击事件
    const editBtn = this._shadow.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this._openEditor());
    }

    // 空内容区域点击事件
    const emptyContent = this._shadow.querySelector('.content-empty');
    if (emptyContent) {
      emptyContent.addEventListener('click', () => this._openEditor());
    }
  }

  _openEditor() {
    if (window.CardForgeEditor) {
      window.CardForgeEditor.open(this._config, (newConfig) => {
        this.setConfig(newConfig);
      });
    }
  }

  // Home Assistant 标准接口
  getCardSize() {
    return 3;
  }
}
