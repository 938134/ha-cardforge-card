// 实体选择器组件
export class EntityPicker {
  static open(hass, currentEntities, onSelect) {
    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = '选择实体';
    dialog.style.cssText = `--mdc-dialog-min-width: 600px;`;

    const content = document.createElement('div');
    content.style.padding = '20px';
    
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = hass;
    entityPicker.value = currentEntities;
    entityPicker.allowCustomEntity = true;
    entityPicker.multiple = true;
    entityPicker.style.width = '100%';
    
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
        onSelect(entityPicker.value || []);
      }
      document.body.removeChild(dialog);
    });
  }
}

window.EntityPicker = EntityPicker;