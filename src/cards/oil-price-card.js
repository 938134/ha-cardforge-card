// src/cards/oil-price-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'oil-price-card',
  name: '油价卡片',
  description: '显示当前油价信息，支持多种油品类型',
  icon: '⛽',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge'
};

// 油价数据（示例数据）
const OIL_PRICE_DATA = {
  '广东': {
    gas_89: 7.50,
    gas_92: 7.85, 
    gas_95: 8.35,
    gas_diesel: 7.45,
    update_time: '今日 08:00',
    trend: '较昨日持平'
  },
  '北京': {
    gas_89: 7.55,
    gas_92: 7.90,
    gas_95: 8.40,
    gas_diesel: 7.50,
    update_time: '今日 08:00',
    trend: '较昨日上涨0.1元'
  },
  '上海': {
    gas_89: 7.52,
    gas_92: 7.87,
    gas_95: 8.37,
    gas_diesel: 7.47,
    update_time: '今日 08:00', 
    trend: '较昨日持平'
  }
};

export class OilPriceCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      province: '广东', // 默认省份
      areas: {
        header: {
          layout: 'single',
          blocks: ['province_title']
        },
        content: {
          layout: 'grid-1x4',
          blocks: ['gas_89', 'gas_92', 'gas_95', 'gas_diesel']
        },
        footer: {
          layout: 'single', 
          blocks: ['update_tip']
        }
      },
      blocks: {
        province_title: {
          type: 'oil_title',
          area: 'header',
          entity: '',
          content: '广东省油价',
          name: '油价标题'
        },
        gas_89: {
          type: 'oil_89',
          area: 'content',
          entity: '',
          content: '7.50',
          name: '89号汽油'
        },
        gas_92: {
          type: 'oil_92',
          area: 'content',
          entity: '',
          content: '7.85',
          name: '92号汽油'
        },
        gas_95: {
          type: 'oil_95',
          area: 'content',
          entity: '',
          content: '8.35',
          name: '95号汽油'
        },
        gas_diesel: {
          type: 'oil_diesel',
          area: 'content',
          entity: '',
          content: '7.45',
          name: '0号柴油'
        },
        update_tip: {
          type: 'oil_tip',
          area: 'footer',
          entity: '',
          content: '贴士：较昨日持平 08:00',
          name: '油价提示'
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，添加动态油价数据
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 创建配置的深拷贝，避免修改原始配置
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 更新油价数据
    const province = dynamicConfig.province || '广东';
    const priceData = OIL_PRICE_DATA[province] || OIL_PRICE_DATA['广东'];
    
    // 更新各块内容
    dynamicConfig.blocks.province_title.content = `${province}油价`;
    dynamicConfig.blocks.gas_89.content = priceData.gas_89.toFixed(2);
    dynamicConfig.blocks.gas_92.content = priceData.gas_92.toFixed(2);
    dynamicConfig.blocks.gas_95.content = priceData.gas_95.toFixed(2);
    dynamicConfig.blocks.gas_diesel.content = priceData.gas_diesel.toFixed(2);
    dynamicConfig.blocks.update_tip.content = `贴士：${priceData.trend} ${priceData.update_time}`;
    
    return super.render(dynamicConfig, hass, entities);
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    // 所有油价块都统一处理，不显示块标题
    if (blockConfig.type.startsWith('oil_')) {
      const content = this._getBlockContent(blockConfig, hass);
      if (!content) return '';

      switch (blockConfig.type) {
        case 'oil_title':
          return `<div class="oil-title">🗺️ ${this._escapeHtml(content)}</div>`;
        case 'oil_89':
          return this._renderOilBlock('🟢', '89号', content);
        case 'oil_92':
          return this._renderOilBlock('🔵', '92号', content);
        case 'oil_95':
          return this._renderOilBlock('🟠', '95号', content);
        case 'oil_diesel':
          return this._renderOilBlock('⚫', '0号柴油', content);
        case 'oil_tip':
          return `<div class="oil-tip">💡 ${this._escapeHtml(content)}</div>`;
        default:
          return '';
      }
    }
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _renderOilBlock(icon, label, price) {
    return `
      <div class="oil-block">
        <div class="oil-header">
          <span class="oil-icon">${icon}</span>
          <span class="oil-label">${this._escapeHtml(label)}</span>
        </div>
        <div class="oil-price">${this._escapeHtml(price)}</div>
        <div class="oil-unit">元/L</div>
      </div>
    `;
  }

  _getBlockContent(blockConfig, hass) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states?.[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 回退到静态内容
    return blockConfig.content || '';
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderStyles(config, themeStyles) {
    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 标题区域 */
      .area-header {
        margin-bottom: 8px;
        text-align: center;
      }
      
      .oil-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      
      /* 内容区域 - 紧凑的4列布局 */
      .layout-grid.grid-1x4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        margin: 0;
      }
      
      .oil-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 6px 2px;
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: 6px;
        min-height: 55px;
        justify-content: center;
      }
      
      .oil-header {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-bottom: 2px;
      }
      
      .oil-icon {
        font-size: 0.9em;
      }
      
      .oil-label {
        font-size: 0.7em;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1;
      }
      
      .oil-price {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--primary-color);
        line-height: 1;
        margin-bottom: 1px;
      }
      
      .oil-unit {
        font-size: 0.6em;
        color: var(--secondary-text-color);
        line-height: 1;
      }
      
      /* 页脚区域 */
      .area-footer {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid var(--divider-color);
        text-align: center;
      }
      
      .oil-tip {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .layout-grid.grid-1x4 {
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;
        }
        
        .oil-block {
          padding: 4px 1px;
          min-height: 50px;
        }
        
        .oil-header {
          gap: 1px;
        }
        
        .oil-icon {
          font-size: 0.8em;
        }
        
        .oil-label {
          font-size: 0.65em;
        }
        
        .oil-price {
          font-size: 0.85em;
        }
        
        .oil-unit {
          font-size: 0.55em;
        }
        
        .oil-title {
          font-size: 0.9em;
        }
        
        .oil-tip {
          font-size: 0.7em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .layout-grid.grid-1x4 {
          grid-template-columns: 1fr;
          gap: 2px;
        }
        
        .oil-block {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          min-height: auto;
          text-align: left;
        }
        
        .oil-header {
          margin-bottom: 0;
          gap: 4px;
        }
        
        .oil-price {
          margin-bottom: 0;
          margin-left: auto;
          margin-right: 4px;
        }
        
        .oil-unit {
          display: none;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default OilPriceCard;