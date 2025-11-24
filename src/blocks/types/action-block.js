// src/blocks/types/action-block.js
import { BaseBlock } from '../base-block.js';

class ActionBlock extends BaseBlock {
  static blockType = 'action';
  static blockName = '操作';
  static blockIcon = 'mdi:gesture-tap-button';
  static category = 'actions';
  static description = '执行操作和自动化';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    
    if (!config.service && !config.navigation) {
      return this._renderEmpty('请配置操作');
    }

    return this._renderContainer(`
      ${this._renderHeader(config.title)}
      <div class="action-content">
        <button class="action-button" onclick="${this._getActionHandler(config)}">
          <ha-icon icon="${config.icon || 'mdi:gesture-tap'}"></ha-icon>
          <span>${config.buttonText || '执行'}</span>
        </button>
        ${config.description ? `<div class="action-description">${this._escapeHtml(config.description)}</div>` : ''}
      </div>
    `, 'action-block');
  }

  getStyles(block) {
    return `
      .action-block .action-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        text-align: center;
      }

      .action-button {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 600;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        min-width: 120px;
        justify-content: center;
      }

      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }

      .action-button:active {
        transform: translateY(0);
      }

      .action-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
        max-width: 200px;
      }

      .action-button.secondary {
        background: var(--cf-surface);
        color: var(--cf-primary-color);
        border: 1px solid var(--cf-border);
      }

      .action-button.warning {
        background: var(--cf-warning-color);
      }

      .action-button.danger {
        background: var(--cf-error-color);
      }

      @container (max-width: 300px) {
        .action-button {
          padding: var(--cf-spacing-sm) var(--cf-spacing-md);
          min-width: 100px;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const services = this._getAvailableServices(hass);

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">按钮文本</label>
          <ha-textfield
            .value="${config.buttonText || ''}"
            @input="${e => onConfigChange('buttonText', e.target.value)}"
            placeholder="执行"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">描述</label>
          <ha-textfield
            .value="${config.description || ''}"
            @input="${e => onConfigChange('description', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">图标</label>
          <ha-icon-picker
            .value="${config.icon || ''}"
            @value-changed="${e => onConfigChange('icon', e.detail.value)}"
            fullwidth
          ></ha-icon-picker>
        </div>

        <div class="form-field">
          <label class="form-label">操作类型</label>
          <ha-select
            .value="${config.actionType || 'service'}"
            @closed="${e => e.stopPropagation()}"
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="service" @click="${() => onConfigChange('actionType', 'service')}">服务调用</ha-list-item>
            <ha-list-item value="navigation" @click="${() => onConfigChange('actionType', 'navigation')}">页面导航</ha-list-item>
            <ha-list-item value="script" @click="${() => onConfigChange('actionType', 'script')}">执行脚本</ha-list-item>
          </ha-select>
        </div>

        ${config.actionType === 'service' ? this._renderServiceConfig(config, services, onConfigChange) : ''}
        ${config.actionType === 'navigation' ? this._renderNavigationConfig(config, onConfigChange) : ''}
        ${config.actionType === 'script' ? this._renderScriptConfig(config, hass, onConfigChange) : ''}

        <div class="form-field">
          <label class="form-label">按钮样式</label>
          <ha-select
            .value="${config.buttonStyle || 'primary'}"
            @closed="${e => e.stopPropagation()}"
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="primary" @click="${() => onConfigChange('buttonStyle', 'primary')}">主要</ha-list-item>
            <ha-list-item value="secondary" @click="${() => onConfigChange('buttonStyle', 'secondary')}">次要</ha-list-item>
            <ha-list-item value="warning" @click="${() => onConfigChange('buttonStyle', 'warning')}">警告</ha-list-item>
            <ha-list-item value="danger" @click="${() => onConfigChange('buttonStyle', 'danger')}">危险</ha-list-item>
          </ha-select>
        </div>
      </div>
    `;
  }

  _renderServiceConfig(config, services, onConfigChange) {
    return `
      <div class="form-field">
        <label class="form-label">服务</label>
        <ha-combo-box
          .items="${JSON.stringify(services)}"
          .value="${config.service || ''}"
          @value-changed="${e => onConfigChange('service', e.detail.value)}"
          allow-custom-value
          fullwidth
        ></ha-combo-box>
      </div>

      <div class="form-field">
        <label class="form-label">服务数据 (JSON)</label>
        <ha-textarea
          .value="${config.serviceData || '{}'}"
          @input="${e => onConfigChange('serviceData', e.target.value)}"
          placeholder='{"entity_id": "light.bedroom"}'
          rows="3"
          fullwidth
        ></ha-textarea>
      </div>
    `;
  }

  _renderNavigationConfig(config, onConfigChange) {
    return `
      <div class="form-field">
        <label class="form-label">导航路径</label>
        <ha-textfield
          .value="${config.navigation || ''}"
          @input="${e => onConfigChange('navigation', e.target.value)}"
          placeholder="/lovelace/0"
          fullwidth
        ></ha-textfield>
      </div>
    `;
  }

  _renderScriptConfig(config, hass, onConfigChange) {
    const scripts = this._getScriptEntities(hass);
    
    return `
      <div class="form-field">
        <label class="form-label">脚本</label>
        <ha-combo-box
          .items="${JSON.stringify(scripts)}"
          .value="${config.script || ''}"
          @value-changed="${e => onConfigChange('script', e.detail.value)}"
          allow-custom-value
          fullwidth
        ></ha-combo-box>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      title: '',
      buttonText: '执行',
      description: '',
      icon: 'mdi:gesture-tap',
      actionType: 'service',
      service: '',
      serviceData: '{}',
      navigation: '',
      script: '',
      buttonStyle: 'primary'
    };
  }

  _getAvailableServices(hass) {
    if (!hass?.services) return [];
    
    const services = [];
    Object.entries(hass.services).forEach(([domain, domainServices]) => {
      Object.keys(domainServices).forEach(service => {
        services.push({
          value: `${domain}.${service}`,
          label: `${domain}.${service}`
        });
      });
    });
    
    return services.sort((a, b) => a.label.localeCompare(b.label));
  }

  _getScriptEntities(hass) {
    if (!hass?.states) return [];
    
    return Object.entries(hass.states)
      .filter(([entityId]) => entityId.startsWith('script.'))
      .map(([entityId, entity]) => ({
        value: entityId,
        label: entity.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getActionHandler(config) {
    if (config.actionType === 'service' && config.service) {
      const [domain, service] = config.service.split('.');
      const serviceData = this._parseServiceData(config.serviceData);
      
      return `this.dispatchEvent(new CustomEvent('hass-call-service', {
        bubbles: true,
        composed: true,
        detail: {
          domain: '${domain}',
          service: '${service}',
          serviceData: ${JSON.stringify(serviceData)}
        }
      }))`;
    }
    
    if (config.actionType === 'navigation' && config.navigation) {
      return `this.dispatchEvent(new CustomEvent('location-changed', {
        bubbles: true,
        composed: true,
        detail: { replace: false, path: '${config.navigation}' }
      }))`;
    }
    
    if (config.actionType === 'script' && config.script) {
      return `this.dispatchEvent(new CustomEvent('hass-call-service', {
        bubbles: true,
        composed: true,
        detail: {
          domain: 'script',
          service: 'turn_on',
          serviceData: { entity_id: '${config.script}' }
        }
      }))`;
    }
    
    return 'alert("操作未配置")';
  }

  _parseServiceData(serviceData) {
    try {
      return JSON.parse(serviceData || '{}');
    } catch (error) {
      console.error('解析服务数据失败:', error);
      return {};
    }
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:gesture-tap" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'action-block empty');
  }
}

export { ActionBlock as default };