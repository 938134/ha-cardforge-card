export class EntityPicker {
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
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
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
          <h3>选择实体</h3>
          <input type="text" id="entity-search" placeholder="搜索实体...">
        </div>
        
        <div class="picker-content" id="entity-list">
          <!-- 实体列表将通过JavaScript动态生成 -->
          <div style="padding: 20px; text-align: center; color: var(--disabled-text-color)">
            加载中...
          </div>
        </div>

        <div class="picker-footer">
          <div id="selected-count">已选择: 0</div>
          <div class="picker-actions">
            <button id="picker-cancel" class="secondary">取消</button>
            <button id="picker-confirm">确认选择</button>
          </div>
        </div>
      </div>

      <style>
        .entity-picker { display: flex; flex-direction: column; height: 100%; }
        .picker-header { padding: 16px; border-bottom: 1px solid var(--divider-color); }
        .picker-header h3 { margin: 0 0 12px 0; }
        #entity-search { width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; }
        .picker-content { flex: 1; overflow: auto; padding: 0; }
        .picker-footer { padding: 16px; border-top: 1px solid var(--divider-color); display: flex; justify-content: space-between; align-items: center; }
        .picker-actions { display: flex; gap: 8px; }
        
        .entity-item { 
          display: flex; align-items: center; padding: 12px 16px; 
          border-bottom: 1px solid var(--divider-color); cursor: pointer;
        }
        .entity-item:hover { background: var(--secondary-background-color); }
        .entity-item.selected { background: var(--primary-color); color: white; }
        .entity-checkbox { margin-right: 12px; }
        .entity-info { flex: 1; }
        .entity-name { font-weight: 500; display: block; }
        .entity-domain { font-size: 0.8em; opacity: 0.7; }
      </style>
    `;
  }

  static _bindPickerEvents(picker, overlay, currentEntities, onSelect) {
    const selectedEntities = new Set(currentEntities || []);
    
    // 加载实体列表
    this._loadEntities(picker, selectedEntities);

    // 搜索功能
    picker.querySelector('#entity-search').addEventListener('input', (e) => {
      this._filterEntities(picker, e.target.value);
    });

    // 取消按钮
    picker.querySelector('#picker-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 确认选择
    picker.querySelector('#picker-confirm').addEventListener('click', () => {
      onSelect(Array.from(selectedEntities));
      document.body.removeChild(overlay);
    });

    // 更新选择计数
    this._updateSelectionCount(picker, selectedEntities.size);
  }

  static _loadEntities(picker, selectedEntities) {
    if (!window.hass) {
      const entityList = picker.querySelector('#entity-list');
      entityList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--error-color)">无法访问Home Assistant实例</div>';
      return;
    }

    const entities = Object.keys(window.hass.states).sort();
    const entityList = picker.querySelector('#entity-list');
    
    entityList.innerHTML = entities.map(entityId => {
      const entity = window.hass.states[entityId];
      const isSelected = selectedEntities.has(entityId);
      
      return `
        <div class="entity-item ${isSelected ? 'selected' : ''}" data-entity="${entityId}">
          <input type="checkbox" class="entity-checkbox" ${isSelected ? 'checked' : ''}>
          <div class="entity-info">
            <span class="entity-name">${entity.attributes.friendly_name || entityId}</span>
            <span class="entity-domain">${entityId}</span>
          </div>
          <div class="entity-state">${entity.state}</div>
        </div>
      `;
    }).join('');

    // 绑定选择事件
    entityList.querySelectorAll('.entity-item').forEach(item => {
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
        
        this._updateSelectionCount(picker, selectedEntities.size);
      });
    });
  }

  static _filterEntities(picker, searchText) {
    const items = picker.querySelectorAll('.entity-item');
    const searchLower = searchText.toLowerCase();
    
    items.forEach(item => {
      const entityId = item.dataset.entity;
      const entityName = item.querySelector('.entity-name').textContent.toLowerCase();
      const isVisible = entityId.toLowerCase().includes(searchLower) || entityName.includes(searchLower);
      item.style.display = isVisible ? 'flex' : 'none';
    });
  }

  static _updateSelectionCount(picker, count) {
    picker.querySelector('#selected-count').textContent = `已选择: ${count}`;
  }
}
