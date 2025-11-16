// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

class OilPriceCard extends BasePlugin {
  static manifest = {
    id: 'oilprice-card',
    name: '油价卡片',
    version: '1.0.0',
    description: '紧凑布局的油价信息卡片，支持多油品显示',
    category: 'life',
    icon: '⛽',
    author: 'CardForge Team',
    
    config_schema: {
      // 布局配置
      layout_mode: {
        type: 'select',
        label: '布局模式',
        options: ['auto', 'compact', 'detailed'],
        default: 'auto',
        description: '选择油品显示布局方式'
      },
      
      show_province: {
        type: 'boolean',
        label: '显示省份',
        default: true,
        description: '显示省份信息'
      },
      
      show_trend: {
        type: 'boolean',
        label: '显示走势',
        default: true,
        description: '显示油价走势信息'
      },
      
      show_next_adjust: {
        type: 'boolean',
        label: '显示调价时间',
        default: true,
        description: '显示下次调价时间'
      },
      
      // 样式配置
      price_emphasis: {
        type: 'select',
        label: '价格强调',
        options: ['none', 'highlight_92', 'highlight_95'],
        default: 'highlight_92',
        description: '选择要强调的油品价格'
      },
      
      compact_style: {
        type: 'select',
        label: '紧凑样式',
        options: ['minimal', 'bordered', 'card'],
        default: 'bordered',
        description: '油品项的显示样式'
      }
    },
    
    entity_requirements: [
      {
        key: 'province',
        description: '省份',
        required: false,
        type: 'string'
      },
      {
        key: 'diesel_0',
        description: '0号柴油价格',
        required: false,
        type: 'string'
      },
      {
        key: 'gasoline_92',
        description: '92号汽油价格',
        required: false,
        type: 'string'
      },
      {
        key: 'gasoline_95',
        description: '95号汽油价格',
        required: false,
        type: 'string'
      },
      {
        key: 'gasoline_98',
        description: '98号汽油价格',
        required: false,
        type: 'string'
      },
      {
        key: 'next_adjust',
        description: '下次调价时间',
        required: false,
        type: 'string'
      },
      {
        key: 'trend',
        description: '油价走势',
        required: false,
        type: 'string'
      }
    ]
  };

  // 默认油价数据
  _getDefaultOilPrice() {
    return {
      province: '浙江',
      diesel_0: '6.57',
      gasoline_92: '6.92',
      gasoline_95: '7.36',
      gasoline_98: '8.86',
      next_adjust: '11月24日24时',
      trend: '目前预计下调70元/吨(0.05元/升-0.06元/升)'
    };
  }

  // 解析油价数据
  _parseOilPriceData(entities) {
    const defaultData = this._getDefaultOilPrice();
    
    return {
      province: this._getEntityValue(entities, 'province', defaultData.province),
      diesel_0: this._getEntityValue(entities, 'diesel_0', defaultData.diesel_0),
      gasoline_92: this._getEntityValue(entities, 'gasoline_92', defaultData.gasoline_92),
      gasoline_95: this._getEntityValue(entities, 'gasoline_95', defaultData.gasoline_95),
      gasoline_98: this._getEntityValue(entities, 'gasoline_98', defaultData.gasoline_98),
      next_adjust: this._getEntityValue(entities, 'next_adjust', defaultData.next_adjust),
      trend: this._getEntityValue(entities, 'trend', defaultData.trend)
    };
  }

  // 格式化价格显示
  _formatPrice(price) {
    if (!price) return '-';
    const num = this._safeParseFloat(price);
    return isNaN(num) ? price : num.toFixed(2);
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

    const layoutMode = config.layout_mode || 'auto';
    const showProvince = config.show_province !== false;
    const showTrend = config.show_trend !== false;
    const showNextAdjust = config.show_next_adjust !== false;
    const priceEmphasis = config.price_emphasis || 'highlight_92';
    const compactStyle = config.compact_style || 'bordered';

    const isDownward = this._isDownwardTrend(oilData.trend);
    const isUpward = this._isUpwardTrend(oilData.trend);

    // 油品数据数组
    const oilProducts = [
      { type: 'diesel_0', name: '0号柴油', price: oilData.diesel_0, icon: '🛢️' },
      { type: 'gasoline_92', name: '92号', price: oilData.gasoline_92, icon: '⛽' },
      { type: 'gasoline_95', name: '95号', price: oilData.gasoline_95, icon: '⛽' },
      { type: 'gasoline_98', name: '98号', price: oilData.gasoline_98, icon: '🔥' }
    ].filter(product => product.price); // 只显示有数据的油品

    return `
      <div class="cardforge-responsive-container oilprice-card layout-${layoutMode}">
        <div class="cardforge-content-grid">
          <!-- 头部信息 -->
          <div class="oilprice-header">
            ${showProvince && oilData.province ? `
              <div class="province-info">
                <div class="province-icon">📍</div>
                <div class="province-name">${oilData.province}油价</div>
              </div>
            ` : ''}
            
            ${showNextAdjust && oilData.next_adjust ? `
              <div class="adjust-time">
                <span class="adjust-label">下次调价:</span>
                <span class="adjust-value">${oilData.next_adjust}</span>
              </div>
            ` : ''}
          </div>

          <!-- 油品价格网格 -->
          <div class="oilprice-grid compact-${compactStyle}">
            ${oilProducts.map(product => html`
              <div class="oil-item ${product.type} ${priceEmphasis === `highlight_${product.type.split('_')[1]}` ? 'emphasized' : ''}">
                <div class="oil-icon">${product.icon}</div>
                <div class="oil-info">
                  <div class="oil-name">${product.name}</div>
                  <div class="oil-price">${this._formatPrice(product.price)}<span class="price-unit">元</span></div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 走势信息 -->
          ${showTrend && oilData.trend ? `
            <div class="trend-section ${isDownward ? 'trend-down' : ''} ${isUpward ? 'trend-up' : ''}">
              <div class="trend-icon">${isDownward ? '📉' : isUpward ? '📈' : '➡️'}</div>
              <div class="trend-text">${this._renderSafeHTML(oilData.trend)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutMode = config.layout_mode || 'auto';
    const compactStyle = config.compact_style || 'bordered';
    const priceEmphasis = config.price_emphasis || 'highlight_92';

    return `
      ${this.getBaseStyles(config)}
      
      .oilprice-card {
        padding: var(--cf-spacing-lg);
      }
      
      /* 头部信息 */
      .oilprice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-md);
        flex-wrap: wrap;
        gap: var(--cf-spacing-sm);
      }
      
      .province-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }
      
      .province-icon {
        font-size: 1.1em;
      }
      
      .province-name {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .adjust-time {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }
      
      .adjust-label {
        opacity: 0.8;
      }
      
      .adjust-value {
        font-weight: 500;
        margin-left: 4px;
      }
      
      /* 油品网格布局 */
      .oilprice-grid {
        display: grid;
        gap: var(--cf-spacing-sm);
        margin: var(--cf-spacing-md) 0;
      }
      
      /* 自动布局：根据容器宽度自适应 */
      .layout-auto .oilprice-grid {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      }
      
      /* 紧凑布局：强制4列，不够宽度时自动换行 */
      .layout-compact .oilprice-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      
      /* 详细布局：2x2网格 */
      .layout-detailed .oilprice-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }
      
      /* 油品项样式 */
      .oil-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-md);
        transition: all 0.2s ease;
        text-align: center;
      }
      
      .oil-item.emphasized {
        transform: scale(1.05);
        z-index: 1;
      }
      
      /* 紧凑样式变体 */
      .compact-minimal .oil-item {
        background: transparent;
        padding: var(--cf-spacing-xs);
      }
      
      .compact-bordered .oil-item {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .compact-card .oil-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .oil-item.emphasized.compact-card {
        box-shadow: var(--cf-shadow-md);
        border-color: var(--cf-primary-color);
      }
      
      /* 油品图标和文字 */
      .oil-icon {
        font-size: 1.4em;
        margin-bottom: 4px;
        line-height: 1;
      }
      
      .oil-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .oil-name {
        font-size: 0.75em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        margin-bottom: 2px;
        line-height: 1.2;
      }
      
      .oil-price {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }
      
      .price-unit {
        font-size: 0.7em;
        font-weight: normal;
        margin-left: 1px;
        opacity: 0.8;
      }
      
      /* 强调样式 */
      .oil-item.emphasized .oil-price {
        color: var(--cf-primary-color);
        font-size: 1.1em;
      }
      
      .gasoline_92.emphasized .oil-icon,
      .gasoline_95.emphasized .oil-icon {
        animation: pump-pulse 2s ease-in-out infinite;
      }
      
      @keyframes pump-pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
      
      /* 走势信息 */
      .trend-section {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
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
        font-size: 0.85em;
        line-height: 1.3;
        color: var(--cf-text-secondary);
        flex: 1;
      }
      
      .trend-down .trend-text {
        color: var(--cf-success-color);
      }
      
      .trend-up .trend-text {
        color: var(--cf-error-color);
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .oilprice-card {
          padding: var(--cf-spacing-md);
        }
        
        .oilprice-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--cf-spacing-xs);
        }
        
        /* 移动端自动调整为2列 */
        .layout-auto .oilprice-grid,
        .layout-compact .oilprice-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .oil-item {
          padding: var(--cf-spacing-xs);
        }
        
        .oil-icon {
          font-size: 1.2em;
        }
        
        .oil-name {
          font-size: 0.7em;
        }
        
        .oil-price {
          font-size: 0.9em;
        }
        
        .trend-section {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        }
        
        .trend-text {
          font-size: 0.8em;
        }
      }
      
      @media (max-width: 400px) {
        .oilprice-card {
          padding: var(--cf-spacing-sm);
        }
        
        .oilprice-grid {
          gap: var(--cf-spacing-xs);
        }
        
        .oil-item {
          padding: 6px 4px;
        }
        
        .oil-icon {
          font-size: 1.1em;
          margin-bottom: 2px;
        }
        
        .oil-name {
          font-size: 0.65em;
        }
        
        .oil-price {
          font-size: 0.85em;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .compact-bordered .oil-item {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .trend-section {
          background: rgba(255, 255, 255, 0.05);
        }
      }
      
      /* 主题适配 */
      .theme-glass .compact-bordered .oil-item {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      
      .theme-glass .trend-section {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
      }
    `;
  }
}

export default OilPriceCard;
export const manifest = OilPriceCard.manifest;