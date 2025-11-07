// 模板库组件
export class TemplateLibrary {
  static templates = {
    'info-basic': {
      id: 'info-basic',
      name: '基础信息卡片',
      description: '显示实体基本状态和信息',
      category: 'basic',
      config: {
        layout: {
          header: { title: '信息卡片', icon: 'mdi:information', visible: true },
          content: { entities: [] },
          footer: { visible: true, show_timestamp: true }
        }
      }
    },
    'sensor-grid': {
      id: 'sensor-grid',
      name: '传感器网格',
      description: '网格布局显示传感器数据',
      category: 'sensors',
      config: {
        layout: {
          header: { title: '传感器数据', icon: 'mdi:chart-box', visible: true },
          content: { entities: [] },
          footer: { visible: false }
        }
      }
    },
    'weather-display': {
      id: 'weather-display',
      name: '天气显示',
      description: '专用天气信息显示',
      category: 'weather',
      config: {
        type: 'button',
        entity: '',
        button_config: {
          show_name: true,
          show_icon: true,
          show_state: true,
          icon: "[[[ return states[entity].attributes.icon || 'mdi:weather-cloudy' ]]]",
          name: "[[[ return states[entity].attributes.friendly_name || '天气' ]]]",
          state: "[[[ return `${states[entity].attributes.temperature}°C` ]]]",
          styles: {
            card: [
              "padding: 16px",
              "background: linear-gradient(135deg, #74b9ff, #0984e3)",
              "color: white",
              "border-radius: 12px"
            ]
          }
        }
      }
    }
  };

  static open(currentConfig, onApply) {
    const dialog = document.createElement('ha-dialog');
    dialog.open = true;
    dialog.heading = '选择模板';
    dialog.style.cssText = `--mdc-dialog-min-width: 500px;`;

    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.display = 'grid';
    content.style.gap = '12px';

    Object.values(this.templates).forEach(template => {
      const card = document.createElement('ha-card');
      card.style.cursor = 'pointer';
      card.style.padding = '16px';
      
      card.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">${template.name}</div>
        <div style="color: var(--secondary-text-color); font-size: 0.9em; margin-bottom: 8px;">
          ${template.description}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <ha-chip label="${template.category}"></ha-chip>
          <mwc-button dense label="应用"></mwc-button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'MWC-BUTTON') return;
        this._applyTemplate(template, currentConfig, onApply, dialog);
      });

      card.querySelector('mwc-button').addEventListener('click', (e) => {
        e.stopPropagation();
        this._applyTemplate(template, currentConfig, onApply, dialog);
      });

      content.appendChild(card);
    });

    dialog.appendChild(content);

    const secondaryAction = document.createElement('mwc-button');
    secondaryAction.slot = 'secondaryAction';
    secondaryAction.setAttribute('dialogAction', 'cancel');
    secondaryAction.textContent = '取消';
    dialog.appendChild(secondaryAction);

    document.body.appendChild(dialog);

    dialog.addEventListener('closed', () => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    });
  }

  static _applyTemplate(template, currentConfig, onApply, dialog) {
    const newConfig = { ...currentConfig, ...template.config };
    onApply(newConfig);
    document.body.removeChild(dialog);
  }

  // 根据实体推荐模板
  static getTemplatesForEntity(entityId, hass) {
    const entity = hass.states[entityId];
    if (!entity) return [];

    const domain = entityId.split('.')[0];
    const domainTemplates = {
      'light': ['info-basic'],
      'switch': ['info-basic'],
      'sensor': ['sensor-grid', 'info-basic'],
      'binary_sensor': ['info-basic'],
      'weather': ['weather-display', 'info-basic']
    };

    return (domainTemplates[domain] || ['info-basic'])
      .map(templateId => this.templates[templateId])
      .filter(Boolean);
  }
}

window.TemplateLibrary = TemplateLibrary;