import { LitElement, css, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class EntityPicker {
  static open(hass, currentEntities, onSelect) {
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

    this._bindPickerEvents(picker, overlay, hass, currentEntities, onSelect);
  }

  static _generatePickerHTML(currentEntities) {
    return `
      <div class="entity-picker">
        <div class="picker-header">
          <h2>🔍 选择实体</h2>
          <div class="picker-controls">
            <input type="text" id="entity-search" placeholder="搜索实体名称或ID...">
            <select id="domain-filter">
              <option value="">所有类型</option>
              <option value="sensor">传感器</option>
              <option value="light">灯光</option>
              <option value="switch">开关</option>
              <option value="binary_sensor">二进制传感器</option>
              <option value="climate">气候</option>
              <option value="media_player">媒体播放器</option>
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
            <span id="selected-count">已选择: ${currentEntities.length}</span>
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
        .entity-picker { display: flex; flex-direction: column; height: 100%; }
        .picker-header { padding: 20px; border-bottom: 1px solid var(--divider-color); }
        .picker-header h2 { margin: 0 0 16px 0; color: var(--primary-color); }
        .picker-controls { display: flex; gap: 8px; }
        .picker-controls input, .picker-controls select {
          padding: 8px 12px; border: 1px solid var(--divider-color); border-radius: 4px;
          background: var(--card-background-color); color: var(--primary-text-color);
        }
        .picker-controls input { flex: 1; }
        .picker-content { flex: 1; display: flex; overflow: hidden; }
        .entities-section, .selected-section { flex: 1; padding: 16px; display: flex; flex-direction: column; }
        .entities-section { border-right: 1px solid var(--divider-color); }
        .entities-section h4, .selected-section h4 { margin: 0 0 12px 0; color: var(--secondary-text-color); }
        .entities-list, .selected-list { flex: 1; overflow-y: auto; border: 1px solid var(--divider-color); border-radius: 4px; }
        
        .entity-item { 
          display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--divider-color);
          cursor: pointer; transition: background-color 0.2s;
        }
        .entity-item:hover { background: var(--secondary-background-color); }
        .entity-item.selected { background: rgba(var(--primary-color-rgb), 0.1); border-left: 3px solid var(--primary-color); }
        .entity-checkbox { margin-right: 12px; }
        .entity-info { flex: 1; }
        .entity-name { font-weight: 500; display: block; margin-bottom: 2px; }
        .entity-id { font-size: 0.8em; color: var(--secondary-text-color); font-family: monospace; }
        .entity-state { 
          font-size: 0.9em; padding: 4px 8px; background: var(--secondary-background-color);
          border-radius: 12px; min-width: 60px; text-align: center;
        }
        .entity-state.on { background: var(--success-color, #4caf50); color: white; }
        .entity-state.off { background: var(--error-color, #f44336); color: white; }
        
        .selected-entity { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--divider-color); }
        .remove-entity { background: none; border: none; color: var(--error-color); cursor: pointer; padding: 4px; border-radius: 4px; }
        .remove-entity:hover { background: var(--error-color); color: white; }
        
        .picker-footer { 
          padding: 16px; border-top: 1px solid var(--divider-color); 
          display: flex; justify-content: space-between; align-items: center;
        }
        .selection-info { display: flex; gap: 16px; color: var(--secondary-text-color); font-size: 0.9em; }
        .picker-actions { display: flex; gap: 8px; }
        
        button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
        button.secondary { background: var(--secondary-background-color); color: var(--secondary-text-color); }
        button:not(.secondary) { background: var(--primary-color); color: white; }
        
        .loading, .empty-state { padding: 40px; text-align: center; color: var(--disabled-text-color); }
      </style>
    `;
  }

  static _renderSelectedList(entities) {
    if (!entities || entities.length === 0) {
      return '<div class="empty-state">暂无选择的实体</div>';
    }
    
    return entities.map(entityId => `
      <div class="selected-entity" data-entity="${entityId}">
        <span class="entity-name">${entityId}</span>
        <button class="remove-entity" title="移除">×</button>
      </div>
    `).join('');
  }

  static _getEntityDisplayName(hass, entityId) {
    if (!hass) return entityId;
    const entity = hass.states[entityId];
    return entity?.attributes?.friendly_name || entityId;
  }

  static _bindPickerEvents(picker, overlay, hass, currentEntities, onSelect) {
    const selectedEntities = new Set(currentEntities || []);
    
    this._loadEntities(picker, overlay, hass, selectedEntities);

    const searchInput = picker.querySelector('#entity-search');
    searchInput.addEventListener('input', (e) => {
      this._filterEntities(picker, hass, e.target.value, picker.querySelector('#domain-filter').value);
    });

    const domainFilter = picker.querySelector('#domain-filter');
    domainFilter.addEventListener('change', () => {
      this._filterEntities(picker, hass, searchInput.value, domainFilter.value);
    });

    picker.querySelector('#picker-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    picker.querySelector('#picker-clear').addEventListener('click', () => {
      selectedEntities.clear();
      this._updateSelection(picker, hass, selectedEntities);
    });

    picker.querySelector('#picker-confirm').addEventListener('click', () => {
      onSelect(Array.from(selectedEntities));
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    this._updateSelectionCount(picker, selectedEntities.size);
  }

  static _loadEntities(picker, overlay, hass, selectedEntities) {
    if (!hass) {
      const entitiesList = picker.querySelector('#available-entities');
      entitiesList.innerHTML = '<div class="empty-state">无法访问Home Assistant实例</div>';
      return;
    }

    const entities = Object.keys(hass.states)
      .sort((a, b) => {
        const nameA = this._getEntityDisplayName(hass, a).toLowerCase();
        const nameB = this._getEntityDisplayName(hass, b).toLowerCase();
        return nameA.localeCompare(nameB);
      });

    this._renderEntitiesList(picker, hass, entities, selectedEntities);
    this._updateTotalCount(picker, entities.length);
  }

  static _renderEntitiesList(picker, hass, entities, selectedEntities) {
    const entitiesList = picker.querySelector('#available-entities');
    
    if (entities.length === 0) {
      entitiesList.innerHTML = '<div class="empty-state">未找到实体</div>';
      return;
    }

    entitiesList.innerHTML = entities.map(entityId => {
      const entity = hass.states[entityId];
      const isSelected = selectedEntities.has(entityId);
      const domain = entityId.split('.')[0];
      const displayName = this._getEntityDisplayName(hass, entityId);
      
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
        
        this._updateSelection(picker, hass, selectedEntities);
      });
    });
  }

  static _filterEntities(picker, hass, searchText, domainFilter) {
    const items = picker.querySelectorAll('.entity-item');
    const searchLower = searchText.toLowerCase();
    
    let visibleCount = 0;
    
    items.forEach(item => {
      const entityId = item.dataset.entity;
      const entityDomain = item.dataset.domain;
      const displayName = this._getEntityDisplayName(hass, entityId).toLowerCase();
      
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

  static _updateSelection(picker, hass, selectedEntities) {
    this._updateSelectionCount(picker, selectedEntities.size);
    
    const selectedList = picker.querySelector('#selected-entities-list');
    selectedList.innerHTML = this._renderSelectedList(Array.from(selectedEntities));
    
    selectedList.querySelectorAll('.remove-entity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const entityId = btn.closest('.selected-entity').dataset.entity;
        selectedEntities.delete(entityId);
        this._updateSelection(picker, hass, selectedEntities);
        
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

class Marketplace {
  static async getAvailablePlugins() {
    // 模拟插件数据
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
      }
    ];
  }

  static async installPlugin(pluginId) {
    console.log(`Installing plugin: ${pluginId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  static open() {
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
              <div class="loading">加载中...</div>
            </div>
          </div>
          
          <div class="tab-content" id="installed-tab">
            <div id="installed-plugins">
              <div class="empty-state">暂无已安装的插件</div>
            </div>
          </div>
          
          <div class="tab-content" id="updates-tab">
            <div id="updates-list">
              <div class="empty-state">暂无可用更新</div>
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
        .install-btn { margin-top: 8px; width: 100%; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
        .install-btn:not(.secondary) { background: var(--primary-color); color: white; }
        .install-btn.secondary { background: var(--secondary-background-color); color: var(--secondary-text-color); }
        .install-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .marketplace-footer { padding: 16px; border-top: 1px solid var(--divider-color); text-align: right; }
        button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
        button.secondary { background: var(--secondary-background-color); color: var(--secondary-text-color); }
        
        .loading, .empty-state { padding: 40px; text-align: center; color: var(--disabled-text-color); }
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
                data-plugin="${plugin.id}"
                ${plugin.installed ? 'disabled' : ''}>
          ${plugin.installed ? '已安装' : '安装'}
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.install-btn:not(.secondary)').forEach(btn => {
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
    });
  }

  static _bindMarketplaceEvents(modal, overlay) {
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        modal.querySelector(`#${btn.dataset.tab}-tab`).classList.add('active');
      });
    });

    modal.querySelector('#marketplace-close').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }
}

class ThemeSelector {
  static themes = {
    'default': {
      name: '默认主题',
      description: '使用 Home Assistant 默认主题',
      preview: '🎨',
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
      description: '适合暗色模式的深色主题',
      preview: '🌙',
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
      description: 'Google Material Design 风格',
      preview: '⚡',
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
      description: '简洁无边框设计',
      preview: '⊞',
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
    },
    'nature': {
      name: '自然风格',
      description: '绿色自然主题',
      preview: '🌿',
      variables: {
        '--cardforge-bg-color': '#f8fff8',
        '--cardforge-text-color': '#2e7d32',
        '--cardforge-primary-color': '#4caf50',
        '--cardforge-secondary-color': '#689f38',
        '--cardforge-header-bg': 'linear-gradient(135deg, #4caf50, #2e7d32)',
        '--cardforge-header-text': '#ffffff',
        '--cardforge-footer-bg': 'rgba(76, 175, 80, 0.1)',
        '--cardforge-border-radius': '16px',
        '--cardforge-shadow': '0 4px 12px rgba(76, 175, 80, 0.2)'
      }
    }
  };

  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name,
      description: this.themes[key].description,
      preview: this.themes[key].preview
    }));
  }

  static getTheme(themeName) {
    return this.themes[themeName] || this.themes['default'];
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
    
    let css = '.card {\\n';
    Object.keys(theme.variables).forEach(variable => {
      css += `  ${variable.replace('--cardforge-', '--')}: ${theme.variables[variable]};\\n`;
    });
    css += '}';
    
    style.textContent = css;
    root.appendChild(style);
  }

  static open(currentTheme, onThemeSelect) {
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
      z-index: 10003;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    modal.innerHTML = this._generateThemeSelectorHTML(currentTheme);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this._bindThemeSelectorEvents(modal, overlay, currentTheme, onThemeSelect);
  }

  static _generateThemeSelectorHTML(currentTheme) {
    const themes = this.getAllThemes();
    
    return `
      <div class="theme-selector">
        <div class="selector-header" style="padding: 20px; border-bottom: 1px solid var(--divider-color);">
          <h2 style="margin: 0 0 16px 0; color: var(--primary-color);">🎨 选择主题</h2>
          <p style="margin: 0; color: var(--secondary-text-color);">选择适合您仪表盘风格的主题</p>
        </div>
        
        <div class="themes-grid" style="flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
          ${themes.map(theme => `
            <div class="theme-card ${currentTheme === theme.id ? 'selected' : ''}" 
                 data-theme="${theme.id}"
                 style="border: 2px solid ${currentTheme === theme.id ? 'var(--primary-color)' : 'var(--divider-color)'}; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; background: var(--card-background-color);">
              <div class="theme-preview" style="font-size: 2.5em; text-align: center; margin-bottom: 12px;">${theme.preview}</div>
              <div class="theme-name" style="font-weight: bold; margin-bottom: 4px; text-align: center;">${theme.name}</div>
              <div class="theme-description" style="font-size: 0.8em; color: var(--secondary-text-color); text-align: center;">${theme.description}</div>
            </div>
          `).join('')}
        </div>

        <div class="selector-footer" style="padding: 16px; border-top: 1px solid var(--divider-color); text-align: right;">
          <button id="theme-cancel" class="secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: var(--secondary-background-color); color: var(--secondary-text-color); margin-right: 8px;">取消</button>
          <button id="theme-confirm" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: var(--primary-color); color: white;">确认选择</button>
        </div>
      </div>

      <style>
        .theme-card:hover {
          border-color: var(--primary-color) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .theme-card.selected {
          background: rgba(var(--primary-color-rgb), 0.05) !important;
        }
      </style>
    `;
  }

  static _bindThemeSelectorEvents(modal, overlay, currentTheme, onThemeSelect) {
    let selectedTheme = currentTheme || 'default';
    
    // 主题选择
    modal.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        modal.querySelectorAll('.theme-card').forEach(c => {
          c.style.borderColor = 'var(--divider-color)';
        });
        card.style.borderColor = 'var(--primary-color)';
        selectedTheme = card.dataset.theme;
      });
    });

    // 取消按钮
    modal.querySelector('#theme-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 确认选择
    modal.querySelector('#theme-confirm').addEventListener('click', () => {
      onThemeSelect(selectedTheme);
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

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    .editor-container {
      padding: 16px;
      max-width: 600px;
    }
    
    .form-section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    
    input[type="text"], input[type="number"], select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
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
    
    .entities-preview {
      margin-top: 8px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      font-size: 0.9em;
      border: 1px solid var(--divider-color);
    }
    
    .theme-preview {
      margin-top: 8px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    }
    
    .entity-tag {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: 4px 8px;
      margin: 2px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    
    .theme-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-color);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9em;
    }
    
    .button {
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      transition: opacity 0.2s;
    }
    
    .button:hover {
      opacity: 0.9;
    }
    
    .button.secondary {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
    }
    
    .button.full-width {
      width: 100%;
    }
    
    .empty-state {
      color: var(--disabled-text-color);
      text-align: center;
      padding: 20px;
      font-style: italic;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }
    
    .theme-option {
      padding: 12px;
      border: 2px solid var(--divider-color);
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    
    .theme-option:hover {
      border-color: var(--primary-color);
    }
    
    .theme-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--primary-color-rgb), 0.1);
    }
    
    .theme-preview-icon {
      font-size: 1.5em;
      margin-bottom: 4px;
    }
  `;

  setConfig(config) {
    this.config = config || this._getDefaultConfig();
  }

  _getDefaultConfig() {
    return {
      layout: {
        header: {
          title: '卡片工坊',
          icon: 'mdi:widgets',
          visible: true,
          show_edit_button: true
        },
        content: {
          entities: []
        },
        footer: {
          visible: true,
          show_timestamp: true,
          show_entity_count: true
        }
      },
      theme: 'default'
    };
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;

    const path = ev.target.dataset.path;
    const target = ev.target;
    let value;

    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = parseFloat(target.value) || 0;
    } else {
      value = target.value;
    }

    this._setNestedProperty(this.config, path, value);
    this._fireConfigChanged();
  }

  _setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => {
      if (!o[k]) o[k] = {};
      return o[k];
    }, obj);
    target[lastKey] = value;
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _pickEntities() {
    const currentEntities = this.config.layout?.content?.entities || [];
    EntityPicker.open(this.hass, currentEntities, (selectedEntities) => {
      this.config.layout.content.entities = selectedEntities;
      this._fireConfigChanged();
      this.requestUpdate();
    });
  }

  _openMarketplace() {
    Marketplace.open();
  }

  _openThemeSelector() {
    const currentTheme = this.config.theme || 'default';
    ThemeSelector.open(currentTheme, (selectedTheme) => {
      this.config.theme = selectedTheme;
      this._fireConfigChanged();
      this.requestUpdate();
    });
  }

  render() {
    if (!this.config) return html`<div>Loading...</div>`;

    const header = this.config.layout?.header || {};
    const content = this.config.layout?.content || {};
    const footer = this.config.layout?.footer || {};
    const currentTheme = this.config.theme || 'default';
    const currentThemeInfo = ThemeSelector.getTheme(currentTheme);

    return html`
      <div class="editor-container">
        <!-- 标题设置 -->
        <div class="form-section">
          <h3 class="section-title">🏷️ 标题设置</h3>
          
          <div class="form-group">
            <label>标题文本</label>
            <input 
              type="text" 
              .value=${header.title || ''}
              data-path="layout.header.title"
              @input=${this._valueChanged}
              placeholder="输入卡片标题"
            >
          </div>
          
          <div class="form-group">
            <label>图标</label>
            <input 
              type="text" 
              .value=${header.icon || ''}
              data-path="layout.header.icon"
              @input=${this._valueChanged}
              placeholder="mdi:home"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${header.visible !== false}
                  data-path="layout.header.visible"
                  @change=${this._valueChanged}
                >
                <label>显示标题栏</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${header.show_edit_button !== false}
                  data-path="layout.header.show_edit_button"
                  @change=${this._valueChanged}
                >
                <label>显示编辑按钮</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容设置 -->
        <div class="form-section">
          <h3 class="section-title">📊 内容设置</h3>
          
          <div class="form-group">
            <label>实体列表</label>
            <button class="button full-width secondary" @click=${this._pickEntities}>
              📋 选择实体
            </button>
            <div class="entities-preview">
              ${this._renderEntitiesPreview(content.entities)}
            </div>
          </div>

          <div class="action-buttons">
            <button class="button secondary" @click=${this._openMarketplace}>
              🛒 插件市场
            </button>
          </div>
        </div>

        <!-- 主题设置 -->
        <div class="form-section">
          <h3 class="section-title">🎨 主题设置</h3>
          
          <div class="form-group">
            <label>当前主题</label>
            <div class="theme-preview">
              <div class="theme-tag">
                <span>${currentThemeInfo.preview}</span>
                <span>${currentThemeInfo.name}</span>
              </div>
              <div style="margin-top: 8px; font-size: 0.9em; color: var(--secondary-text-color);">
                ${currentThemeInfo.description}
              </div>
            </div>
          </div>
          
          <button class="button full-width secondary" @click=${this._openThemeSelector}>
            选择主题
          </button>
        </div>

        <!-- 页脚设置 -->
        <div class="form-section">
          <h3 class="section-title">📄 页脚设置</h3>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.visible !== false}
                  data-path="layout.footer.visible"
                  @change=${this._valueChanged}
                >
                <label>显示页脚</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.show_timestamp || false}
                  data-path="layout.footer.show_timestamp"
                  @change=${this._valueChanged}
                >
                <label>显示时间戳</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.show_entity_count !== false}
                  data-path="layout.footer.show_entity_count"
                  @change=${this._valueChanged}
                >
                <label>显示实体数量</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="form-section">
          <h3 class="section-title">⚡ 高级设置</h3>
          
          <div class="form-group">
            <label>刷新间隔 (秒)</label>
            <input 
              type="number" 
              .value=${this.config.refresh_interval || 30}
              data-path="refresh_interval"
              @input=${this._valueChanged}
              min="5"
              max="3600"
            >
          </div>
        </div>
      </div>
    `;
  }

  _renderEntitiesPreview(entities) {
    if (!entities || entities.length === 0) {
      return html`<div class="empty-state">未选择实体</div>`;
    }

    return html`
      <div style="margin-bottom: 8px;">已选择 ${entities.length} 个实体：</div>
      <div>
        ${entities.slice(0, 5).map(entity => 
          html`<span class="entity-tag">${this._getEntityName(entity)}</span>`
        )}
        ${entities.length > 5 ? html`<span class="entity-tag">+${entities.length - 5}更多</span>` : ''}
      </div>
    `;
  }

  _getEntityName(entityId) {
    if (!this.hass) return entityId;
    const entity = this.hass.states[entityId];
    return entity?.attributes?.friendly_name || entityId;
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object, state: true }
  };

  static styles = css`
    .card {
      background: var(--card-background-color, white);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
      overflow: hidden;
      font-family: var(--ha-card-font-family, inherit);
      color: var(--primary-text-color);
    }

    .header {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--primary-color, #03a9f4);
      color: white;
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

    .action-btn {
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
      color: white;
    }

    .action-btn:hover {
      opacity: 1;
    }

    .content {
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

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(0,0,0,0.03);
      border-top: 1px solid var(--divider-color);
      font-size: 0.9em;
      color: var(--secondary-text-color);
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

  setConfig(config) {
    this._config = this._validateConfig(config);
      // 应用主题
    if (this._config.theme && window.ThemeSelector) {
      window.ThemeSelector.applyTheme(this, this._config.theme);
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
          entities: []
        },
        footer: { 
          visible: true, 
          show_timestamp: false,
          show_entity_count: true
        }
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

  render() {
    if (!this._config) {
      return html`<ha-card><div class="card">Loading...</div></ha-card>`;
    }

    const { header, content, footer } = this._config.layout;

    return html`
      <ha-card>
        <div class="card">
          ${header.visible ? this._renderHeader() : ''}
          <div class="content">
            ${this._renderContent()}
          </div>
          ${footer.visible ? this._renderFooter() : ''}
        </div>
      </ha-card>
    `;
  }

  _renderHeader() {
    const { title, icon, show_edit_button } = this._config.layout.header;
    
    return html`
      <div class="header">
        ${icon ? html`<ha-icon class="header-icon" .icon=${icon}></ha-icon>` : ''}
        <span class="header-title">${title}</span>
        <div class="header-actions">
          ${show_edit_button ? html`
            <ha-icon 
              class="action-btn" 
              .icon=${"mdi:cog"}
              title="编辑卡片"
              @click=${this._openEditor}
            ></ha-icon>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderContent() {
    const { entities } = this._config.layout.content;
    
    if (!entities || entities.length === 0) {
      return html`
        <div class="content-empty">
          <ha-icon .icon=${"mdi:plus-circle-outline"}></ha-icon>
          <p>点击配置内容区域</p>
          <button class="setup-btn" @click=${this._openEditor}>开始设置</button>
        </div>
      `;
    }

    return this._renderEntities(entities);
  }

  _renderEntities(entities) {
    const entityData = this._getEntityData(entities);
    
    return html`
      <div class="entities-list">
        ${entityData.map(entity => html`
          <div class="entity-item">
            <div class="entity-info">
              <span class="entity-name">${entity.name}</span>
              <span class="entity-domain">${entity.domain}</span>
            </div>
            <div class="entity-state">
              <span class="state-value">${entity.state}</span>
              ${entity.unit ? html`<span class="state-unit">${entity.unit}</span>` : ''}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _getEntityData(entityIds) {
    if (!this.hass || !this.hass.states) {
      return entityIds.map(entityId => ({
        id: entityId,
        name: entityId,
        domain: 'unknown',
        state: '未知',
        unit: ''
      }));
    }
    
    return entityIds.map(entityId => {
      const entity = this.hass.states[entityId];
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

  _renderFooter() {
    const { show_timestamp, show_entity_count } = this._config.layout.footer;
    const timestamp = show_timestamp ? new Date().toLocaleTimeString() : '';
    const entityCount = show_entity_count ? this._config.layout.content.entities.length : 0;
    
    return html`
      <div class="footer">
        <div class="footer-info">
          ${show_timestamp ? html`<span class="timestamp">${timestamp}</span>` : ''}
          ${show_entity_count ? html`<span class="entity-count">实体: ${entityCount}</span>` : ''}
        </div>
        <div class="footer-actions">
          <span class="powered-by">卡片工坊</span>
        </div>
      </div>
    `;
  }

  _openEditor() {
    // 由于现在使用 Home Assistant 内置的可视化编辑器，
    // 这个功能可以移除或者保留作为备用
    console.log('编辑功能已集成到 Home Assistant 可视化编辑器中');
  }

  // Home Assistant 标准接口 - 可视化编辑器支持
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      layout: {
        header: {
          title: "卡片工坊",
          icon: "mdi:widgets",
          visible: true,
          show_edit_button: true
        },
        content: {
          entities: []
        },
        footer: {
          visible: true,
          show_timestamp: true,
          show_entity_count: true
        }
      }
    };
  }

  getCardSize() {
    const entityCount = this._config?.layout?.content?.entities?.length || 0;
    return Math.max(2, 2 + Math.ceil(entityCount / 2));
  }
}

// 注册自定义元素
customElements.define('ha-cardforge-card', HaCardForgeCard);

// 注册到 Home Assistant 自定义卡片列表
if (window.customCards) {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '一个强大的自定义卡片，支持可视化编辑和实体数据绑定',
    preview: true,
    documentationURL: 'https://github.com/你的用户名/ha-cardforge'
  });
}

// 暴露全局API
window.EntityPicker = EntityPicker;
window.Marketplace = Marketplace;
window.ThemeSelector = ThemeSelector;

console.log('ha-cardforge-card 卡片工坊已加载！');
