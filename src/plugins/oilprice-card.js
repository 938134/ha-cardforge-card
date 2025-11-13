// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  version: '1.4.0',
  description: '显示各省市实时油价信息，支持灵活数据源配置',
  author: 'CardForge Team',
  category: 'info',
  icon: '⛽',
  entityRequirements: [
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
      <div class="cardforge-card oil-price-card">
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
    let cleanTrend = trendText
      .replace('目前预计', '')
      .replace('下次油价', '')
      .replace('调整', '')
      .replace(/[【】]/g, '')
      .trim();
    
    const downMatch = cleanTrend.match(/下调\s*(\d+)\s*元\/吨/);
    const upMatch = cleanTrend.match(/上调\s*(\d+)\s*元\/吨/);
    const noChange = cleanTrend.includes('搁浅') || cleanTrend.includes('不变');
    
    if (downMatch) {
      const amount = downMatch[1];
      const literMatch = cleanTrend.match(/(\d+\.\d+)元\/升-(\d+\.\d+)元\/升/);
      if (literMatch) {
        const minPrice = literMatch[1];
        const maxPrice = literMatch[2];
        return `📉 预计下调 ${amount}元/吨 (${minPrice}-${maxPrice}元/升)`;
      } else {
        return `📉 预计下调 ${amount}元/吨`;
      }
    } else if (upMatch) {
      const amount = upMatch[1];
      const literMatch = cleanTrend.match(/(\d+\.\d+)元\/升-(\d+\.\d+)元\/升/);
      if (literMatch) {
        const minPrice = literMatch[1];
        const maxPrice = literMatch[2];
        return `📈 预计上调 ${amount}元/吨 (${minPrice}-${maxPrice}元/升)`;
      } else {
        return `📈 预计上调 ${amount}元/吨`;
      }
    } else if (noChange) {
      return `➡️ 油价预计搁浅`;
    } else if (cleanTrend.includes('上涨')) {
      return `📈 ${cleanTrend}`;
    } else if (cleanTrend.includes('下跌')) {
      return `📉 ${cleanTrend}`;
    } else {
      return `📊 ${cleanTrend}`;
    }
  }

  _formatAdjustment(adjustmentText) {
    let cleanAdjustment = adjustmentText
      .replace('下次油价', '')
      .replace('调整', '')
      .replace(/[【】]/g, '')
      .trim();
    
    const dateMatch = cleanAdjustment.match(/(\d+月\d+日)\s*(\d+时)?/);
    if (dateMatch) {
      const date = dateMatch[1];
      const time = dateMatch[2] || '24时';
      
      const now = new Date();
      const adjustmentDate = this._parseChineseDate(date);
      const daysUntilAdjustment = Math.ceil((adjustmentDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilAdjustment <= 3 && daysUntilAdjustment >= 0) {
        if (daysUntilAdjustment === 0) {
          return `🚨 今日${time}调整`;
        } else if (daysUntilAdjustment === 1) {
          return `⚠️ 明天${time}调整`;
        } else {
          return `⏰ ${date}${time}调整 (${daysUntilAdjustment}天后)`;
        }
      } else {
        return `⏰ ${date}${time}调整`;
      }
    }
    
    return `⏰ ${cleanAdjustment}`;
  }

  _parseChineseDate(dateStr) {
    const match = dateStr.match(/(\d+)月(\d+)日/);
    if (match) {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      const now = new Date();
      const year = now.getFullYear();
      
      const adjustmentYear = (month < now.getMonth() + 1) ? year + 1 : year;
      
      return new Date(adjustmentYear, month - 1, day);
    }
    return new Date();
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .oil-price-card {
        ${this._responsivePadding('16px', '12px')}
        ${this._responsiveHeight('200px', '180px')}
        ${this._flexColumn()}
      }
      
      .card-header {
        ${this._flexRow()}
        ${this._responsiveGap('8px', '6px')}
        ${this._responsiveMargin('0 0 16px', '0 0 12px')}
        flex-shrink: 0;
      }
      
      .card-icon {
        font-size: 1.2em;
      }
      
      .card-title {
        font-weight: 600;
        ${this._responsiveFontSize('1.1em', '1em')}
        color: var(--primary-text-color);
      }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        ${this._responsiveGap('10px', '8px')}
        ${this._responsiveMargin('0 0 12px', '0 0 10px')}
        flex: 1;
      }
      
      .fuel-card {
        ${this._borderRadius('12px')}
        ${this._boxShadow('medium')}
        ${this._flexColumn()}
        ${this._textCenter()}
        ${this._flexCenter()}
        padding: 12px 8px;
        min-height: 70px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: 2px solid transparent;
        color: white;
      }
      
      /* 油品颜色主题 */
      .fuel-card.gas-92 {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-color: rgba(59, 130, 246, 0.3);
      }
      
      .fuel-card.gas-95 {
        background: linear-gradient(135deg, #10b981, #047857);
        border-color: rgba(16, 185, 129, 0.3);
      }
      
      .fuel-card.gas-98 {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        border-color: rgba(139, 92, 246, 0.3);
      }
      
      .fuel-card.diesel-0 {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border-color: rgba(245, 158, 11, 0.3);
      }
      
      .fuel-card.no-data {
        background: linear-gradient(135deg, #6b7280, #4b5563) !important;
        opacity: 0.7;
        border-color: rgba(107, 114, 128, 0.3) !important;
      }
      
      .fuel-card:hover {
        transform: translateY(-3px) scale(1.02);
        ${this._boxShadow('strong')}
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      .fuel-type {
        ${this._responsiveFontSize('12px', '11px')}
        opacity: 0.9;
        ${this._responsiveMargin('0 0 4px', '0 0 3px')}
        font-weight: 600;
        ${this._textShadow()}
      }
      
      .fuel-price {
        ${this._responsiveFontSize('18px', '16px')}
        font-weight: 800;
        line-height: 1.2;
        ${this._responsiveMargin('0 0 2px', '0 0 1px')}
        letter-spacing: 0.5px;
        ${this._textShadow()}
      }
      
      .fuel-unit {
        ${this._responsiveFontSize('10px', '9px')}
        opacity: 0.9;
        font-weight: 500;
        ${this._textShadow()}
      }
      
      .fuel-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s ease;
      }
      
      .fuel-card:hover::before {
        left: 100%;
      }
      
      .trend-info {
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.1);
        ${this._flexColumn()}
        ${this._responsiveGap('4px', '3px')}
        flex-shrink: 0;
      }
      
      .trend, .adjustment {
        ${this._responsiveFontSize('11px', '10px')}
        opacity: 0.8;
        ${this._flexRow()}
        ${this._responsiveGap('4px', '3px')}
        line-height: 1.3;
      }
      
      /* 超小屏幕布局 */
      @media (max-width: 360px) {
        .price-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .fuel-card {
          min-height: 75px;
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