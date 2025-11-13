// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  version: '1.2.0',
  description: '显示各省市实时油价信息，支持趋势和调价窗口显示',
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
    const province = this._getEntityState(entities.province_entity, '全国');
    const price0 = this._getEntityState(entities.price_0_entity, '--');
    const price92 = this._getEntityState(entities.price_92_entity, '--');
    const price95 = this._getEntityState(entities.price_95_entity, '--');
    const price98 = this._getEntityState(entities.price_98_entity, '--');
    const trend = this._getEntityState(entities.trend_entity, '');
    const nextAdjustment = this._getEntityState(entities.next_adjustment_entity, '');
    
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

  _getEntityState(entity, defaultValue = '') {
    return entity?.state || defaultValue;
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
    // 清理和提取关键信息
    let cleanTrend = trendText
      .replace('目前预计', '')
      .replace('下次油价', '')
      .replace('调整', '')
      .replace(/[【】]/g, '')
      .trim();
    
    // 提取调价金额和类型
    const downMatch = cleanTrend.match(/下调\s*(\d+)\s*元\/吨/);
    const upMatch = cleanTrend.match(/上调\s*(\d+)\s*元\/吨/);
    const noChange = cleanTrend.includes('搁浅') || cleanTrend.includes('不变');
    
    if (downMatch) {
      const amount = downMatch[1];
      // 提取升价变化范围
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
    // 清理和格式化调整时间
    let cleanAdjustment = adjustmentText
      .replace('下次油价', '')
      .replace('调整', '')
      .replace(/[【】]/g, '')
      .trim();
    
    // 提取日期和时间
    const dateMatch = cleanAdjustment.match(/(\d+月\d+日)\s*(\d+时)?/);
    if (dateMatch) {
      const date = dateMatch[1];
      const time = dateMatch[2] || '24时'; // 默认为24时
      
      // 判断是否即将调整（3天内）
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

  // 辅助方法：解析中文日期
  _parseChineseDate(dateStr) {
    const match = dateStr.match(/(\d+)月(\d+)日/);
    if (match) {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      const now = new Date();
      const year = now.getFullYear();
      
      // 如果月份小于当前月份，认为是明年
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
        display: flex;
        flex-direction: column;
      }
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        flex-shrink: 0;
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
        gap: 10px;
        margin-bottom: 12px;
        flex: 1;
      }
      
      .fuel-card {
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 12px 8px;
        min-height: 70px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: 2px solid transparent;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      /* 92号汽油 - 蓝色主题 */
      .fuel-card.gas-92 {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border-color: rgba(59, 130, 246, 0.3);
      }
      
      /* 95号汽油 - 绿色主题 */
      .fuel-card.gas-95 {
        background: linear-gradient(135deg, #10b981, #047857);
        color: white;
        border-color: rgba(16, 185, 129, 0.3);
      }
      
      /* 98号汽油 - 紫色主题 */
      .fuel-card.gas-98 {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: white;
        border-color: rgba(139, 92, 246, 0.3);
      }
      
      /* 0号柴油 - 橙色主题 */
      .fuel-card.diesel-0 {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        border-color: rgba(245, 158, 11, 0.3);
      }
      
      .fuel-card.no-data {
        background: linear-gradient(135deg, #6b7280, #4b5563) !important;
        opacity: 0.7;
        border-color: rgba(107, 114, 128, 0.3) !important;
      }
      
      .fuel-card:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      .fuel-card:active {
        transform: translateY(-1px) scale(1.01);
      }
      
      .fuel-type {
        font-size: 12px;
        opacity: 0.9;
        margin-bottom: 4px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      
      .fuel-price {
        font-size: 18px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 2px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        letter-spacing: 0.5px;
      }
      
      .fuel-unit {
        font-size: 10px;
        opacity: 0.9;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        font-weight: 500;
      }
      
      /* 添加光泽效果 */
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
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex-shrink: 0;
      }
      
      .trend, .adjustment {
        font-size: 11px;
        opacity: 0.8;
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1.3;
      }
      
      /* 响应式设计 */
      @media (max-width: 480px) {
        .price-grid {
          gap: 8px;
        }
        
        .fuel-card {
          padding: 10px 6px;
          min-height: 65px;
          border-radius: 10px;
        }
        
        .fuel-type {
          font-size: 11px;
        }
        
        .fuel-price {
          font-size: 16px;
        }
        
        .fuel-unit {
          font-size: 9px;
        }
        
        .trend, .adjustment {
          font-size: 10px;
        }
      }
      
      @media (max-width: 360px) {
        .price-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .fuel-card {
          min-height: 75px;
        }
        
        .trend-info {
          flex-direction: column;
          gap: 2px;
        }
      }
      
      /* 毛玻璃主题下的特殊效果 */
      .oil-price-card.glass .fuel-card {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-width: 1.5px;
      }
      
      /* 霓虹主题下的特殊效果 */
      .oil-price-card.neon .fuel-card {
        box-shadow: 
          0 0 10px currentColor,
          0 0 20px rgba(255, 255, 255, 0.3);
      }
      
      .oil-price-card.neon .fuel-card:hover {
        box-shadow: 
          0 0 15px currentColor,
          0 0 30px rgba(255, 255, 255, 0.5);
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