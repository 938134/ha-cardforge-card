// 实体选择器
export class EntityPicker {
  static open(hass, currentEntities, onSelect) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10002;
    `;

    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = '选择实体';
    dialog.style.cssText = `--mdc-dialog-min-width: 600px;`;

    dialog.innerHTML = `
      <ha-entity-picker
        .hass=${hass}
        .value=${currentEntities}
        allow-custom-entity
        multiple
        style="width: 100%; margin: 20px 0;"
      ></ha-entity-picker>
      
      <mwc-button slot="secondaryAction" dialogAction="cancel">取消</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="ok">确认</mwc-button>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.addEventListener('closed', (e) => {
      if (e.detail.action === 'ok') {
        const picker = dialog.querySelector('ha-entity-picker');
        onSelect(picker.value || []);
      }
      document.body.removeChild(overlay);
    });
  }
}

window.EntityPicker = EntityPicker;
