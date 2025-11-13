// src/plugins/oil-price-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  version: '1.0.0',
  description: '显示各省市实时油价信息',
  author: 'CardForge Team',
  category: 'info',
  icon: '⛽',
  entityRequirements: [
    {
      key: 'oil_price_entity',
      description: '油价数据实体',
      required: false
    },
    {
      key: 'province_entity',
      description: '省份选择实体',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class OilPriceCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const oilPriceData = this._getOilPriceData(entities.oil_price_entity);
    const province = this._getProvince(entities.province_entity);
    
    const { prices, trend, nextAdjustment } = oilPriceData;
    
    return `
      <div class="cardforge-card oil-price-card">
        <div class="card-header">
          <div class="card-icon">⛽</div>
          <div class="card-title">${province}油价</div>
        </div>
        
        <div class="price-grid">
          ${this._renderFuelCard('92', prices['92'])}
          ${this._renderFuelCard('95', prices['95'])}
          ${this._renderFuelCard('98', prices['98'])}
          ${this._renderFuelCard('0', prices['0'])}
        </div>
        
        ${this._renderFooter(trend, nextAdjustment)}
      </div>
    `;
  }

  _getOilPriceData(oilPriceEntity) {
    // 如果有关联实体，从实体获取数据
    if (oilPriceEntity) {
      try {
        const data = JSON.parse(oilPriceEntity.state);
        return {
          prices: data.prices || { '92': '--', '95': '--', '98': '--', '0': '--' },
          trend: data.trend || { description: '' },
          nextAdjustment: data.next_adjustment || ''
        };
      } catch (e) {
        console.error('解析油价数据失败:', e);
      }
    }
    
    // 默认数据
    return {
      prices: { '92': '--', '95': '--', '98': '--', '0': '--' },
      trend: { description: '' },
      nextAdjustment: ''
    };
  }

  _getProvince(provinceEntity) {
    if (provinceEntity) {
      return provinceEntity.state || '北京市';
    }
    return '北京市';
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

  _renderFooter(trend, nextAdjustment) {
    let footerText = '';
    
    if (trend.description && trend.description !== '请稍候...' && trend.description !== '历史数据') {
      const cleanTrend = trend.description.replace('下次油价', '').replace('调整', '').trim();
      footerText += cleanTrend;
    }
    
    if (nextAdjustment && nextAdjustment !== '暂无调整信息') {
      if (!trend.description.includes(nextAdjustment.replace('下次油价', '').replace('调整', '').trim())) {
        if (footerText) footerText += ' • ';
        footerText += nextAdjustment;
      }
    }
    
    if (footerText) {
      return `<div class="card-footer">${footerText}</div>`;
    }
    
    return '';
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .oil-price-card {
        ${this._responsivePadding('16px', '12px')}
        ${this._responsiveHeight('200px', '180px')}
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
        margin-bottom: 12px;
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
      
      .card-footer {
        font-size: 0.85em;
        opacity: 0.8;
        text-align: center;
        padding-top: 8px;
        border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.1);
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
        
        .card-footer {
          font-size: 0.8em;
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