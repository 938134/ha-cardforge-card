// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  version: '1.5.0',
  description: '紧凑布局的油价显示，支持灵活数据源配置',
  author: 'CardForge Team',
  category: 'info',
  icon: '⛽',
  dataSourceRequirements: [
    {
      key: 'province_source',
      description: '省份来源（实体ID或Jinja2模板）',
      required: false
    },
    {
      key: 'price_0_source',
      description: '0号柴油价格来源',
      required: false
    },
    {
      key: 'price_92_source',
      description: '92号汽油价格来源',
      required: false
    },
    {
      key: 'price_95_source',
      description: '95号汽油价格来源',
      required: false
    },
    {
      key: 'price_98_source',
      description: '98号汽油价格来源',
      required: false
    },
    {
      key: 'trend_source',
      description: '油价趋势来源',
      required: false
    },
    {
      key: 'next_adjustment_source',
      description: '下次调整时间来源',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class OilPriceCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    // 使用统一数据获取方法
    const province = this._getCardValue(hass, entities, 'province_source', '全国');
    const price0 = this._getCardValue(hass, entities, 'price_0_source', '--');
    const price92 = this._getCardValue(hass, entities, 'price_92_source', '--');
    const price95 = this._getCardValue(hass, entities, 'price_95_source', '--');
    const price98 = this._getCardValue(hass, entities, 'price_98_source', '--');
    const trend = this._getCardValue(hass, entities, 'trend_source', '');
    const nextAdjustment = this._getCardValue(hass, entities, 'next_adjustment_source', '');
    
    const hasTrendInfo = trend || nextAdjustment;
    
    return `
      <div class="cardforge-card oil-price-card theme-${config.theme || 'auto'}">
        <div class="card-header">
          <div class="card-icon">⛽</div>
          <div class="card-title">${province}油价</div>
        </div>
        
        <div class="price-grid">
          ${this._renderFuelCard('92', price92, 'gas-92')}
          ${this._renderFuelCard('95', price95, 'gas-95')}
          ${this._renderFuelCard('98', price98, 'gas-98')}
          ${this._renderFuelCard('0', price0, 'diesel-0')}
        </div>
        
        ${hasTrendInfo ? `
          <div class="trend-info">
            ${trend ? `<div class="trend">${this._formatTrend(trend)}</div>` : ''}
            ${nextAdjustment ? `<div class="adjustment">${this._formatAdjustment(nextAdjustment)}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderFuelCard(type, price, fuelClass) {
    const isDefaultValue = price === '--' || !price;
    return `
      <div class="fuel-card ${fuelClass} ${isDefaultValue ? 'no-data' : ''}">
        <span class="fuel-type">${type}#</span>
        <span class="fuel-price">${price}</span>
        <span class="fuel-unit">元/升</span>
      </div>
    `;
  }

  _formatTrend(trendText) {
    // ... 保持原有格式化逻辑不变 ...
    let cleanTrend = trendText.replace('目前预计', '').replace('下次油价', '').replace('调整', '').replace(/[【】]/g, '').trim();
    const downMatch = cleanTrend.match(/下调\s*(\d+)\s*元\/吨/);
    const upMatch = cleanTrend.match(/上调\s*(\d+)\s*元\/吨/);
    const noChange = cleanTrend.includes('搁浅') || cleanTrend.includes('不变');
    
    if (downMatch) {
      const amount = downMatch[1];
      return `📉 下调 ${amount}元/吨`;
    } else if (upMatch) {
      const amount = upMatch[1];
      return `📈 上调 ${amount}元/吨`;
    } else if (noChange) {
      return `➡️ 油价搁浅`;
    } else {
      return `📊 ${cleanTrend}`;
    }
  }

  _formatAdjustment(adjustmentText) {
    // ... 保持原有格式化逻辑不变 ...
    let cleanAdjustment = adjustmentText.replace('下次油价', '').replace('调整', '').replace(/[【】]/g, '').trim();
    const dateMatch = cleanAdjustment.match(/(\d+月\d+日)\s*(\d+时)?/);
    if (dateMatch) {
      const date = dateMatch[1];
      const time = dateMatch[2] || '24时';
      return `⏰ ${date}${time}调整`;
    }
    return `⏰ ${cleanAdjustment}`;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .oil-price-card {
        ${this._responsivePadding('var(--cardforge-spacing-md)', 'var(--cardforge-spacing-sm)')}
        ${this._responsiveHeight('160px', '140px')}
        ${this._flexColumn()}
      }
      
      .card-header {
        ${this._flexRow()}
        ${this._responsiveGap('var(--cardforge-spacing-xs)', '4px')}
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-sm)', '0 0 var(--cardforge-spacing-xs)')}
        flex-shrink: 0;
      }
      
      .card-icon {
        font-size: 1.1em;
      }
      
      .card-title {
        font-weight: 600;
        ${this._responsiveFontSize('1em', '0.9em')}
        color: var(--primary-text-color);
      }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        ${this._responsiveGap('var(--cardforge-spacing-xs)', '4px')}
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-sm)', '0 0 var(--cardforge-spacing-xs)')}
        flex: 1;
      }
      
      .fuel-card {
        ${this._borderRadius('var(--cardforge-radius-md)')}
        ${this._boxShadow('light')}
        ${this._flexColumn()}
        ${this._textCenter()}
        ${this._flexCenter()}
        padding: var(--cardforge-spacing-sm) 4px;
        min-height: 50px;
        transition: all var(--cardforge-duration-fast) ease;
        position: relative;
        overflow: hidden;
        border: 1px solid transparent;
        color: white;
      }
      
      /* 油品颜色主题 */
      .fuel-card.gas-92 {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        border-color: rgba(37, 99, 235, 0.4);
      }
      
      .fuel-card.gas-95 {
        background: linear-gradient(135deg, #059669, #047857);
        border-color: rgba(5, 150, 105, 0.4);
      }
      
      .fuel-card.gas-98 {
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        border-color: rgba(124, 58, 237, 0.4);
      }
      
      .fuel-card.diesel-0 {
        background: linear-gradient(135deg, #d97706, #b45309);
        border-color: rgba(217, 119, 6, 0.4);
      }
      
      .fuel-card.no-data {
        background: linear-gradient(135deg, #4b5563, #374151) !important;
        opacity: 0.6;
        border-color: rgba(75, 85, 99, 0.3) !important;
      }
      
      .fuel-card:hover {
        transform: translateY(-2px) scale(1.03);
        ${this._boxShadow('medium')}
        border-color: rgba(255, 255, 255, 0.6);
      }
      
      .fuel-type {
        ${this._responsiveFontSize('10px', '9px')}
        opacity: 0.9;
        ${this._responsiveMargin('0 0 2px', '0 0 1px')}
        font-weight: 600;
        ${this._textShadow()}
        letter-spacing: 0.5px;
      }
      
      .fuel-price {
        ${this._responsiveFontSize('14px', '12px')}
        font-weight: 800;
        line-height: 1.1;
        ${this._responsiveMargin('0 0 1px', '0')}
        letter-spacing: 0.3px;
        ${this._textShadow()}
      }
      
      .fuel-unit {
        ${this._responsiveFontSize('8px', '7px')}
        opacity: 0.9;
        font-weight: 500;
        ${this._textShadow()}
      }
      
      .trend-info {
        margin-top: auto;
        padding-top: var(--cardforge-spacing-xs);
        border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.1);
        ${this._flexColumn()}
        ${this._responsiveGap('2px', '1px')}
        flex-shrink: 0;
      }
      
      .trend, .adjustment {
        ${this._responsiveFontSize('9px', '8px')}
        opacity: 0.8;
        ${this._flexRow()}
        ${this._responsiveGap('3px', '2px')}
        line-height: 1.2;
      }
      
      /* 超小屏幕布局优化 */
      @media (max-width: 360px) {
        .price-grid {
          grid-template-columns: repeat(2, 1fr);
          ${this._responsiveGap('var(--cardforge-spacing-xs)', '4px')}
        }
        
        .fuel-card {
          min-height: 55px;
          padding: var(--cardforge-spacing-xs) 3px;
        }
        
        .trend-info {
          padding-top: 4px;
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
