export class CardMarketplace {
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
    // 这里可以配置远程插件仓库URL
    const repoUrl = 'https://api.github.com/repos/你的用户名/ha-cardforge-plugins/contents/plugins';
    
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
