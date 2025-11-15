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
        return `📉 下调 ${amount}元/吨 (${minPrice}-${maxPrice}元/升)`;
      } else {
        return `📉 下调 ${amount}元/吨`;
      }
    } else if (upMatch) {
      const amount = upMatch[1];
      const literMatch = cleanTrend.match(/(\d+\.\d+)元\/升-(\d+\.\d+)元\/升/);
      if (literMatch) {
        const minPrice = literMatch[1];
        const maxPrice = literMatch[2];
        return `📈 上调 ${amount}元/吨 (${minPrice}-${maxPrice}元/升)`;
      } else {
        return `📈 上调 ${amount}元/吨`;
      }
    } else if (noChange) {
      return `➡️ 油价搁浅`;
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
        ${this._responsiveHeight('140px', '120px')} /* 降低高度 */
        ${this._responsivePadding('12px', '10px')}
        ${this._flexColumn()}
      }
      
      .card-header {
        ${this._flexRow()}
        ${this._responsiveGap('6px', '4px')}
        ${this._responsiveMargin('0 0 10px', '0 0 8px')} /* 减小间距 */
        flex-shrink: 0;
      }
      
      .card-icon {
        font-size: 1.1em;
      }
      
      .card-title {
        font-weight: 600;
        ${this._responsiveFontSize('0.95em', '0.85em')} /* 调整字体大小 */
        color: var(--primary-text-color);
      }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        ${this._responsiveGap('6px', '4px')}
        ${this._responsiveMargin('0 0 6px', '0 0 4px')} /* 减小间距 */
        flex: 1;
      }
      
      .fuel-card {
        ${this._borderRadius('6px')} /* 减小圆角 */
        ${this._boxShadow('light')}
        ${this._flexColumn()}
        ${this._textCenter()}
        ${this._flexCenter()}
        padding: 6px 3px; /* 减小内边距 */
        min-height: 45px; /* 减小最小高度 */
        transition: all 0.2s ease;
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
        transform: translateY(-1px) scale(1.02); /* 减小悬停效果 */
        ${this._boxShadow('medium')}
        border-color: rgba(255, 255, 255, 0.6);
      }
      
      .fuel-type {
        ${this._responsiveFontSize('9px', '8px')} /* 调整字体大小 */
        opacity: 0.9;
        ${this._responsiveMargin('0 0 1px', '0 0 0px')} /* 减小间距 */
        font-weight: 600;
        ${this._textShadow()}
        letter-spacing: 0.5px;
      }
      
      .fuel-price {
        ${this._responsiveFontSize('12px', '10px')} /* 调整字体大小 */
        font-weight: 800;
        line-height: 1.1;
        ${this._responsiveMargin('0 0 0px', '0')} /* 移除间距 */
        letter-spacing: 0.3px;
        ${this._textShadow()}
      }
      
      .fuel-unit {
        ${this._responsiveFontSize('7px', '6px')} /* 调整字体大小 */
        opacity: 0.9;
        font-weight: 500;
        ${this._textShadow()}
      }
      
      /* 精简光泽效果 */
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
          rgba(255, 255, 255, 0.15),
          transparent
        );
        transition: left 0.4s ease;
      }
      
      .fuel-card:hover::before {
        left: 100%;
      }
      
      .trend-info {
        margin-top: auto;
        padding-top: 4px; /* 减小内边距 */
        border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.1);
        ${this._flexColumn()}
        ${this._responsiveGap('2px', '1px')}
        flex-shrink: 0;
      }
      
      .trend, .adjustment {
        ${this._responsiveFontSize('8px', '7px')} /* 调整字体大小 */
        opacity: 0.8;
        ${this._flexRow()}
        ${this._responsiveGap('3px', '2px')}
        line-height: 1.2;
      }
      
      /* 超小屏幕布局优化 */
      @media (max-width: 360px) {
        .price-grid {
          grid-template-columns: repeat(2, 1fr);
          ${this._responsiveGap('6px', '4px')}
        }
        
        .fuel-card {
          min-height: 40px; /* 减小最小高度 */
          padding: 4px 2px; /* 减小内边距 */
        }
        
        .trend-info {
          padding-top: 2px; /* 减小内边距 */
        }
      }
      
      /* 紧凑模式 - 移除趋势信息时的额外优化 */
      .oil-price-card:not(:has(.trend-info)) {
        ${this._responsiveHeight('120px', '100px')} /* 进一步降低高度 */
      }
      
      .oil-price-card:not(:has(.trend-info)) .price-grid {
        ${this._responsiveMargin('0', '0')}
      }
      
      /* 毛玻璃主题优化 */
      .oil-price-card.glass .fuel-card {
        backdrop-filter: blur(12px); /* 减小模糊度 */
        -webkit-backdrop-filter: blur(12px);
        border-width: 1px;
      }
      
      /* 霓虹主题优化 */
      .oil-price-card.neon .fuel-card {
        ${this._boxShadow('neon')}
        border-width: 1px;
      }
      
      .oil-price-card.neon .fuel-card:hover {
        box-shadow: 
          0 0 6px currentColor, /* 减小阴影 */
          0 0 12px rgba(255, 255, 255, 0.4);
      }
      
      /* 无数据状态的优化 */
      .fuel-card.no-data .fuel-price {
        opacity: 0.7;
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