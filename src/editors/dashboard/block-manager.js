// src/editors/dashboard/block-manager.js
export class BlockManager {
  // 块类型定义
  static BLOCK_TYPES = {
    text: { 
      name: '文本块', 
      icon: 'mdi:text',
      editor: 'text'
    },
    sensor: { 
      name: '传感器', 
      icon: 'mdi:gauge',
      editor: 'entity'
    },
    weather: { 
      name: '天气', 
      icon: 'mdi:weather-cloudy',
      editor: 'entity'
    },
    switch: { 
      name: '开关', 
      icon: 'mdi:power',
      editor: 'entity'
    }
  };

  // 布局预设
  static LAYOUT_PRESETS = {
    '1x1': { rows: 1, cols: 1, name: '单块' },
    '1x2': { rows: 1, cols: 2, name: '横向双块' },
    '1x3': { rows: 1, cols: 3, name: '横向三块' },
    '1x4': { rows: 1, cols: 4, name: '横向四块' },
    '2x2': { rows: 2, cols: 2, name: '四宫格' },
    '2x3': { rows: 2, cols: 3, name: '六块网格' },
    '3x3': { rows: 3, cols: 3, name: '九宫格' },
    'free': { rows: 4, cols: 4, name: '自由网格' }
  };

  // 创建新块
  static createBlock(type = 'text', id = null) {
    const blockId = id || `block_${Date.now()}`;
    return {
      id: blockId,
      type: type,
      content: '',
      config: {},
      position: { row: 0, col: 0 },
      order: 0
    };
  }

  // 序列化块到实体
  static serializeToEntities(blocks) {
    const entities = {};
    
    blocks.forEach((block, index) => {
      const blockId = block.id;
      entities[blockId] = block.content || '';
      entities[`${blockId}_type`] = block.type;
      entities[`${blockId}_order`] = String(index);
      entities[`${blockId}_position`] = JSON.stringify(block.position || { row: 0, col: 0 });
      
      if (Object.keys(block.config || {}).length > 0) {
        entities[`${blockId}_config`] = JSON.stringify(block.config);
      }
    });
    
    return entities;
  }

  // 从实体反序列化块
  static deserializeFromEntities(entities) {
    const blocks = [];
    
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        const configKey = `${blockId}_config`;
        const positionKey = `${blockId}_position`;
        
        try {
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
            position: entities[positionKey] ? JSON.parse(entities[positionKey]) : { row: 0, col: 0 },
            order: parseInt(entities[`${blockId}_order`]) || 0
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
    return blocks.map(block => {
      if (block.type !== 'text' && block.content) {
        const entity = hass?.states[block.content];
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
    const typeInfo = this.BLOCK_TYPES[block.type];
    return typeInfo?.name || '内容块';
  }

  // 获取块图标
  static getBlockIcon(block) {
    const typeInfo = this.BLOCK_TYPES[block.type];
    return typeInfo?.icon || 'mdi:cube';
  }

  // 验证块配置
  static validateBlock(block) {
    const errors = [];
    
    if (!block.type) {
      errors.push('块类型不能为空');
    }
    
    if (!block.content && block.type !== 'text') {
      errors.push('内容不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 获取块预览文本
  static getBlockPreview(block) {
    if (block.type === 'text') {
      const content = block.content || '';
      return content.substring(0, 20) + (content.length > 20 ? '...' : '');
    }
    
    if (block.realTimeData) {
      return `${block.realTimeData.state}`;
    }
    
    return block.content || '点击编辑';
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

  // 获取下一个可用位置
  static getNextPosition(blocks, layout) {
    const grid = this.LAYOUT_PRESETS[layout] || this.LAYOUT_PRESETS['2x2'];
    
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const isOccupied = blocks.some(block => 
          block.position?.row === row && block.position?.col === col
        );
        if (!isOccupied) {
          return { row, col };
        }
      }
    }
    
    // 如果网格已满，返回第一个位置
    return { row: 0, col: 0 };
  }
}