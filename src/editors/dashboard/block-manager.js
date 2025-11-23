// src/editors/dashboard/block-manager.js
export class BlockManager {
  // 布局预设
  static LAYOUT_PRESETS = {
    '1x1': { rows: 1, cols: 1, name: '单块' },
    '1x2': { rows: 1, cols: 2, name: '横向双块' },
    '2x2': { rows: 2, cols: 2, name: '四宫格' },
    '2x3': { rows: 2, cols: 3, name: '六块网格' },
    '3x3': { rows: 3, cols: 3, name: '九宫格' }
  };

  // 创建新块
  static createBlock(id = null) {
    const blockId = id || `block_${Date.now()}`;
    return {
      id: blockId,
      type: 'sensor', // 统一使用 sensor 类型
      content: '',
      config: {
        blockType: 'content', // 默认内容区域
        title: '',
        icon: ''
      },
      order: 0
    };
  }

  // 创建特定区域的块
  static createHeaderBlock(content = '仪表盘标题', id = null) {
    const block = this.createBlock(id);
    block.config.blockType = 'header';
    block.content = content;
    return block;
  }

  static createFooterBlock(content = '页脚信息', id = null) {
    const block = this.createBlock(id);
    block.config.blockType = 'footer';
    block.content = content;
    return block;
  }

  static createContentBlock(id = null) {
    const block = this.createBlock(id);
    block.config.blockType = 'content';
    return block;
  }

  // 序列化块到实体
  static serializeToEntities(blocks) {
    const entities = {};
    
    blocks.forEach((block, index) => {
      const blockId = block.id;
      entities[blockId] = block.content || '';
      entities[`${blockId}_type`] = block.type;
      entities[`${blockId}_order`] = String(index);
      
      // 序列化配置
      if (block.config && Object.keys(block.config).length > 0) {
        entities[`${blockId}_config`] = JSON.stringify(block.config);
      }
    });
    
    return entities;
  }

  // 从实体反序列化块
  static deserializeFromEntities(entities) {
    const blocks = [];
    
    if (!entities) return blocks;
    
    Object.entries(entities).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        const configKey = `${blockId}_config`;
        const orderKey = `${blockId}_order`;
        
        try {
          const blockConfig = entities[configKey] ? JSON.parse(entities[configKey]) : {};
          
          // 确保配置有默认值
          const config = {
            blockType: 'content',
            title: '',
            icon: '',
            ...blockConfig
          };
          
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: config,
            order: parseInt(entities[orderKey]) || 0
          });
        } catch (e) {
          console.warn(`解析内容块配置失败: ${blockId}`, e);
        }
      }
    });

    return blocks.sort((a, b) => a.order - b.order);
  }

  // 使用实时数据增强块
  static enrichWithRealtimeData(blocks, hass) {
    if (!hass) return blocks;
    
    return blocks.map(block => {
      if (block.content) {
        const entity = hass.states[block.content];
        if (entity) {
          block.realTimeData = {
            state: entity.state,
            attributes: entity.attributes || {},
            lastChanged: entity.last_changed
          };
        }
      }
      return block;
    });
  }

  // 获取块显示名称
  static getBlockDisplayName(block) {
    // 根据是否有内容来判断是传感器还是文本块
    if (block.content) {
      return '传感器块';
    } else {
      return '文本块';
    }
  }

  // 获取块图标
  static getBlockIcon(block, hass = null) {
    // 如果有自定义图标，使用自定义图标
    if (block.config?.icon) {
      return block.config.icon;
    }
    
    // 如果有实体内容，使用实体图标
    if (block.content && hass) {
      return this.getEntityIcon(block.content, hass);
    }
    
    // 默认图标
    return block.content ? 'mdi:gauge' : 'mdi:text';
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
      'person': 'mdi:account',
      'device_tracker': 'mdi:account',
      'sun': 'mdi:weather-sunny',
      'weather': 'mdi:weather-cloudy',
      'camera': 'mdi:camera',
      'automation': 'mdi:robot',
      'script': 'mdi:script-text',
      'scene': 'mdi:palette',
      'input_boolean': 'mdi:toggle-switch',
      'input_number': 'mdi:ray-vertex',
      'input_select': 'mdi:format-list-bulleted',
      'input_text': 'mdi:form-textbox',
      'timer': 'mdi:timer',
      'zone': 'mdi:map-marker-radius',
      'group': 'mdi:google-circles-communities'
    };
    
    return iconMap[entityType] || 'mdi:cube';
  }

  // 获取实体显示名称
  static getEntityDisplayName(entityId, hass) {
    if (!entityId || !hass) return entityId;
    
    const entity = hass.states[entityId];
    return entity?.attributes?.friendly_name || entityId;
  }

  // 获取实体状态信息
  static getEntityStateInfo(entityId, hass) {
    if (!entityId || !hass) return null;
    
    const entity = hass.states[entityId];
    if (!entity) return null;
    
    return {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendlyName: entity.attributes?.friendly_name || entityId,
      icon: entity.attributes?.icon || this.getEntityIcon(entityId, hass)
    };
  }

static getBlockPreview(block) {
  // 如果有实时数据，显示状态
  if (block.realTimeData) {
    const state = block.realTimeData.state;
    const unit = block.realTimeData.attributes?.unit_of_measurement || '';
    return `${state}${unit ? ' ' + unit : ''}`;
  }
  
  // 如果有实体内容，显示实体名称（简化版）
  if (block.content) {
    // 只显示实体ID的最后一部分，去掉前缀
    const entityParts = block.content.split('.');
    const entityName = entityParts.length > 1 ? entityParts[1] : block.content;
    
    // 如果实体名称太长，截断显示
    return entityName.length > 20 ? entityName.substring(0, 20) + '...' : entityName;
  }
  
  // 文本块显示内容预览
  const content = block.config?.title || block.content || '';
  return content.substring(0, 30) + (content.length > 30 ? '...' : '');
}

  // 验证块配置
  static validateBlock(block) {
    const errors = [];
    
    // 验证区域类型
    const validBlockTypes = ['header', 'content', 'footer'];
    if (block.config?.blockType && !validBlockTypes.includes(block.config.blockType)) {
      errors.push('区域类型无效');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 更新块内容
  static updateBlockContent(block, content) {
    return {
      ...block,
      content: content
    };
  }

  // 更新块配置
  static updateBlockConfig(block, config) {
    return {
      ...block,
      config: {
        ...block.config,
        ...config
      }
    };
  }

  // 重新排序块
  static reorderBlocks(blocks, fromIndex, toIndex) {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    // 更新排序
    return newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
  }

  // 根据实体类型推荐块类型（现在统一使用 sensor）
  static suggestBlockType(entityId) {
    return 'sensor';
  }

  // 获取所有支持的实体类型
  static getSupportedEntityTypes() {
    return ['sensor']; // 现在只支持 sensor 类型
  }

  // 导出块配置为可读格式（用于调试）
  static exportBlocks(blocks) {
    return blocks.map(block => ({
      id: block.id,
      type: block.type,
      content: block.content,
      config: block.config,
      displayName: this.getBlockDisplayName(block),
      areaType: block.config?.blockType || 'content'
    }));
  }

  // 导入块配置
  static importBlocks(blockData) {
    return blockData.map(data => ({
      id: data.id || `block_${Date.now()}`,
      type: 'sensor', // 统一使用 sensor 类型
      content: data.content || '',
      config: {
        blockType: 'content',
        title: '',
        icon: '',
        ...data.config
      },
      order: data.order || 0
    }));
  }

  // 检查块是否在内容区域
  static isContentBlock(block) {
    return !block.config?.blockType || block.config.blockType === 'content';
  }

  // 检查块是否在标题区域
  static isHeaderBlock(block) {
    return block.config?.blockType === 'header';
  }

  // 检查块是否在页脚区域
  static isFooterBlock(block) {
    return block.config?.blockType === 'footer';
  }

  // 获取区域显示名称
  static getAreaDisplayName(block) {
    const areaType = block.config?.blockType || 'content';
    const names = {
      'header': '标题区域',
      'content': '内容区域',
      'footer': '页脚区域'
    };
    return names[areaType];
  }

  // 获取块统计信息（简化版）
  static getBlockStats(blocks) {
    return {
      totalBlocks: blocks.length,
      contentBlocks: blocks.filter(b => !b.config?.blockType || b.config.blockType === 'content').length,
      headerBlocks: blocks.filter(b => b.config?.blockType === 'header').length,
      footerBlocks: blocks.filter(b => b.config?.blockType === 'footer').length,
      sensorBlocks: blocks.filter(b => b.content).length,
      textBlocks: blocks.filter(b => !b.content).length
    };
  }

  // 获取默认块配置
  static getDefaultBlockConfig(blockType = 'content') {
    return {
      blockType: blockType,
      title: '',
      icon: ''
    };
  }

  // 验证实体是否存在
  static validateEntity(entityId, hass) {
    if (!entityId || !hass) return false;
    return !!hass.states[entityId];
  }

  // 获取实体状态
  static getEntityState(entityId, hass, fallback = '未知') {
    if (!entityId || !hass) return fallback;
    const entity = hass.states[entityId];
    return entity?.state || fallback;
  }

  // 清理块数据（移除空值）
  static sanitizeBlock(block) {
    const sanitized = { ...block };
    
    // 清理配置
    if (sanitized.config) {
      const cleanConfig = {};
      Object.entries(sanitized.config).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanConfig[key] = value;
        }
      });
      sanitized.config = cleanConfig;
    }
    
    return sanitized;
  }

  // 复制块
  static duplicateBlock(block, newId = null) {
    const blockId = newId || `block_${Date.now()}`;
    return {
      ...block,
      id: blockId,
      config: { ...block.config }
    };
  }

  // 合并块配置
  static mergeBlockConfigs(baseConfig, overrideConfig) {
    return {
      ...baseConfig,
      ...overrideConfig
    };
  }

  // 检查块是否为空
  static isEmptyBlock(block) {
    return !block.content && 
           !block.config?.title && 
           !block.config?.icon;
  }

  // 获取块类型颜色（用于可视化）
  static getBlockTypeColor(block) {
    const type = block.config?.blockType || 'content';
    const colors = {
      'header': '#4CAF50', // 绿色
      'content': '#2196F3', // 蓝色
      'footer': '#FF9800'  // 橙色
    };
    return colors[type] || '#9E9E9E';
  }
}