// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

class OilPriceCard extends BasePlugin {
  static manifest = {
    id: 'oilprice-card',
    name: '油价卡片',
    version: '1.0.0',
    description: '显示当前油价信息',
    category: '生活',
    icon: '⛽',
    entityRequirements: [
      {
        key: 'diesel_0',
        description: '0号柴油价格',
        required: false
      },
      {
        key: 'gasoline_92',
        description: '92号汽油价格',
        required: false
      },
      {
        key: 'gasoline_95',
        description: '95号汽油价格',
        required: false
      },
      {
        key: 'gasoline_98',
        description: '98号汽油价格',
        required: false
      },
      {
        key: 'window_period',
        description: '调价窗口期',
        required: false
      },
      {
        key: 'province',
        description: '省份',
        required: false
      },
      {
        key: 'trend',
        description: '价格走势',
        required: false
      }
    ]
  };

  // 默认油价数据
  _getDefaultOilPrice() {
    return {
      diesel_0: '6.57',
      gasoline_92: '6.92',
      gasoline_95: '7.36',
      gasoline_98: '8.86',
      window_period: '11月24日24时',
      province: '浙江',
      trend: '目前预计下调70元/吨(0.05元/升-0.06元/升)'
    };
  }

  // 解析油价数据
  _parseOilPriceData(entities) {
    const defaultData = this._getDefaultOilPrice();
    
    return {
      diesel_0: this._getEntityValue(entities, 'diesel_0', defaultData.diesel_0),
      gasoline_92: this._getEntityValue(entities, 'gasoline_92', defaultData.gasoline_92),
      gasoline_95: this._getEntityValue(entities, 'gasoline_95', defaultData.gasoline_95),
      gasoline_98: this._getEntityValue(entities, 'gasoline_98', defaultData.gasoline_98),
      window_period: this._getEntityValue(entities, 'window_period', defaultData.window_period),
      province: this._getEntityValue(entities, 'province', defaultData.province),
      trend: this._getEntityValue(entities, 'trend', defaultData.trend)
    };
  }

  // 格式化价格显示
  _formatPrice(price) {
    if (!price) return '-';
    const num = this._safeParseFloat(price);
    return isNaN(num) ? price : `${num} 元/升`;
  }

  // 判断是否为下调趋势
  _isDownwardTrend(trend) {
    return trend && (trend.includes('下调') || trend.includes('下降') || trend.includes('降低'));
  }

  // 判断是否为上调趋势
  _isUpwardTrend(trend) {
    return trend && (trend.includes('上调') || trend.includes('上涨') || trend.includes('增加'));
  }

  getTemplate(config, hass, entities) {
    const oilData = this._parseOilPriceData(entities);
    
    // 检查是否有油价数据
    const hasPriceData = oilData.diesel_0 || oilData.gasoline_92 || oilData.gasoline_95 || oilData.gasoline_98;
    
    if (!hasPriceData) {
      return this._renderError('油价数据不可用', '⛽');
    }

    const isDownward = this._isDownwardTrend(oilData.trend);
    const isUpward = this._isUpwardTrend(oilData.trend);

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn oilprice-card">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <!-- 标题区域 -->
            <div class="oilprice-header">
              <div class="cardforge-content-header">
                ${oilData.province ? `${oilData.province}油价` : '最新油价'}
              </div>
              ${oilData.window_period ? `
                <div class="cardforge-content-small oilprice-window">
                  调价窗口: ${this._renderSafeHTML(oilData.window_period)}
                </div>
              ` : ''}
            </div>

            <!-- 油价列表 -->
            <div class="oilprice-list cardforge-flex-column cardforge-gap-sm">
              ${oilData.diesel_0 ? `
                <div class="oilprice-item cardforge-flex-row cardforge-flex-between">
                  <span class="oiltype">0号柴油</span>
                  <span class="oilprice">${this._formatPrice(oilData.diesel_0)}</span>
                </div>
              ` : ''}
              
              ${oilData.gasoline_92 ? `
                <div class="oilprice-item cardforge-flex-row cardforge-flex-between">
                  <span class="oiltype">92号汽油</span>
                  <span class="oilprice">${this._formatPrice(oilData.gasoline_92)}</span>
                </div>
              ` : ''}
              
              ${oilData.gasoline_95 ? `
                <div class="oilprice-item cardforge-flex-row cardforge-flex-between">
                  <span class="oiltype">95号汽油</span>
                  <span class="oilprice">${this._formatPrice(oilData.gasoline_95)}</span>
                </div>
              ` : ''}
              
              ${oilData.gasoline_98 ? `
                <div class="oilprice-item cardforge-flex-row cardforge-flex-between">
                  <span class="oiltype">98号汽油</span>
                  <span class="oilprice">${this._formatPrice(oilData.gasoline_98)}</span>
                </div>
              ` : ''}
            </div>

            <!-- 走势信息 -->
            ${oilData.trend ? `
              <div class="oilprice-trend ${isDownward ? 'trend-down' : ''} ${isUpward ? 'trend-up' : ''}">
                <div class="trend-icon">${isDownward ? '📉' : isUpward ? '📈' : '➡️'}</div>
                <div class="trend-text cardforge-content-small">${this._renderSafeHTML(oilData.trend)}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .oilprice-card {
        text-align: left;
      }
      
      .oilprice-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .oilprice-window {
        ${this._cfColor('text-secondary')}
        margin-top: var(--cf-spacing-xs);
      }
      
      .oilprice-list {
        margin: var(--cf-spacing-md) 0;
      }
      
      .oilprice-item {
        padding: var(--cf-spacing-sm) 0;
        border-bottom: 1px solid rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .oilprice-item:last-child {
        border-bottom: none;
      }
      
      .oiltype {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text')}
        font-weight: 500;
      }
      
      .oilprice {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text')}
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      
      .oilprice-trend {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        margin-top: var(--cf-spacing-sm);
      }
      
      .trend-down {
        background: rgba(var(--cf-rgb-success), 0.1);
        border: 1px solid rgba(var(--cf-rgb-success), 0.2);
      }
      
      .trend-up {
        background: rgba(var(--cf-rgb-error), 0.1);
        border: 1px solid rgba(var(--cf-rgb-error), 0.2);
      }
      
      .trend-icon {
        font-size: 1.2em;
        flex-shrink: 0;
      }
      
      .trend-text {
        ${this._cfTextSize('xs')}
        line-height: 1.3;
        flex: 1;
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .oilprice-item {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        .oilprice-trend {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .trend-down {
          background: rgba(var(--cf-rgb-success), 0.15);
          border-color: rgba(var(--cf-rgb-success), 0.3);
        }
        
        .trend-up {
          background: rgba(var(--cf-rgb-error), 0.15);
          border-color: rgba(var(--cf-rgb-error), 0.3);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .oilprice-item {
          padding: var(--cf-spacing-xs) 0;
        }
        
        .oiltype,
        .oilprice {
          ${this._cfTextSize('xs')}
        }
        
        .oilprice-trend {
          padding: var(--cf-spacing-xs);
        }
        
        .trend-text {
          ${this._cfTextSize('xxs')}
        }
      }
      
      @media (max-width: 400px) {
        .oilprice-card {
          ${this._cfPadding('md')}
        }
        
        .oilprice-list {
          margin: var(--cf-spacing-sm) 0;
        }
      }
    `;
  }
}

export default OilPriceCard;
export const manifest = OilPriceCard.manifest;