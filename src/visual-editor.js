export class HACardForgeEditor {
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
