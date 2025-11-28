// src/core/block-system.js
export class BlockSystem {
  static BLOCK_TYPES = {
    text: {
      name: '文本块',
      icon: 'mdi:text',
      defaultConfig: {
        title: '',
        content: '',
        style: ''
      }
    },
    entity: {
      name: '实体块', 
      icon: 'mdi:cube',
      defaultConfig: {
        title: '',
        entity: '',
        style: ''
      }
    }
  };

  // 根据配置自动识别块类型
  static detectBlockType(blockConfig) {
    if (blockConfig.entity) {
      return 'entity';
    }
    return 'text';
  }

  // 获取块显示名称
  static getBlockDisplayName(blockConfig) {
    const blockType = this.detectBlockType(blockConfig);
    return this.BLOCK_TYPES[blockType]?.name || '内容块';
  }

  // 获取块图标
  static getBlockIcon(blockConfig) {
    const blockType = this.detectBlockType(blockConfig);
    return this.BLOCK_TYPES[blockType]?.icon || 'mdi:cube';
  }

  // 根据实体ID自动填充信息
  static autoFillFromEntity(blockConfig, hass) {
    if (!blockConfig.entity || !hass) return blockConfig;
    
    const entity = hass.states[blockConfig.entity];
    if (!entity) return blockConfig;
    
    const updatedConfig = { ...blockConfig };
    
    // 自动填充标题
    if (!updatedConfig.title && entity.attributes?.friendly_name) {
      updatedConfig.title = entity.attributes.friendly_name;
    }
    
    // 自动填充图标
    if (!updatedConfig.icon) {
      updatedConfig.icon = this.getEntityIcon(blockConfig.entity, hass);
    }
    
    return updatedConfig;
  }

  // 根据实体ID获取图标
  static getEntityIcon(entityId, hass) {
    if (!entityId || !hass) return 'mdi:help-circle';
    
    const entity = hass.states[entityId];
    if (entity?.attributes?.icon) {
      return entity.attributes.icon;
    }
    
    // 根据实体ID前缀自动匹配图标
    const entityType = entityId.split('.')[0];
    const iconMap = {
      'sensor': 'mdi:gauge',
      'binary_sensor': 'mdi:checkbox-marked-circle-outline',
      'switch': 'mdi:power',
      'light': 'mdi:lightbulb',
      'climate': 'mdi:thermostat',
      'cover': 'mdi:blinds',
      'media_player': 'mdi:speaker',
      'weather': 'mdi:weather-cloudy'
    };
    
    return iconMap[entityType] || 'mdi:cube';
  }

  // 验证块配置 - 放宽验证，实体可选
  static validateBlock(blockConfig) {
    const errors = [];
    
    // 基本验证
    if (!blockConfig.title && !blockConfig.entity) {
      errors.push('块需要名称或实体');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 创建新块 - 简化配置
  static createBlock(initialConfig = {}) {
    return {
      area: 'content',
      title: '',
      entity: '',
      icon: '',
      ...initialConfig
    };
  }

  // 获取块状态预览
  static getBlockPreview(blockConfig, hass) {
    if (blockConfig.entity) {
      if (hass?.states[blockConfig.entity]) {
        const entity = hass.states[blockConfig.entity];
        const unit = entity.attributes?.unit_of_measurement || '';
        
        // 对特定实体类型提供更友好的状态显示
        switch (entity.entity_id?.split('.')[0]) {
          case 'light':
          case 'switch':
            return entity.state === 'on' ? '开启' : '关闭';
          case 'climate':
            return this._formatClimateState(entity);
          case 'cover':
            return entity.state === 'open' ? '打开' : entity.state === 'closed' ? '关闭' : entity.state;
          default:
            return `${entity.state}${unit ? ' ' + unit : ''}`;
        }
      }
      return blockConfig.entity;
    }
    
    if (blockConfig.title) {
      return blockConfig.title;
    }
    
    return '点击配置';
  }

  // 辅助方法：格式化空调状态
  static _formatClimateState(entity) {
    const state = entity.state;
    const temp = entity.attributes?.temperature;
    const mode = entity.attributes?.hvac_mode;
    
    if (state === 'off') return '关闭';
    
    const modeText = {
      'heat': '制热',
      'cool': '制冷',
      'auto': '自动',
      'fan_only': '仅风扇'
    }[mode] || mode;
    
    return temp ? `${modeText} ${temp}°C` : modeText;
  }
}
