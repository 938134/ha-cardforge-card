// src/cards/button-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class ButtonCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _state: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }
    
    .button-card {
      padding: 16px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid var(--divider-color);
      text-align: center;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .button-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .button-card:active {
      transform: translateY(0);
    }
    
    .button-icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--primary-color);
    }
    
    .button-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .button-state {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    
    /* 状态颜色 */
    .state-on {
      background: rgba(76, 175, 80, 0.1);
      border-color: rgba(76, 175, 80, 0.3);
    }
    
    .state-off {
      background: rgba(244, 67, 54, 0.1);
      border-color: rgba(244, 67, 54, 0.3);
    }
    
    .state-home {
      background: rgba(33, 150, 243, 0.1);
      border-color: rgba(33, 150, 243, 0.3);
    }
    
    .state-not_home {
      background: rgba(255, 152, 0, 0.1);
      border-color: rgba(255, 152, 0, 0.3);
    }
  `;

  constructor() {
    super();
    this._state = '';
  }

  setConfig(config) {
    this.config = this._validateConfig(config);
  }

  _validateConfig(config) {
    const defaults = {
      entity: '',
      name: '',
      icon: '',
      show_name: true,
      show_icon: true,
      show_state: true,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      styles: {}
    };
    
    return { ...defaults, ...config };
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.config.entity) {
      this._updateState();
    }
  }

  _updateState() {
    if (!this.hass || !this.config.entity) return;
    
    const entity = this.hass.states[this.config.entity];
    this._state = entity ? entity.state : 'unknown';
  }

  _handleTap() {
    this._handleAction(this.config.tap_action);
  }

  _handleHold() {
    this._handleAction(this.config.hold_action);
  }

  _handleAction(action) {
    if (!action || !this.hass) return;

    switch (action.action) {
      case 'more-info':
        this._fireEvent('hass-more-info', { entityId: this.config.entity });
        break;
      case 'toggle':
        this._callService('homeassistant/toggle', this.config.entity);
        break;
      case 'call-service':
        this._callService(action.service, action.entity_id || this.config.entity, action.data);
        break;
      case 'navigate':
        this._fireEvent('location-changed', { replace: false, navigation_path: action.navigation_path });
        break;
      default:
        console.warn('未知动作:', action.action);
    }
  }

  _fireEvent(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail
    }));
  }

  _callService(service, entityId, data = {}) {
    const [domain, serviceName] = service.split('.');
    this.hass.callService(domain, serviceName, {
      entity_id: entityId,
      ...data
    });
  }

  _getStateClass() {
    if (!this._state) return '';
    
    const stateClassMap = {
      'on': 'state-on',
      'off': 'state-off',
      'home': 'state-home',
      'not_home': 'state-not_home',
      'unavailable': 'state-unavailable'
    };
    
    return stateClassMap[this._state] || '';
  }

  _renderIcon() {
    if (!this.config.show_icon) return '';
    
    let icon = this.config.icon;
    
    // 动态图标
    if (icon && icon.includes('[[[')) {
      try {
        const entity = this.hass.states[this.config.entity];
        if (entity) {
          // 简单的模板解析
          icon = icon.replace(/\[\[\[(.*?)\]\]\]/g, (match, code) => {
            try {
              return eval(code);
            } catch (e) {
              console.error('图标模板解析错误:', e);
              return 'mdi:alert';
            }
          });
        }
      } catch (e) {
        console.error('动态图标处理错误:', e);
      }
    }
    
    return html`<ha-icon class="button-icon" .icon=${icon || 'mdi:button'}></ha-icon>`;
  }

  _renderName() {
    if (!this.config.show_name) return '';
    
    let name = this.config.name;
    
    // 动态名称
    if (!name && this.config.entity) {
      const entity = this.hass.states[this.config.entity];
      name = entity?.attributes.friendly_name || this.config.entity;
    }
    
    return html`<div class="button-name">${name}</div>`;
  }

  _renderState() {
    if (!this.config.show_state || !this.config.entity) return '';
    
    const entity = this.hass.states[this.config.entity];
    if (!entity) return html`<div class="button-state">未知</div>`;
    
    let state = entity.state;
    
    // 状态格式化
    if (entity.attributes.unit_of_measurement) {
      state = `${state} ${entity.attributes.unit_of_measurement}`;
    }
    
    return html`<div class="button-state">${state}</div>`;
  }

  render() {
    if (!this.config) {
      return html`<ha-card>配置错误</ha-card>`;
    }

    return html`
      <ha-card>
        <div 
          class="button-card ${this._getStateClass()}"
          @click=${this._handleTap}
          @contextmenu=${(e) => {
            e.preventDefault();
            this._handleHold();
          }}
        >
          ${this._renderIcon()}
          ${this._renderName()}
          ${this._renderState()}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('button-card', ButtonCard);