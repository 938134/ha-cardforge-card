// src/core/entity-config.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class EntityConfig {
  static render(hass, config, plugin, onEntityChange) {
    if (!plugin) {
      return this._renderEmptyState('请先选择插件');
    }

    // 从注册表获取完整的插件信息
    const fullPlugin = PluginRegistry.getPlugin(plugin.id);
    if (!fullPlugin) {
      return this._renderEmptyState('插件加载失败');
    }

    const requirements = fullPlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return this._renderEmptyState('此插件无需配置实体', 'mdi:check-circle-outline', 'var(--success-color)');
    }

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
    
    return html`
      <div class="entity-row">
        <div class="entity-label">
          ${requirement.description}
          ${requirement.required ? html`<span class="required-star">*</span>` : ''}
        </div>
        
        <ha-entity-picker
          .hass=${hass}
          .value=${entityId}
          @value-changed=${e => onEntityChange(requirement.key, e.detail.value)}
          allow-custom-entity
        ></ha-entity-picker>
        
        ${this._renderValidationIcon(isValid, requirement)}
      </div>
    `;
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
      return html`<ha-icon icon="mdi:check-circle" style="color: var(--success-color)"></ha-icon>`;
    }
    
    if (requirement.required) {
      return html`<ha-icon icon="mdi:alert-circle" style="color: var(--error-color)" .title=${validation.reason}></ha-icon>`;
    }
    
    return html`<ha-icon icon="mdi:information" style="color: var(--warning-color)" .title=${validation.reason}></ha-icon>`;
  }

  static _renderEmptyState(message, icon = 'mdi:alert-circle-outline', color = 'var(--secondary-text-color)') {
    return html`
      <ha-card>
        <div class="empty-state">
          <ha-icon .icon=${icon} style="color: ${color}; font-size: 2em;"></ha-icon>
          <div style="margin-top: 12px;">${message}</div>
        </div>
      </ha-card>
    `;
  }
}
