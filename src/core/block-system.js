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

  static detectBlockType(blockConfig) {
    if (blockConfig.entity) {
      return 'entity';
    }
    return 'text';
  }

  static getBlockDisplayName(blockConfig) {
    const blockType = this.detectBlockType(blockConfig);
    return this.BLOCK_TYPES[blockType]?.name || '内容块';
  }

  static getBlockIcon(blockConfig) {
    const blockType = this.detectBlockType(blockConfig);
    return this.BLOCK_TYPES[blockType]?.icon || 'mdi:cube';
  }

  static getEntityIcon(entityId, hass) {
    if (!entityId || !hass) return 'mdi:help-circle';
    
    const entity = hass.states[entityId];
    if (entity?.attributes?.icon) {
      return entity.attributes.icon;
    }
    
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

  static validateBlock(blockConfig) {
    const errors = [];
    const blockType = this.detectBlockType(blockConfig);
    
    if (blockType === 'entity' && !blockConfig.entity) {
      errors.push('实体块必须选择实体');
    }
    
    if (blockType === 'text' && !blockConfig.content) {
      errors.push('文本块内容不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static createBlock(initialConfig = {}) {
    const blockType = this.detectBlockType(initialConfig);
    const defaultConfig = this.BLOCK_TYPES[blockType]?.defaultConfig || {};
    
    return {
      ...defaultConfig,
      ...initialConfig
    };
  }

  static getBlockPreview(blockConfig, hass) {
    const blockType = this.detectBlockType(blockConfig);
    
    if (blockType === 'entity' && blockConfig.entity) {
      if (hass?.states[blockConfig.entity]) {
        const entity = hass.states[blockConfig.entity];
        const unit = entity.attributes?.unit_of_measurement || '';
        
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
    
    if (blockType === 'text' && blockConfig.content) {
      const content = blockConfig.content || '';
      if (content.length <= 20) return content;
      return content.substring(0, 18) + '...';
    }
    
    return '点击配置';
  }

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