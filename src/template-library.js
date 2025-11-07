// button-card 模板库
export class TemplateLibrary {
  static templates = {
    // 基础信息卡片
    'info-basic': {
      id: 'info-basic',
      name: '基础信息卡片',
      description: '显示实体基本状态和信息',
      category: 'basic',
      preview: '📄',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_icon: true,
        show_state: true,
        styles: {
          card: [
            "padding: 16px",
            "background: var(--card-background-color)",
            "border-radius: 12px",
            "box-shadow: var(--ha-card-box-shadow)"
          ]
        }
      }
    },

    // 开关控制卡片
    'switch-control': {
      id: 'switch-control',
      name: '开关控制卡片',
      description: '灯光、开关等设备的控制卡片',
      category: 'control',
      preview: '💡',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_icon: true,
        show_state: true,
        tap_action: {
          action: 'toggle'
        },
        state: [
          {
            value: 'on',
            styles: {
              card: ["background: var(--state-light-on-color)"]
            }
          },
          {
            value: 'off',
            styles: {
              card: ["background: var(--card-background-color)"]
            }
          }
        ]
      }
    },

    // 传感器数值卡片
    'sensor-value': {
      id: 'sensor-value',
      name: '传感器数值卡片',
      description: '突出显示传感器数值',
      category: 'sensors',
      preview: '📊',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_state: true,
        show_icon: false,
        styles: {
          card: [
            "padding: 20px",
            "background: linear-gradient(135deg, var(--primary-color), var(--accent-color))",
            "color: white",
            "text-align: center",
            "border-radius: 12px"
          ],
          name: [
            "font-size: 0.9em",
            "opacity: 0.8"
          ],
          state: [
            "font-size: 1.5em",
            "font-weight: bold"
          ]
        }
      }
    },

    // 媒体控制卡片
    'media-control': {
      id: 'media-control',
      name: '媒体控制卡片',
      description: '媒体播放器控制',
      category: 'media',
      preview: '🎵',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_icon: true,
        show_state: true,
        tap_action: {
          action: 'call-service',
          service: 'media_player.media_play_pause'
        },
        state: [
          {
            value: 'playing',
            icon: 'mdi:pause',
            styles: {
              card: ["background: var(--state-media-player-playing-color)"]
            }
          },
          {
            value: 'paused',
            icon: 'mdi:play',
            styles: {
              card: ["background: var(--card-background-color)"]
            }
          }
        ]
      }
    },

    // 天气信息卡片
    'weather-info': {
      id: 'weather-info',
      name: '天气信息卡片',
      description: '显示天气状况和温度',
      category: 'weather',
      preview: '🌤️',
      config: {
        type: 'button-card',
        entity: '',
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
    },

    // 设备状态卡片
    'device-status': {
      id: 'device-status',
      name: '设备状态卡片',
      description: '显示设备在线状态',
      category: 'device',
      preview: '📱',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_icon: true,
        show_state: true,
        state: [
          {
            value: 'on',
            icon: 'mdi:check-circle',
            styles: {
              card: ["background: var(--state-binary_sensor-on-color)"]
            }
          },
          {
            value: 'off',
            icon: 'mdi:close-circle',
            styles: {
              card: ["background: var(--state-binary_sensor-off-color)"]
            }
          }
        ]
      }
    },

    // 温度计卡片
    'temperature-gauge': {
      id: 'temperature-gauge',
      name: '温度计卡片',
      description: '温度传感器专用显示',
      category: 'sensors',
      preview: '🌡️',
      config: {
        type: 'button-card',
        entity: '',
        show_name: true,
        show_icon: true,
        show_state: true,
        icon: 'mdi:thermometer',
        state: "[[[ return `${states[entity].state}°C` ]]]",
        styles: {
          card: [
            "padding: 16px",
            "background: linear-gradient(135deg, #ff7675, #d63031)",
            "color: white",
            "border-radius: 12px"
          ]
        }
      }
    }
  };

  static categories = {
    'basic': { name: '基础卡片', icon: 'mdi:card' },
    'control': { name: '控制卡片', icon: 'mdi:toggle-switch' },
    'sensors': { name: '传感器', icon: 'mdi:chart-box' },
    'media': { name: '媒体', icon: 'mdi:music-box' },
    'weather': { name: '天气', icon: 'mdi:weather-cloudy' },
    'device': { name: '设备状态', icon: 'mdi:cellphone' }
  };

  static open(currentConfig, onApply) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--card-background-color);
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    modal.innerHTML = this._generateModalHTML();
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this._bindModalEvents(modal, overlay, currentConfig, onApply);
  }

  static _generateModalHTML() {
    const categories = Object.keys(this.categories);
    
    return `
      <div class="template-library">
        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid var(--divider-color);">
          <h2 style="margin: 0; color: var(--primary-color);">📚 模板库</h2>
          <p style="margin: 8px 0 0 0; color: var(--secondary-text-color);">选择预定义的 button-card 模板</p>
        </div>

        <div class="modal-content" style="flex: 1; overflow-y: auto; padding: 20px;">
          <div class="categories" style="margin-bottom: 20px;">
            ${categories.map(catId => `
              <ha-chip 
                class="category-filter" 
                data-category="${catId}"
                style="margin: 4px;"
              >
                <ha-icon slot="icon" icon="${this.categories[catId].icon}"></ha-icon>
                ${this.categories[catId].name}
              </ha-chip>
            `).join('')}
          </div>

          <div class="templates-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
            ${Object.values(this.templates).map(template => `
              <ha-card 
                class="template-card" 
                data-template="${template.id}"
                data-category="${template.category}"
                style="cursor: pointer; transition: all 0.2s;"
              >
                <div class="card-content" style="padding: 16px;">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 1.5em; margin-right: 12px;">${template.preview}</span>
                    <div>
                      <div style="font-weight: bold;">${template.name}</div>
                      <div style="font-size: 0.8em; color: var(--secondary-text-color);">${template.description}</div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <ha-chip label="${this.categories[template.category].name}"></ha-chip>
                    <mwc-button dense label="应用"></mwc-button>
                  </div>
                </div>
              </ha-card>
            `).join('')}
          </div>
        </div>

        <div class="modal-footer" style="padding: 16px; border-top: 1px solid var(--divider-color); text-align: right;">
          <mwc-button id="template-cancel" label="取消"></mwc-button>
        </div>
      </div>

      <style>
        .template-card:hover {
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }
        .category-filter[active] {
          background: var(--primary-color);
          color: white;
        }
      </style>
    `;
  }

  static _bindModalEvents(modal, overlay, currentConfig, onApply) {
    let selectedCategory = 'all';

    // 分类过滤
    modal.querySelectorAll('.category-filter').forEach(chip => {
      chip.addEventListener('click', () => {
        modal.querySelectorAll('.category-filter').forEach(c => c.removeAttribute('active'));
        chip.setAttribute('active', '');
        selectedCategory = chip.dataset.category;
        this._filterTemplates(modal, selectedCategory);
      });
    });

    // 模板选择
    modal.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'MWC-BUTTON') return;
        
        const templateId = card.dataset.template;
        const template = this.templates[templateId];
        
        // 应用模板配置
        const newConfig = {
          ...currentConfig,
          ...template.config,
          entity: currentConfig.entity || '' // 保持原有实体
        };
        
        onApply(newConfig);
        document.body.removeChild(overlay);
      });

      // 应用按钮
      card.querySelector('mwc-button').addEventListener('click', (e) => {
        e.stopPropagation();
        const templateId = card.dataset.template;
        const template = this.templates[templateId];
        
        const newConfig = {
          ...currentConfig,
          ...template.config,
          entity: currentConfig.entity || ''
        };
        
        onApply(newConfig);
        document.body.removeChild(overlay);
      });
    });

    // 取消按钮
    modal.querySelector('#template-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  static _filterTemplates(modal, category) {
    modal.querySelectorAll('.template-card').forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // 根据实体推荐模板
  static getTemplatesForEntity(entityId, hass) {
    const entity = hass.states[entityId];
    if (!entity) return [];

    const domain = entityId.split('.')[0];
    const domainTemplates = {
      'light': ['switch-control', 'device-status'],
      'switch': ['switch-control', 'device-status'],
      'sensor': ['sensor-value', 'info-basic', 'temperature-gauge'],
      'binary_sensor': ['device-status', 'info-basic'],
      'media_player': ['media-control', 'info-basic'],
      'weather': ['weather-info', 'info-basic'],
      'climate': ['info-basic', 'sensor-value']
    };

    return (domainTemplates[domain] || ['info-basic']).map(templateId => this.templates[templateId]);
  }
}

window.TemplateLibrary = TemplateLibrary;
