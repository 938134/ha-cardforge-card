// src/core/entity-config.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './plugin-registry.js';

export class EntityConfig {
  static render(hass, config, plugin, onEntityChange) {
    console.log('EntityConfig.render called:', { 
      hass: !!hass, 
      plugin: plugin?.manifest?.name,
      config: config 
    });

    if (!plugin) {
      console.log('No plugin selected');
      return this._renderEmptyState('请先选择插件');
    }

    // 从注册表获取完整的插件信息
    const fullPlugin = PluginRegistry.getPlugin(plugin.id);
    if (!fullPlugin) {
      console.log('Plugin not found in registry:', plugin.id);
      return this._renderEmptyState('插件加载失败');
    }

    const requirements = fullPlugin.manifest.entityRequirements || [];
    console.log('Plugin requirements:', requirements);
    
    if (requirements.length === 0) {
      console.log('No entity requirements for plugin');
      return this._renderEmptyState('此插件无需配置实体', 'mdi:check-circle-outline', 'var(--success-color)');
    }

    // 检查 hass 是否可用
    if (!hass) {
      console.log('Hass not available');
      return this._renderEmptyState('Home Assistant 未连接', 'mdi:connection', 'var(--error-color)');
    }

    console.log('Rendering entity config with requirements:', requirements.length);

    return html`
      <ha-card>
        <div class="entity-config-container">
          <div class="config-header">
            <ha-icon icon="mdi:database-cog"></ha-icon>
            <span>实体配置 - ${fullPlugin.manifest.name}</span>
          </div>
          
          ${requirements.map(req => this._renderEntityRow(hass, config, req, onEntityChange))}
          
          <div class="config-hint">
            💡 提示：带 <span class="required-star">*</span> 的实体为必选
          </div>
        </div>
      </ha-card>
    `;
  }

  static _renderEntityRow(hass, config, requirement, onEntityChange) {
    const entityId = config.entities?.[requirement.key] || '';
    const isValid = this._simpleValidate(hass, entityId, requirement);
    
    console.log('Rendering entity row:', requirement.key, 'current value:', entityId);

    return html`
      <div class="entity-row">
        <div class="entity-label">
          ${requirement.description}
          ${requirement.required ? html`<span class="required-star">*</span>` : ''}
        </div>
        
        <div class="entity-picker-container">
          <ha-entity-picker
            .hass=${hass}
            .value=${entityId}
            @value-changed=${e => this._handleEntityChange(e, requirement.key, onEntityChange)}
            allow-custom-entity
            .label=${`选择${requirement.description}`}
            style="width: 100%;"
          ></ha-entity-picker>
        </div>
        
        ${this._renderValidationIcon(isValid, requirement)}
      </div>
    `;
  }

  static _handleEntityChange(event, key, onEntityChange) {
    const value = event.detail.value;
    console.log('实体选择器变更:', key, value);
    onEntityChange(key, value);
  }

  static _simpleValidate(hass, entityId, requirement) {
    if (!entityId) {
      return {
        isValid: !requirement.required,
        reason: requirement.required ? '必须选择实体' : '实体可选'
      };
    }

    if (!hass?.states?.[entityId]) {
      return {
        isValid: false,
        reason: '实体不存在'
      };
    }

    return {
      isValid: true,
      reason: '实体有效'
    };
  }

  static _renderValidationIcon(validation, requirement) {
    if (validation.isValid) {
      return html`
        <ha-icon 
          icon="mdi:check-circle" 
          style="color: var(--success-color)"
          .title=${validation.reason}
        ></ha-icon>
      `;
    }
    
    if (requirement.required) {
      return html`
        <ha-icon 
          icon="mdi:alert-circle" 
          style="color: var(--error-color)" 
          .title=${validation.reason}
        ></ha-icon>
      `;
    }
    
    return html`
      <ha-icon 
        icon="mdi:information" 
        style="color: var(--warning-color)" 
        .title=${validation.reason}
      ></ha-icon>
    `;
  }

  static _renderEmptyState(message, icon = 'mdi:alert-circle-outline', color = 'var(--secondary-text-color)') {
    return html`
      <ha-card>
        <div class="empty-state">
          <ha-icon .icon=${icon} style="color: ${color}; font-size: 2em;"></ha-icon>
          <div style="margin-top: 12px; font-size: 1em;">${message}</div>
        </div>
      </ha-card>
    `;
  }
}
