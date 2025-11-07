export class EntityPicker {
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
