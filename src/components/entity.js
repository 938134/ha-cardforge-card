// 实体选择器组件
export class EntityPicker {
  static open(hass, currentEntities, onSelect, options = {}) {
    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = options.title || '选择实体';
    dialog.style.cssText = `--mdc-dialog-min-width: 600px;`;

    const content = document.createElement('div');
    content.style.padding = '20px';
    
    // 搜索框
    const searchBox = document.createElement('ha-textfield');
    searchBox.label = '搜索实体...';
    searchBox.style.width = '100%';
    searchBox.style.marginBottom = '16px';
    searchBox.icon = 'mdi:magnify';
    
    // 实体选择器
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = hass;
    entityPicker.value = Array.isArray(currentEntities) ? currentEntities : [currentEntities].filter(Boolean);
    entityPicker.allowCustomEntity = options.allowCustomEntity !== false;
    entityPicker.multiple = options.multiple || false;
    entityPicker.style.width = '100%';
    
    // 过滤器选项
    if (options.filters) {
      if (options.filters.domain) {
        entityPicker.includeDomains = Array.isArray(options.filters.domain) ? options.filters.domain : [options.filters.domain];
      }
      if (options.filters.excludeDomains) {
        entityPicker.excludeDomains = Array.isArray(options.filters.excludeDomains) ? options.filters.excludeDomains : [options.filters.excludeDomains];
      }
      if (options.filters.entityCategory) {
        entityPicker.entityFilter = options.filters.entityFilter;
      }
    }

    // 实体状态预览
    const previewSection = document.createElement('div');
    previewSection.style.marginTop = '16px';
    previewSection.style.padding = '12px';
    previewSection.style.background = 'var(--card-background-color)';
    previewSection.style.borderRadius = '8px';
    previewSection.style.display = 'none';

    // 搜索功能
    searchBox.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (entityPicker._filterInput) {
        entityPicker._filterInput.value = searchTerm;
        entityPicker._filterInput.dispatchEvent(new Event('input'));
      }
    });

    // 实体选择变化
    entityPicker.addEventListener('value-changed', (e) => {
      this._updatePreview(hass, e.detail.value, previewSection, options.multiple);
    });

    content.appendChild(searchBox);
    content.appendChild(entityPicker);
    content.appendChild(previewSection);
    dialog.appendChild(content);

    // 操作按钮
    const secondaryAction = document.createElement('mwc-button');
    secondaryAction.slot = 'secondaryAction';
    secondaryAction.setAttribute('dialogAction', 'cancel');
    secondaryAction.textContent = '取消';
    dialog.appendChild(secondaryAction);

    const primaryAction = document.createElement('mwc-button');
    primaryAction.slot = 'primaryAction';
    primaryAction.setAttribute('dialogAction', 'ok');
    primaryAction.textContent = '确认';
    dialog.appendChild(primaryAction);

    document.body.appendChild(dialog);

    dialog.addEventListener('closed', (e) => {
      if (e.detail.action === 'ok') {
        const selectedValue = entityPicker.value;
        onSelect(options.multiple ? (selectedValue || []) : (selectedValue?.[0] || ''));
      }
      document.body.removeChild(dialog);
    });

    // 初始预览
    if (currentEntities) {
      this._updatePreview(hass, entityPicker.value, previewSection, options.multiple);
    }
  }

  static _updatePreview(hass, entityIds, previewSection, isMultiple) {
    if (!entityIds || (isMultiple && entityIds.length === 0) || (!isMultiple && !entityIds)) {
      previewSection.style.display = 'none';
      return;
    }

    const entities = isMultiple ? entityIds : [entityIds];
    const validEntities = entities.filter(id => hass.states[id]);
    
    if (validEntities.length === 0) {
      previewSection.style.display = 'none';
      return;
    }

    previewSection.innerHTML = '';
    previewSection.style.display = 'block';

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.textContent = `已选择 ${validEntities.length} 个实体`;
    previewSection.appendChild(title);

    validEntities.forEach(entityId => {
      const entity = hass.states[entityId];
      const entityDiv = document.createElement('div');
      entityDiv.style.display = 'flex';
      entityDiv.style.justifyContent = 'space-between';
      entityDiv.style.alignItems = 'center';
      entityDiv.style.padding = '8px';
      entityDiv.style.marginBottom = '4px';
      entityDiv.style.background = 'var(--secondary-background-color)';
      entityDiv.style.borderRadius = '4px';

      const infoDiv = document.createElement('div');
      infoDiv.style.flex = '1';
      
      const nameSpan = document.createElement('div');
      nameSpan.style.fontWeight = '500';
      nameSpan.textContent = entity.attributes.friendly_name || entityId;
      
      const idSpan = document.createElement('div');
      idSpan.style.fontSize = '0.8em';
      idSpan.style.color = 'var(--secondary-text-color)';
      idSpan.textContent = entityId;

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(idSpan);

      const stateDiv = document.createElement('div');
      stateDiv.style.textAlign = 'right';
      
      const stateSpan = document.createElement('div');
      stateSpan.style.fontWeight = '500';
      stateSpan.textContent = entity.state;
      
      const unitSpan = document.createElement('div');
      unitSpan.style.fontSize = '0.8em';
      unitSpan.style.color = 'var(--secondary-text-color)';
      unitSpan.textContent = entity.attributes.unit_of_measurement || '';

      stateDiv.appendChild(stateSpan);
      stateDiv.appendChild(unitSpan);

      entityDiv.appendChild(infoDiv);
      entityDiv.appendChild(stateDiv);
      previewSection.appendChild(entityDiv);
    });
  }

  // 批量实体选择
  static openBulkPicker(hass, currentConfig, onUpdate, cardType) {
    const cardConfig = window.CardRegistry.getCardConfig(cardType);
    if (!cardConfig?.entityInterfaces) return;

    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = `配置 ${cardConfig.name} 实体`;
    dialog.style.cssText = `--mdc-dialog-min-width: 700px;`;

    const content = document.createElement('div');
    content.style.padding = '20px';

    // 为每个实体接口创建选择器
    const entityConfigs = [];
    
    [...(cardConfig.entityInterfaces.required || []), ...(cardConfig.entityInterfaces.optional || [])].forEach(entityInterface => {
      const section = document.createElement('div');
      section.style.marginBottom = '20px';
      
      const label = document.createElement('div');
      label.style.fontWeight = '500';
      label.style.marginBottom = '8px';
      label.textContent = `${entityInterface.description} ${entityInterface.required ? '(必需)' : '(可选)'}`;
      
      const picker = document.createElement('ha-entity-picker');
      picker.hass = hass;
      picker.value = currentConfig.entities?.[entityInterface.key] || '';
      picker.style.width = '100%';
      
      if (entityInterface.filters) {
        if (entityInterface.filters.domain) {
          picker.includeDomains = Array.isArray(entityInterface.filters.domain) ? entityInterface.filters.domain : [entityInterface.filters.domain];
        }
      }

      section.appendChild(label);
      section.appendChild(picker);
      content.appendChild(section);

      entityConfigs.push({
        key: entityInterface.key,
        picker: picker,
        required: entityInterface.required
      });
    });

    dialog.appendChild(content);

    const secondaryAction = document.createElement('mwc-button');
    secondaryAction.slot = 'secondaryAction';
    secondaryAction.setAttribute('dialogAction', 'cancel');
    secondaryAction.textContent = '取消';
    dialog.appendChild(secondaryAction);

    const primaryAction = document.createElement('mwc-button');
    primaryAction.slot = 'primaryAction';
    primaryAction.setAttribute('dialogAction', 'ok');
    primaryAction.textContent = '确认';
    dialog.appendChild(primaryAction);

    document.body.appendChild(dialog);

    dialog.addEventListener('closed', (e) => {
      if (e.detail.action === 'ok') {
        const entities = {};
        let hasErrors = false;

        entityConfigs.forEach(config => {
          const value = config.picker.value;
          if (config.required && !value) {
            hasErrors = true;
            config.picker.style.border = '1px solid var(--error-color)';
          } else {
            entities[config.key] = value;
          }
        });

        if (!hasErrors) {
          onUpdate(entities);
        }
      }
      document.body.removeChild(dialog);
    });
  }

  // 快速实体推荐
  static getRecommendedEntities(hass, domain, count = 5) {
    const entities = Object.values(hass.states);
    return entities
      .filter(entity => entity.entity_id.startsWith(`${domain}.`))
      .sort((a, b) => {
        // 优先显示有友好名称的实体
        const aHasName = !!a.attributes.friendly_name;
        const bHasName = !!b.attributes.friendly_name;
        if (aHasName && !bHasName) return -1;
        if (!aHasName && bHasName) return 1;
        return 0;
      })
      .slice(0, count)
      .map(entity => entity.entity_id);
  }

  // 验证实体是否存在
  static validateEntities(hass, entityIds) {
    const invalidEntities = [];
    const validEntities = {};

    (Array.isArray(entityIds) ? entityIds : [entityIds]).forEach(entityId => {
      if (hass.states[entityId]) {
        validEntities[entityId] = hass.states[entityId];
      } else {
        invalidEntities.push(entityId);
      }
    });

    return {
      valid: validEntities,
      invalid: invalidEntities,
      isValid: invalidEntities.length === 0
    };
  }
}

window.EntityPicker = EntityPicker;