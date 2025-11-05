export class CardForgeEditor {
  static open(currentConfig, onSave) {
    // 创建编辑器遮罩层
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

    // 编辑器容器
    const editor = document.createElement('div');
    editor.style.cssText = `
      background: var(--card-background-color, white);
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: auto;
      padding: 20px;
    `;

    editor.innerHTML = this._generateEditorHTML(currentConfig);
    overlay.appendChild(editor);
    document.body.appendChild(overlay);

    // 绑定事件
    this._bindEvents(editor, overlay, currentConfig, onSave);
  }

  static _generateEditorHTML(config) {
    return `
      <div class="cardforge-editor">
        <h2>📝 编辑卡片</h2>
        
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
          <div class="form-group">
            <label>
              <input type="checkbox" id="header-visible" ${config.layout.header.visible ? 'checked' : ''}>
              显示标题栏
            </label>
          </div>
        </div>

        <div class="editor-section">
          <h3>🎨 内容设置</h3>
          <div class="form-group">
            <label>内容类型</label>
            <select id="content-type">
              <option value="">-- 选择类型 --</option>
              <option value="simple-entities">实体列表</option>
              <option value="weather">天气信息</option>
              <option value="device-status">设备状态</option>
            </select>
          </div>
          <div class="form-group">
            <button type="button" id="pick-entities" class="secondary">
              📋 选择实体
            </button>
            <div id="selected-entities">
              ${this._renderSelectedEntities(config.layout.content.entities)}
            </div>
          </div>
        </div>

        <div class="editor-section">
          <h3>📊 页脚设置</h3>
          <div class="form-group">
            <label>
              <input type="checkbox" id="footer-visible" ${config.layout.footer.visible ? 'checked' : ''}>
              显示页脚
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="show-timestamp" ${config.layout.footer.show_timestamp ? 'checked' : ''}>
              显示时间戳
            </label>
          </div>
        </div>

        <div class="editor-actions">
          <button type="button" id="editor-cancel" class="secondary">取消</button>
          <button type="button" id="editor-preview">预览</button>
          <button type="button" id="editor-save">保存</button>
        </div>
      </div>

      <style>
        .cardforge-editor h2 { margin-top: 0; }
        .editor-section { margin: 20px 0; padding-bottom: 20px; border-bottom: 1px solid var(--divider-color); }
        .editor-section h3 { margin-bottom: 12px; color: var(--primary-color); }
        .form-group { margin: 12px 0; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
        .form-group input[type="text"], .form-group select { 
          width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; 
        }
        .editor-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
        button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
        button.secondary { background: var(--secondary-background-color); }
        #selected-entities { margin-top: 8px; }
        .entity-tag { 
          display: inline-block; background: var(--primary-color); color: white; 
          padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 0.8em;
        }
      </style>
    `;
  }

  static _renderSelectedEntities(entities) {
    if (!entities || entities.length === 0) {
      return '<span style="color: var(--disabled-text-color)">未选择实体</span>';
    }
    return entities.map(entity => 
      `<span class="entity-tag">${entity}</span>`
    ).join('');
  }

  static _bindEvents(editor, overlay, currentConfig, onSave) {
    // 取消按钮
    editor.querySelector('#editor-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 选择实体按钮
    editor.querySelector('#pick-entities').addEventListener('click', () => {
      if (window.EntityPicker) {
        window.EntityPicker.open(currentConfig.layout.content.entities || [], (selectedEntities) => {
          const entitiesDiv = editor.querySelector('#selected-entities');
          entitiesDiv.innerHTML = this._renderSelectedEntities(selectedEntities);
          currentConfig.layout.content.entities = selectedEntities;
        });
      }
    });

    // 保存按钮
    editor.querySelector('#editor-save').addEventListener('click', () => {
      // 收集表单数据
      currentConfig.layout.header.title = editor.querySelector('#header-title').value;
      currentConfig.layout.header.icon = editor.querySelector('#header-icon').value;
      currentConfig.layout.header.visible = editor.querySelector('#header-visible').checked;
      currentConfig.layout.footer.visible = editor.querySelector('#footer-visible').checked;
      currentConfig.layout.footer.show_timestamp = editor.querySelector('#show-timestamp').checked;
      
      onSave(currentConfig);
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
