export class Marketplace {
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
