// src/core/block-system.js
export class BlockSystem {
  static BLOCK_TYPES = {
    text: {
      name: '文本块',
      icon: 'mdi:text',
      defaultConfig: {
        title: '',
        content: '',
        area: 'content',  // 新增：默认区域
        style: ''
      }
    },
    entity: {
      name: '实体块', 
      icon: 'mdi:cube',
      defaultConfig: {
        title: '',
        entity: '',
        area: 'content',  // 新增：默认区域
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

  // 验证块配置
  static validateBlock(blockConfig) {
    const errors = [];
    const blockType = this.detectBlockType(blockConfig);
    
    // 验证区域
    const validAreas = ['header', 'content', 'footer'];
    if (!validAreas.includes(blockConfig.area)) {
      errors.push('区域必须为 header、content 或 footer');
    }
    
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

  // 创建新块
  static createBlock(initialConfig = {}) {
    const blockType = this.detectBlockType(initialConfig);
    const defaultConfig = this.BLOCK_TYPES[blockType]?.defaultConfig || {};
    
    return {
      ...defaultConfig,
      ...initialConfig
    };
  }

  // 获取块预览内容
  static getBlockPreview(blockConfig, hass) {
    const blockType = this.detectBlockType(blockConfig);
    
    if (blockType === 'entity' && blockConfig.entity) {
      if (hass?.states[blockConfig.entity]) {
        const entity = hass.states[blockConfig.entity];
        const unit = entity.attributes?.unit_of_measurement || '';
        return `${entity.state}${unit ? ' ' + unit : ''}`;
      }
      return blockConfig.entity;
    }
    
    if (blockType === 'text' && blockConfig.content) {
      const content = blockConfig.content || '';
      return content.substring(0, 20) + (content.length > 20 ? '...' : '');
    }
    
    return '点击配置';
  }

  // 获取区域显示名称
  static getAreaDisplayName(area) {
    const areaNames = {
      'header': '标题区域',
      'content': '内容区域', 
      'footer': '页脚区域'
    };
    return areaNames[area] || area;
  }
}