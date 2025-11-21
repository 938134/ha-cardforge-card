// src/core/block-manager.js
export class BlockManager {
    // 块类型定义
    static BLOCK_TYPES = {
      text: { 
        name: '文本块', 
        icon: 'mdi:text',
        editor: 'text',
        category: 'content'
      },
      sensor: { 
        name: '传感器', 
        icon: 'mdi:gauge',
        editor: 'entity', 
        category: 'sensor'
      },
      weather: { 
        name: '天气', 
        icon: 'mdi:weather-cloudy',
        editor: 'entity',
        category: 'weather'
      },
      switch: { 
        name: '开关', 
        icon: 'mdi:power',
        editor: 'entity',
        category: 'device'
      }
    };
  
    // 创建新块
    static createBlock(type = 'text', id = null) {
      const blockId = id || `block_${Date.now()}`;
      return {
        id: blockId,
        type: type,
        content: '',
        config: {},
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
          
          try {
            blocks.push({
              id: blockId,
              type: value,
              content: entities[blockId] || '',
              config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
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
  }