// src/plugins/oil-price-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  version: '1.0.0',
  description: '显示各省市实时油价信息，支持完全实体化配置',
  author: 'CardForge Team',
  category: 'info',
  icon: '⛽',
  entityRequirements: [
    {
      key: 'province_entity',
      description: '省份实体',
      required: false
    },
    {
      key: 'price_0_entity',
      description: '0号柴油价格实体',
      required: false
    },
    {
      key: 'price_92_entity',
      description: '92号汽油价格实体',
      required: false
    },
    {
      key: 'price_95_entity',
      description: '95号汽油价格实体',
      required: false
    },
    {
      key: 'price_98_entity',
      description: '98号汽油价格实体',
      required: false
    },
    {
      key: 'trend_entity',
      description: '油价趋势实体',
      required: false
    },
    {
      key: 'next_adjustment_entity',
      description: '下次调整时间实体',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class OilPriceCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const province = this._getEntityState(entities.province_entity, '北京市');
    const price0 = this._getEntityState(entities.price_0_entity, '--');
    const price92 = this._getEntityState(entities.price_92_entity, '--');
    const price95 = this._getEntityState(entities.price_95_entity, '--');
    const price98 = this._getEntityState(entities.price_98_entity, '--');
    const trend = this._getEntityState(entities.trend_entity, '');
    const nextAdjustment = this._getEntityState(entities.next_adjustment_entity, '');
    
    return `
      <div class="cardforge-card oil-price-card">
        <div class="card-header">
          <div class="card-icon">⛽</div>
          <div class="card-title">${province}油价</div>
        </div>
        
        <div class="price-grid">
          ${this._renderFuelCard('92', price92)}
          ${this._renderFuelCard('95', price95)}
          ${this._renderFuelCard('98', price98)}
          ${this._renderFuelCard('0', price0)}
        </div>
        
        <!-- 趋势和调整时间数据保留但不显示 -->
      </div>
    `;
  }

  _getEntityState(entity, defaultValue = '') {
    return entity?.state || defaultValue;
  }

  _renderFuelCard(type, price) {
    return `
      <div class="fuel-card">
        <span class="fuel-type">${type}#</span>
        <span class="fuel-price">${price}</span>
        <span class="fuel-unit">元/升</span>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .oil-price-card {
        ${this._responsivePadding('16px', '12px')}
        ${this._responsiveHeight('180px', '160px')}
      }
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .card-icon {
        font-size: 1.2em;
      }
      
      .card-title {
        font-weight: 600;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      
      .fuel-card {
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 1px 4px rgba(0,0,0,.1);
        transition: all 0.2s ease;
        text-align: center;
        background: rgba(var(--rgb-primary-background-color), 0.8);
        border: 1px solid rgba(var(--rgb-primary-text-color), 0.1);
        padding: 12px 8px;
        min-height: 60px;
      }
      
      .fuel-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,.15);
      }
      
      .fuel-type {
        font-size: 12px;
        opacity: 0.9;
        margin-bottom: 3px;
        font-weight: 500;
      }
      
      .fuel-price {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1px;
      }
      
      .fuel-unit {
        font-size: 10px;
        opacity: 0.7;
      }
      
      /* 响应式设计 */
      @media (max-width: 480px) {
        .price-grid {
          gap: 6px;
        }
        
        .fuel-card {
          padding: 8px 4px;
          min-height: 50px;
        }
        
        .fuel-type {
          font-size: 11px;
        }
        
        .fuel-price {
          font-size: 14px;
        }
        
        .fuel-unit {
          font-size: 9px;
        }
      }
      
      @media (max-width: 360px) {
        .price-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
      }
    `;
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }
}