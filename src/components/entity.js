export class EntityPicker {
  static open(hass, currentEntities, onSelect, options = {}) {
    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = options.title || '选择实体';
    dialog.style.cssText = `--mdc-dialog-min-width: 600px;`;

    const content = document.createElement('div');
    content.style.padding = '20px';
    
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = hass;
    entityPicker.value = Array.isArray(currentEntities) ? currentEntities : [currentEntities].filter(Boolean);
    entityPicker.allowCustomEntity = options.allowCustomEntity !== false;
    entityPicker.multiple = options.multiple || false;
    entityPicker.style.width = '100%';

    if (options.filters) {
      if (options.filters.domain) {
        entityPicker.includeDomains = Array.isArray(options.filters.domain) ? options.filters.domain : [options.filters.domain];
      }
    }

    content.appendChild(entityPicker);
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
        const selectedValue = entityPicker.value;
        onSelect(options.multiple ? (selectedValue || []) : (selectedValue?.[0] || ''));
      }
      document.body.removeChild(dialog);
    });
  }
}

window.EntityPicker = EntityPicker;