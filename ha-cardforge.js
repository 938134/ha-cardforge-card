class HACardForge extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._entities = {};
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
    if (!window.hass) return [];
    
    return entityIds.map(entityId => {
      const entity = window.hass.states[entityId];
      if (!entity) {
        return {
          id: entityId,
          name: entityId,
          domain: 'unknown',
          state: '未知',
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

  _updateEntityStates() {
    if (!window.hass) return;
    
    const entityItems = this._shadow.querySelectorAll('.entity-item');
    entityItems.forEach(item => {
      const entityId = item.dataset.entity;
      const entity = window.hass.states[entityId];
      if (entity) {
        const stateElement = item.querySelector('.state-value');
        if (stateElement) {
          stateElement.textContent = entity.state;
        }
      }
    });
  }

  // Home Assistant 状态更新
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

  // Home Assistant 标准接口
  getCardSize() {
    return 3;
  }
}

class HACardForgeEditor {
  static open(currentConfig, onSave) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const editor = document.createElement('div');
    editor.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 95%;
      max-width: 1000px;
      max-height: 90vh;
      overflow: auto;
      display: flex;
    `;

    editor.innerHTML = this._generateEditorHTML(currentConfig);
    overlay.appendChild(editor);
    document.body.appendChild(overlay);

    this._bindEvents(editor, overlay, currentConfig, onSave);
  }

  static _generateEditorHTML(config) {
    const themes = window.ThemeManager ? window.ThemeManager.getAllThemes() : [];
    
    return `
      <div class="cardforge-editor">
        <div class="editor-sidebar">
          <h3>⚙️ 设置</h3>
          <div class="sidebar-tabs">
            <button class="tab-btn active" data-tab="layout">布局</button>
            <button class="tab-btn" data-tab="style">样式</button>
            <button class="tab-btn" data-tab="plugins">插件</button>
            <button class="tab-btn" data-tab="advanced">高级</button>
          </div>
        </div>
        
        <div class="editor-main">
          <div class="editor-header">
            <h2>🎨 卡片编辑器</h2>
            <div class="editor-preview-toggle">
              <label>
                <input type="checkbox" id="live-preview" checked>
                实时预览
              </label>
            </div>
          </div>
          
          <div class="tab-content active" id="layout-tab">
            ${this._generateLayoutTab(config)}
          </div>
          
          <div class="tab-content" id="style-tab">
            ${this._generateStyleTab(config, themes)}
          </div>
          
          <div class="tab-content" id="plugins-tab">
            ${this._generatePluginsTab(config)}
          </div>
          
          <div class="tab-content" id="advanced-tab">
            ${this._generateAdvancedTab(config)}
          </div>
          
          <div class="editor-actions">
            <button type="button" id="editor-marketplace" class="secondary">🛒 插件市场</button>
            <div>
              <button type="button" id="editor-cancel" class="secondary">取消</button>
              <button type="button" id="editor-preview">预览</button>
              <button type="button" id="editor-save">保存</button>
            </div>
          </div>
        </div>
        
        <div class="editor-preview" id="preview-panel">
          <h4>实时预览</h4>
          <div id="preview-container"></div>
        </div>
      </div>

      <style>
        .cardforge-editor { 
          display: flex; 
          width: 100%;
          min-height: 600px;
        }
        
        .editor-sidebar {
          width: 200px;
          background: var(--sidebar-background-color, #f5f5f5);
          padding: 20px;
          border-right: 1px solid var(--divider-color);
        }
        
        .editor-sidebar h3 { 
          margin: 0 0 20px 0; 
          color: var(--primary-color);
        }
        
        .sidebar-tabs { 
          display: flex; 
          flex-direction: column;
          gap: 4px;
        }
        
        .tab-btn {
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .tab-btn.active {
          background: var(--primary-color);
          color: white;
        }
        
        .editor-main {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .editor-header h2 {
          margin: 0;
          color: var(--primary-color);
        }
        
        .tab-content {
          flex: 1;
          overflow: auto;
          display: none;
        }
        
        .tab-content.active {
          display: block;
        }
        
        .editor-section {
          margin: 20px 0;
          padding: 16px;
          background: var(--secondary-background-color, #fafafa);
          border-radius: 8px;
        }
        
        .editor-section h3 {
          margin: 0 0 12px 0;
          color: var(--secondary-text-color);
          font-size: 1em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-group {
          margin: 16px 0;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-group label {
          margin: 0;
          font-weight: normal;
        }
        
        .form-row {
          display: flex;
          gap: 12px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .editor-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--divider-color);
        }
        
        .editor-actions > div {
          display: flex;
          gap: 8px;
        }
        
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        button.secondary {
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
        }
        
        button:not(.secondary) {
          background: var(--primary-color);
          color: white;
        }
        
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .editor-preview {
          width: 300px;
          padding: 20px;
          background: var(--secondary-background-color, #fafafa);
          border-left: 1px solid var(--divider-color);
        }
        
        .editor-preview h4 {
          margin: 0 0 16px 0;
          color: var(--secondary-text-color);
        }
        
        #preview-container {
          background: var(--card-background-color, white);
          border-radius: 8px;
          padding: 16px;
          min-height: 200px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .color-picker {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .color-preview {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
        }
        
        .plugin-card {
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 16px;
          margin: 8px 0;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .plugin-card:hover {
          border-color: var(--primary-color);
        }
        
        .plugin-card.selected {
          border-color: var(--primary-color);
          background: rgba(var(--primary-color-rgb), 0.1);
        }
        
        .plugin-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .plugin-icon {
          font-size: 1.5em;
        }
        
        .plugin-name {
          font-weight: bold;
          flex: 1;
        }
        
        .plugin-description {
          color: var(--secondary-text-color);
          font-size: 0.9em;
        }
      </style>
    `;
  }

  static _generateLayoutTab(config) {
    return `
      <div class="editor-section">
        <h3>🏷️ 标题设置</h3>
        <div class="form-group">
          <label>标题文本</label>
          <input type="text" id="header-title" value="${config.layout.header.title || ''}" placeholder="输入卡片标题">
        </div>
        <div class="form-group">
          <label>图标</label>
          <input type="text" id="header-icon" value="${config.layout.header.icon || ''}" placeholder="mdi:home">
        </div>
        <div class="form-row">
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="header-visible" ${config.layout.header.visible ? 'checked' : ''}>
              <label for="header-visible">显示标题栏</label>
            </div>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="header-edit-btn" ${config.layout.header.show_edit_button !== false ? 'checked' : ''}>
              <label for="header-edit-btn">显示编辑按钮</label>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-section">
        <h3>📊 内容设置</h3>
        <div class="form-group">
          <label>实体列表</label>
          <button type="button" id="pick-entities" class="secondary" style="width: 100%; margin-bottom: 8px;">
            📋 选择实体
          </button>
          <div id="selected-entities">
            ${this._renderSelectedEntities(config.layout.content.entities)}
          </div>
        </div>
      </div>

      <div class="editor-section">
        <h3>📄 页脚设置</h3>
        <div class="form-row">
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="footer-visible" ${config.layout.footer.visible ? 'checked' : ''}>
              <label for="footer-visible">显示页脚</label>
            </div>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="show-timestamp" ${config.layout.footer.show_timestamp ? 'checked' : ''}>
              <label for="show-timestamp">显示时间戳</label>
            </div>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="show-entity-count" ${config.layout.footer.show_entity_count !== false ? 'checked' : ''}>
              <label for="show-entity-count">显示实体数量</label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static _generateStyleTab(config, themes) {
    return `
      <div class="editor-section">
        <h3>🎨 主题选择</h3>
        <div class="form-group">
          <label>主题</label>
          <select id="theme-select">
            ${themes.map(theme => `
              <option value="${theme.id}" ${config.theme === theme.id ? 'selected' : ''}>
                ${theme.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="editor-section">
        <h3>🖌️ 自定义样式</h3>
        <div class="form-group">
          <label>背景颜色</label>
          <div class="color-picker">
            <div class="color-preview" id="bg-color-preview" style="background: ${config.styles.background || 'var(--card-background-color)'}"></div>
            <input type="text" id="bg-color" value="${config.styles.background || ''}" placeholder="使用CSS颜色值">
          </div>
        </div>
        <div class="form-group">
          <label>边框圆角</label>
          <input type="text" id="border-radius" value="${config.styles.border_radius || ''}" placeholder="例如: 12px">
        </div>
      </div>
    `;
  }

  static _generatePluginsTab(config) {
    const plugins = window.CardMarketplace ? window.CardMarketplace.getInstalledPlugins() : [];
    
    return `
      <div class="editor-section">
        <h3>🔌 已安装插件</h3>
        ${plugins.length > 0 ? plugins.map(plugin => `
          <div class="plugin-card ${config.layout.content.plugin === plugin.id ? 'selected' : ''}" data-plugin="${plugin.id}">
            <div class="plugin-header">
              <span class="plugin-icon">${plugin.preview}</span>
              <span class="plugin-name">${plugin.name}</span>
            </div>
            <div class="plugin-description">${plugin.description}</div>
          </div>
        `).join('') : `
          <p style="color: var(--secondary-text-color); text-align: center; padding: 20px;">
            暂无已安装的插件
          </p>
        `}
      </div>
    `;
  }

  static _generateAdvancedTab(config) {
    return `
      <div class="editor-section">
        <h3>⚡ 高级设置</h3>
        <div class="form-group">
          <label>刷新间隔 (秒)</label>
          <input type="number" id="refresh-interval" value="${config.refresh_interval || 30}" min="5" max="3600">
        </div>
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="enable-marketplace" ${config.marketplace?.enabled !== false ? 'checked' : ''}>
            <label for="enable-marketplace">启用插件市场</label>
          </div>
        </div>
      </div>
    `;
  }

  static _renderSelectedEntities(entities) {
    if (!entities || entities.length === 0) {
      return '<div style="color: var(--disabled-text-color); text-align: center; padding: 20px;">未选择实体</div>';
    }
    return `
      <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--divider-color); border-radius: 4px; padding: 8px;">
        ${entities.map(entity => `
          <div class="entity-tag" style="display: inline-block; background: var(--primary-color); color: white; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 0.8em;">
            ${entity}
          </div>
        `).join('')}
      </div>
    `;
  }

  static _bindEvents(editor, overlay, currentConfig, onSave) {
    // 标签页切换
    editor.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editor.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        editor.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        editor.querySelector(`#${btn.dataset.tab}-tab`).classList.add('active');
      });
    });

    // 选择实体按钮
    editor.querySelector('#pick-entities').addEventListener('click', () => {
      if (window.EntityPicker) {
        window.EntityPicker.open(currentConfig.layout.content.entities || [], (selectedEntities) => {
          const entitiesDiv = editor.querySelector('#selected-entities');
          entitiesDiv.innerHTML = this._renderSelectedEntities(selectedEntities);
          currentConfig.layout.content.entities = selectedEntities;
          this._updatePreview(editor, currentConfig);
        });
      }
    });

    // 插件选择
    editor.querySelectorAll('.plugin-card').forEach(card => {
      card.addEventListener('click', () => {
        editor.querySelectorAll('.plugin-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentConfig.layout.content.plugin = card.dataset.plugin;
        this._updatePreview(editor, currentConfig);
      });
    });

    // 插件市场按钮
    editor.querySelector('#editor-marketplace').addEventListener('click', () => {
      if (window.CardMarketplace) {
        window.CardMarketplace.openMarketplace();
      }
    });

    // 实时预览
    const livePreview = editor.querySelector('#live-preview');
    const inputs = editor.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (livePreview.checked) {
          this._collectFormData(editor, currentConfig);
          this._updatePreview(editor, currentConfig);
        }
      });
      input.addEventListener('change', () => {
        if (livePreview.checked) {
          this._collectFormData(editor, currentConfig);
          this._updatePreview(editor, currentConfig);
        }
      });
    });

    // 取消按钮
    editor.querySelector('#editor-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 预览按钮
    editor.querySelector('#editor-preview').addEventListener('click', () => {
      this._collectFormData(editor, currentConfig);
      this._updatePreview(editor, currentConfig);
    });

    // 保存按钮
    editor.querySelector('#editor-save').addEventListener('click', () => {
      this._collectFormData(editor, currentConfig);
      onSave(currentConfig);
      document.body.removeChild(overlay);
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // 初始预览
    this._updatePreview(editor, currentConfig);
  }

  static _collectFormData(editor, config) {
    // 收集所有表单数据
    config.layout.header.title = editor.querySelector('#header-title').value;
    config.layout.header.icon = editor.querySelector('#header-icon').value;
    config.layout.header.visible = editor.querySelector('#header-visible').checked;
    config.layout.header.show_edit_button = editor.querySelector('#header-edit-btn').checked;
    
    config.layout.footer.visible = editor.querySelector('#footer-visible').checked;
    config.layout.footer.show_timestamp = editor.querySelector('#show-timestamp').checked;
    config.layout.footer.show_entity_count = editor.querySelector('#show-entity-count').checked;
    
    config.theme = editor.querySelector('#theme-select').value;
    config.refresh_interval = parseInt(editor.querySelector('#refresh-interval').value) || 30;
    
    if (config.marketplace) {
      config.marketplace.enabled = editor.querySelector('#enable-marketplace').checked;
    }

    // 样式
    config.styles = config.styles || {};
    config.styles.background = editor.querySelector('#bg-color').value || undefined;
    config.styles.border_radius = editor.querySelector('#border-radius').value || undefined;
  }

  static _updatePreview(editor, config) {
    const previewContainer = editor.querySelector('#preview-container');
    if (!previewContainer) return;

    // 创建临时预览元素
    const tempElement = document.createElement('div');
    tempElement.style.cssText = 'transform: scale(0.8); transform-origin: top left;';
    
    if (window.HACardForge) {
      const previewCard = new window.HACardForge();
      previewCard.setConfig(JSON.parse(JSON.stringify(config))); // 深拷贝配置
      tempElement.appendChild(previewCard);
    } else {
      tempElement.innerHTML = '<p>预览不可用</p>';
    }
    
    previewContainer.innerHTML = '';
    previewContainer.appendChild(tempElement);
  }
}

class EntityPicker {
  static open(currentEntities, onSelect) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;

    const picker = document.createElement('div');
    picker.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 95%;
      max-width: 800px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    picker.innerHTML = this._generatePickerHTML(currentEntities);
    overlay.appendChild(picker);
    document.body.appendChild(overlay);

    this._bindPickerEvents(picker, overlay, currentEntities, onSelect);
  }

  static _generatePickerHTML(currentEntities) {
    return `
      <div class="entity-picker">
        <div class="picker-header">
          <h2>🔍 选择实体</h2>
          <div class="picker-controls">
            <input type="text" id="entity-search" placeholder="搜索实体名称或ID..." style="flex: 1;">
            <select id="domain-filter" style="margin-left: 8px;">
              <option value="">所有类型</option>
              <option value="sensor">传感器</option>
              <option value="light">灯光</option>
              <option value="switch">开关</option>
              <option value="binary_sensor">二进制传感器</option>
              <option value="climate">气候</option>
              <option value="media_player">媒体播放器</option>
              <option value="cover">窗帘</option>
              <option value="automation">自动化</option>
            </select>
          </div>
        </div>
        
        <div class="picker-content">
          <div class="entities-section">
            <h4>可用实体</h4>
            <div class="entities-list" id="available-entities">
              <div class="loading">加载实体列表...</div>
            </div>
          </div>
          
          <div class="selected-section">
            <h4>已选择实体</h4>
            <div class="selected-list" id="selected-entities-list">
              ${this._renderSelectedList(currentEntities)}
            </div>
          </div>
        </div>

        <div class="picker-footer">
          <div class="selection-info">
            <span id="selected-count">已选择: 0</span>
            <span id="total-count">总数: 0</span>
          </div>
          <div class="picker-actions">
            <button id="picker-cancel" class="secondary">取消</button>
            <button id="picker-clear" class="secondary">清空</button>
            <button id="picker-confirm">确认选择</button>
          </div>
        </div>
      </div>

      <style>
        .entity-picker { 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
        }
        
        .picker-header { 
          padding: 20px; 
          border-bottom: 1px solid var(--divider-color); 
        }
        
        .picker-header h2 { 
          margin: 0 0 16px 0; 
          color: var(--primary-color);
        }
        
        .picker-controls { 
          display: flex; 
          gap: 8px; 
        }
        
        .picker-controls input, 
        .picker-controls select {
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
        }
        
        .picker-content { 
          flex: 1; 
          display: flex; 
          overflow: hidden;
        }
        
        .entities-section, 
        .selected-section { 
          flex: 1; 
          padding: 16px; 
          display: flex;
          flex-direction: column;
        }
        
        .entities-section { 
          border-right: 1px solid var(--divider-color); 
        }
        
        .entities-section h4,
        .selected-section h4 {
          margin: 0 0 12px 0;
          color: var(--secondary-text-color);
        }
        
        .entities-list, 
        .selected-list { 
          flex: 1; 
          overflow-y: auto; 
          border: 1px solid var(--divider-color);
          border-radius: 4px;
        }
        
        .entity-item { 
          display: flex; 
          align-items: center; 
          padding: 12px;
          border-bottom: 1px solid var(--divider-color);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .entity-item:hover { 
          background: var(--secondary-background-color); 
        }
        
        .entity-item.selected { 
          background: rgba(var(--primary-color-rgb), 0.1);
          border-left: 3px solid var(--primary-color);
        }
        
        .entity-checkbox { 
          margin-right: 12px; 
        }
        
        .entity-info { 
          flex: 1; 
        }
        
        .entity-name { 
          font-weight: 500; 
          display: block; 
          margin-bottom: 2px;
        }
        
        .entity-id { 
          font-size: 0.8em; 
          color: var(--secondary-text-color);
          font-family: monospace;
        }
        
        .entity-state { 
          font-size: 0.9em; 
          padding: 4px 8px;
          background: var(--secondary-background-color);
          border-radius: 12px;
          min-width: 60px;
          text-align: center;
        }
        
        .entity-state.on { 
          background: var(--success-color, #4caf50); 
          color: white;
        }
        
        .entity-state.off { 
          background: var(--error-color, #f44336); 
          color: white;
        }
        
        .selected-entity {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        
        .remove-entity {
          background: none;
          border: none;
          color: var(--error-color);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .remove-entity:hover {
          background: var(--error-color);
          color: white;
        }
        
        .picker-footer { 
          padding: 16px; 
          border-top: 1px solid var(--divider-color); 
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .selection-info {
          display: flex;
          gap: 16px;
          color: var(--secondary-text-color);
          font-size: 0.9em;
        }
        
        .picker-actions { 
          display: flex; 
          gap: 8px; 
        }
        
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        button.secondary {
          background: var(--secondary-background-color);
          color: var(--secondary-text-color);
        }
        
        button:not(.secondary) {
          background: var(--primary-color);
          color: white;
        }
        
        .loading {
          padding: 40px;
          text-align: center;
          color: var(--disabled-text-color);
        }
        
        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--disabled-text-color);
        }
      </style>
    `;
  }

  static _renderSelectedList(entities) {
    if (!entities || entities.length === 0) {
      return '<div class="empty-state">暂无选择的实体</div>';
    }
    
    return entities.map(entityId => `
      <div class="selected-entity" data-entity="${entityId}">
        <span class="entity-name">${this._getEntityDisplayName(entityId)}</span>
        <button class="remove-entity" title="移除">×</button>
      </div>
    `).join('');
  }

  static _getEntityDisplayName(entityId) {
    if (!window.hass) return entityId;
    
    const entity = window.hass.states[entityId];
    return entity?.attributes?.friendly_name || entityId;
  }

  static _bindPickerEvents(picker, overlay, currentEntities, onSelect) {
    const selectedEntities = new Set(currentEntities || []);
    
    // 加载实体列表
    this._loadEntities(picker, selectedEntities);

    // 搜索功能
    const searchInput = picker.querySelector('#entity-search');
    searchInput.addEventListener('input', (e) => {
      this._filterEntities(picker, e.target.value, picker.querySelector('#domain-filter').value);
    });

    // 类型过滤
    const domainFilter = picker.querySelector('#domain-filter');
    domainFilter.addEventListener('change', () => {
      this._filterEntities(picker, searchInput.value, domainFilter.value);
    });

    // 取消按钮
    picker.querySelector('#picker-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 清空按钮
    picker.querySelector('#picker-clear').addEventListener('click', () => {
      selectedEntities.clear();
      this._updateSelection(picker, selectedEntities);
    });

    // 确认选择
    picker.querySelector('#picker-confirm').addEventListener('click', () => {
      onSelect(Array.from(selectedEntities));
      document.body.removeChild(overlay);
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // 初始计数
    this._updateSelectionCount(picker, selectedEntities.size);
  }

  static _loadEntities(picker, selectedEntities) {
    if (!window.hass) {
      const entitiesList = picker.querySelector('#available-entities');
      entitiesList.innerHTML = '<div class="empty-state">无法访问Home Assistant实例</div>';
      return;
    }

    const entities = Object.keys(window.hass.states)
      .sort((a, b) => {
        const nameA = this._getEntityDisplayName(a).toLowerCase();
        const nameB = this._getEntityDisplayName(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });

    this._renderEntitiesList(picker, entities, selectedEntities);
    this._updateTotalCount(picker, entities.length);
  }

  static _renderEntitiesList(picker, entities, selectedEntities) {
    const entitiesList = picker.querySelector('#available-entities');
    
    if (entities.length === 0) {
      entitiesList.innerHTML = '<div class="empty-state">未找到实体</div>';
      return;
    }

    entitiesList.innerHTML = entities.map(entityId => {
      const entity = window.hass.states[entityId];
      const isSelected = selectedEntities.has(entityId);
      const domain = entityId.split('.')[0];
      const displayName = this._getEntityDisplayName(entityId);
      
      let stateClass = '';
      if (entity.state === 'on') stateClass = 'on';
      if (entity.state === 'off') stateClass = 'off';
      
      return `
        <div class="entity-item ${isSelected ? 'selected' : ''}" data-entity="${entityId}" data-domain="${domain}">
          <input type="checkbox" class="entity-checkbox" ${isSelected ? 'checked' : ''}>
          <div class="entity-info">
            <span class="entity-name">${displayName}</span>
            <span class="entity-id">${entityId}</span>
          </div>
          <div class="entity-state ${stateClass}">${entity.state}</div>
        </div>
      `;
    }).join('');

    // 绑定选择事件
    entitiesList.querySelectorAll('.entity-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const entityId = item.dataset.entity;
        const checkbox = item.querySelector('.entity-checkbox');
        
        if (selectedEntities.has(entityId)) {
          selectedEntities.delete(entityId);
          checkbox.checked = false;
          item.classList.remove('selected');
        } else {
          selectedEntities.add(entityId);
          checkbox.checked = true;
          item.classList.add('selected');
        }
        
        this._updateSelection(picker, selectedEntities);
      });
    });
  }

  static _filterEntities(picker, searchText, domainFilter) {
    const items = picker.querySelectorAll('.entity-item');
    const searchLower = searchText.toLowerCase();
    
    let visibleCount = 0;
    
    items.forEach(item => {
      const entityId = item.dataset.entity;
      const entityDomain = item.dataset.domain;
      const displayName = this._getEntityDisplayName(entityId).toLowerCase();
      
      const matchesSearch = !searchText || 
        entityId.toLowerCase().includes(searchLower) || 
        displayName.includes(searchLower);
      
      const matchesDomain = !domainFilter || entityDomain === domainFilter;
      
      const isVisible = matchesSearch && matchesDomain;
      item.style.display = isVisible ? 'flex' : 'none';
      
      if (isVisible) visibleCount++;
    });
    
    this._updateTotalCount(picker, visibleCount);
  }

  static _updateSelection(picker, selectedEntities) {
    // 更新选择计数
    this._updateSelectionCount(picker, selectedEntities.size);
    
    // 更新已选择列表
    const selectedList = picker.querySelector('#selected-entities-list');
    selectedList.innerHTML = this._renderSelectedList(Array.from(selectedEntities));
    
    // 绑定移除事件
    selectedList.querySelectorAll('.remove-entity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entityId = btn.closest('.selected-entity').dataset.entity;
        selectedEntities.delete(entityId);
        this._updateSelection(picker, selectedEntities);
        
        // 更新主列表中的选中状态
        const entityItem = picker.querySelector(`.entity-item[data-entity="${entityId}"]`);
        if (entityItem) {
          entityItem.classList.remove('selected');
          entityItem.querySelector('.entity-checkbox').checked = false;
        }
      });
    });
  }

  static _updateSelectionCount(picker, count) {
    picker.querySelector('#selected-count').textContent = `已选择: ${count}`;
  }

  static _updateTotalCount(picker, count) {
    picker.querySelector('#total-count').textContent = `总数: ${count}`;
  }
}

class CardMarketplace {
  static async getAvailablePlugins() {
    try {
      // 从远程获取插件列表（后期可以配置为从GitHub仓库获取）
      const plugins = await this._fetchPlugins();
      return plugins;
    } catch (error) {
      console.error('Failed to fetch plugins:', error);
      return this._getDefaultPlugins();
    }
  }

  static async _fetchPlugins() {
    
    // 暂时返回默认插件，后期实现远程加载
    return this._getDefaultPlugins();
  }

  static _getDefaultPlugins() {
    return [
      {
        id: 'simple-entities',
        name: '实体列表',
        description: '显示实体状态的简单列表',
        author: 'ha-cardforge',
        version: '1.0.0',
        category: 'basic',
        preview: '📊',
        installed: true
      },
      {
        id: 'weather-card',
        name: '天气卡片',
        description: '显示天气信息的卡片',
        author: 'ha-cardforge',
        version: '1.0.0',
        category: 'weather',
        preview: '🌤️',
        installed: false
      },
      {
        id: 'device-status',
        name: '设备状态',
        description: '显示设备开关状态的网格',
        author: 'ha-cardforge',
        version: '1.0.0',
        category: 'devices',
        preview: '💡',
        installed: false
      },
      {
        id: 'sensor-grid',
        name: '传感器网格',
        description: '以网格形式显示传感器数据',
        author: 'ha-cardforge',
        version: '1.0.0',
        category: 'sensors',
        preview: '📈',
        installed: false
      },
      {
        id: 'media-control',
        name: '媒体控制',
        description: '媒体播放器控制卡片',
        author: 'ha-cardforge',
        version: '1.0.0',
        category: 'media',
        preview: '🎵',
        installed: false
      }
    ];
  }

  static async installPlugin(pluginId) {
    try {
      // 模拟安装过程
      console.log(`Installing plugin: ${pluginId}`);
      
      // 这里后期实现从远程下载插件代码
      const pluginCode = await this._downloadPlugin(pluginId);
      
      // 加载插件到页面
      this._loadPlugin(pluginId, pluginCode);
      
      return true;
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      return false;
    }
  }

  static async _downloadPlugin(pluginId) {
    // 模拟下载延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟的插件代码
    return `
      class ${this._idToClassName(pluginId)} {
        static render(entities, config) {
          return \`
            <div class="plugin-\${pluginId}">
              <h3>\${config.title || pluginId}</h3>
              <div class="entities">
                \${entities.map(entity => \`
                  <div class="entity">
                    <span class="name">\${entity.name}</span>
                    <span class="state">\${entity.state}</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        }
      }
    `;
  }

  static _loadPlugin(pluginId, code) {
    // 动态执行插件代码
    try {
      eval(code);
      console.log(`Plugin ${pluginId} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
    }
  }

  static _idToClassName(id) {
    return id.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Plugin';
  }

  static getInstalledPlugins() {
    return this._getDefaultPlugins().filter(plugin => plugin.installed);
  }

  static async checkForUpdates() {
    const installed = this.getInstalledPlugins();
    const available = await this.getAvailablePlugins();
    
    const updates = installed.filter(installedPlugin => {
      const availablePlugin = available.find(p => p.id === installedPlugin.id);
      return availablePlugin && availablePlugin.version !== installedPlugin.version;
    });
    
    return updates;
  }

  static openMarketplace() {
    this._createMarketplaceModal();
  }

  static _createMarketplaceModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10002;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 90%;
      max-width: 900px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    modal.innerHTML = this._generateMarketplaceHTML();
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this._bindMarketplaceEvents(modal, overlay);
    this._loadPluginsList(modal);
  }

  static _generateMarketplaceHTML() {
    return `
      <div class="marketplace-modal">
        <div class="marketplace-header">
          <h2>🛒 卡片插件市场</h2>
          <div class="marketplace-tabs">
            <button class="tab-btn active" data-tab="discover">发现</button>
            <button class="tab-btn" data-tab="installed">已安装</button>
            <button class="tab-btn" data-tab="updates">更新</button>
          </div>
        </div>
        
        <div class="marketplace-content">
          <div class="tab-content active" id="discover-tab">
            <div class="plugins-grid" id="plugins-grid">
              <!-- 插件列表将动态加载 -->
              <div class="loading">加载中...</div>
            </div>
          </div>
          
          <div class="tab-content" id="installed-tab">
            <div id="installed-plugins">
              <!-- 已安装插件列表 -->
            </div>
          </div>
          
          <div class="tab-content" id="updates-tab">
            <div id="updates-list">
              <!-- 更新列表 -->
            </div>
          </div>
        </div>
        
        <div class="marketplace-footer">
          <button id="marketplace-close" class="secondary">关闭</button>
        </div>
      </div>

      <style>
        .marketplace-modal { display: flex; flex-direction: column; height: 100%; }
        .marketplace-header { padding: 20px; border-bottom: 1px solid var(--divider-color); }
        .marketplace-header h2 { margin: 0 0 16px 0; }
        .marketplace-tabs { display: flex; gap: 8px; }
        .tab-btn { padding: 8px 16px; border: none; background: none; cursor: pointer; border-radius: 4px; }
        .tab-btn.active { background: var(--primary-color); color: white; }
        .marketplace-content { flex: 1; overflow: auto; padding: 20px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .plugins-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
        
        .plugin-card {
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .plugin-card:hover { border-color: var(--primary-color); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .plugin-card.installed { border-color: var(--success-color); }
        .plugin-preview { font-size: 2em; margin-bottom: 8px; }
        .plugin-name { font-weight: bold; margin-bottom: 4px; }
        .plugin-description { font-size: 0.9em; color: var(--secondary-text-color); margin-bottom: 8px; }
        .plugin-meta { display: flex; justify-content: space-between; font-size: 0.8em; color: var(--secondary-text-color); }
        .install-btn { margin-top: 8px; width: 100%; }
        
        .marketplace-footer { padding: 16px; border-top: 1px solid var(--divider-color); text-align: right; }
      </style>
    `;
  }

  static async _loadPluginsList(modal) {
    const plugins = await this.getAvailablePlugins();
    const grid = modal.querySelector('#plugins-grid');
    
    grid.innerHTML = plugins.map(plugin => `
      <div class="plugin-card ${plugin.installed ? 'installed' : ''}" data-plugin="${plugin.id}">
        <div class="plugin-preview">${plugin.preview}</div>
        <div class="plugin-name">${plugin.name}</div>
        <div class="plugin-description">${plugin.description}</div>
        <div class="plugin-meta">
          <span>v${plugin.version}</span>
          <span>by ${plugin.author}</span>
        </div>
        <button class="install-btn ${plugin.installed ? 'secondary' : ''}" 
                data-plugin="${plugin.id}">
          ${plugin.installed ? '已安装' : '安装'}
        </button>
      </div>
    `).join('');

    // 绑定安装按钮事件
    grid.querySelectorAll('.install-btn').forEach(btn => {
      if (!btn.classList.contains('secondary')) {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const pluginId = btn.dataset.plugin;
          btn.textContent = '安装中...';
          btn.disabled = true;
          
          const success = await this.installPlugin(pluginId);
          if (success) {
            btn.textContent = '已安装';
            btn.classList.add('secondary');
            btn.disabled = true;
            btn.closest('.plugin-card').classList.add('installed');
          } else {
            btn.textContent = '安装失败';
            btn.disabled = false;
          }
        });
      }
    });
  }

  static _bindMarketplaceEvents(modal, overlay) {
    // 标签页切换
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        modal.querySelector(`#${btn.dataset.tab}-tab`).classList.add('active');
      });
    });

    // 关闭按钮
    modal.querySelector('#marketplace-close').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }
}

class ThemeManager {
  static init() {
    this.themes = {
      'default': {
        name: '默认主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #ffffff)',
          '--cardforge-text-color': 'var(--primary-text-color, #000000)',
          '--cardforge-primary-color': 'var(--primary-color, #03a9f4)',
          '--cardforge-secondary-color': 'var(--secondary-text-color, #737373)',
          '--cardforge-header-bg': 'var(--primary-color, #03a9f4)',
          '--cardforge-header-text': '#ffffff',
          '--cardforge-footer-bg': 'rgba(0, 0, 0, 0.03)',
          '--cardforge-border-radius': '12px',
          '--cardforge-shadow': '0 2px 4px rgba(0,0,0,0.1)'
        }
      },
      'dark': {
        name: '深色主题',
        variables: {
          '--cardforge-bg-color': 'var(--card-background-color, #1e1e1e)',
          '--cardforge-text-color': 'var(--primary-text-color, #ffffff)',
          '--cardforge-primary-color': 'var(--primary-color, #bb86fc)',
          '--cardforge-secondary-color': 'var(--secondary-text-color, #b0b0b0)',
          '--cardforge-header-bg': 'var(--primary-color, #bb86fc)',
          '--cardforge-header-text': '#000000',
          '--cardforge-footer-bg': 'rgba(255, 255, 255, 0.05)',
          '--cardforge-border-radius': '12px',
          '--cardforge-shadow': '0 2px 8px rgba(0,0,0,0.3)'
        }
      },
      'material': {
        name: '材质设计',
        variables: {
          '--cardforge-bg-color': '#fafafa',
          '--cardforge-text-color': '#212121',
          '--cardforge-primary-color': '#6200ee',
          '--cardforge-secondary-color': '#757575',
          '--cardforge-header-bg': 'linear-gradient(135deg, #6200ee, #3700b3)',
          '--cardforge-header-text': '#ffffff',
          '--cardforge-footer-bg': 'rgba(98, 0, 238, 0.08)',
          '--cardforge-border-radius': '8px',
          '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
        }
      },
      'minimal': {
        name: '极简风格',
        variables: {
          '--cardforge-bg-color': 'transparent',
          '--cardforge-text-color': 'var(--primary-text-color)',
          '--cardforge-primary-color': 'var(--primary-color)',
          '--cardforge-secondary-color': 'var(--secondary-text-color)',
          '--cardforge-header-bg': 'transparent',
          '--cardforge-header-text': 'var(--primary-text-color)',
          '--cardforge-footer-bg': 'transparent',
          '--cardforge-border-radius': '0px',
          '--cardforge-shadow': 'none'
        }
      }
    };
  }

  static getTheme(themeName) {
    return this.themes[themeName] || this.themes['default'];
  }

  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name
    }));
  }

  static applyTheme(element, themeName) {
    const theme = this.getTheme(themeName);
    const root = element.shadowRoot || element;
    
    // 移除旧的主题样式
    const oldStyle = root.querySelector('style[data-theme]');
    if (oldStyle) {
      oldStyle.remove();
    }

    // 创建新的主题样式
    const style = document.createElement('style');
    style.setAttribute('data-theme', themeName);
    
    let css = ':host {\\n';
    Object.keys(theme.variables).forEach(variable => {
      css += `  ${variable}: ${theme.variables[variable]};\\n`;
    });
    css += '}';
    
    style.textContent = css;
    root.appendChild(style);
  }

  static createCustomTheme(customVariables) {
    return {
      name: '自定义主题',
      variables: {
        ...this.themes['default'].variables,
        ...customVariables
      }
    };
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge')) {
  customElements.define('ha-cardforge', HACardForge);
}

// 暴露全局API
window.HACardForge = HACardForge;
window.HACardForgeEditor = HACardForgeEditor;
window.EntityPicker = EntityPicker;
window.CardMarketplace = CardMarketplace;
window.ThemeManager = ThemeManager;

// 初始化主题管理器
window.ThemeManager.init();

console.log('HA-CardForge loaded successfully!');
