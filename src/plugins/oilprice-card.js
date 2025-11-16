// src/plugins/oilprice-card.js
import { BasePlugin } from '../core/base-plugin.js';

class OilPriceCard extends BasePlugin {
  static manifest = {
    id: 'oilprice-card',
    name: '油价信息',
    version: '1.0.0',
    description: '显示各省市油价信息和调价趋势',
    category: 'information',
    icon: '⛽',
    author: 'CardForge',
    
    config_schema: {
      // 显示配置
      show_province: {
        type: 'boolean',
        label: '显示省份',
        default: true,
        description: '显示油价所属省份'
      },
      
      show_trend: {
        type: 'boolean',
        label: '显示价格趋势',
        default: true,
        description: '显示油价涨跌趋势箭头'
      },
      
      show_next_adjustment: {
        type: 'boolean',
        label: '显示下次调价',
        default: true,
        description: '显示下次调价窗口期'
      },
      
      show_update_time: {
        type: 'boolean',
        label: '显示更新时间',
        default: true,
        description: '显示油价数据更新时间'
      },
      
      // 布局配置
      layout_style: {
        type: 'select',
        label: '布局风格',
        options: ['standard', 'compact', 'detailed', 'minimal'],
        default: 'standard',
        description: '选择油价卡片的布局风格'
      },
      
      // 油品显示配置
      show_diesel: {
        type: 'boolean',
        label: '显示0#柴油',
        default: true,
        description: '显示0号柴油价格'
      },
      
      show_92: {
        type: 'boolean',
        label: '显示92#汽油',
        default: true,
        description: '显示92号汽油价格'
      },
      
      show_95: {
        type: 'boolean',
        label: '显示95#汽油',
        default: true,
        description: '显示95号汽油价格'
      },
      
      show_98: {
        type: 'boolean',
        label: '显示98#汽油',
        default: true,
        description: '显示98号汽油价格'
      },
      
      // 颜色配置
      use_color_coding: {
        type: 'boolean',
        label: '使用颜色编码',
        default: true,
        description: '使用颜色表示价格涨跌'
      }
    },
    
    entity_requirements: [
      {
        key: 'province',
        description: '省份名称',
        required: true,
        suggested: 'sensor.oilprice_province'
      },
      {
        key: 'diesel_0',
        description: '0#柴油价格',
        required: false,
        suggested: 'sensor.oilprice_diesel_0'
      },
      {
        key: 'gasoline_92',
        description: '92#汽油价格',
        required: true,
        suggested: 'sensor.oilprice_92'
      },
      {
        key: 'gasoline_95',
        description: '95#汽油价格',
        required: true,
        suggested: 'sensor.oilprice_95'
      },
      {
        key: 'gasoline_98',
        description: '98#汽油价格',
        required: false,
        suggested: 'sensor.oilprice_98'
      },
      {
        key: 'price_trend',
        description: '油价趋势',
        required: false,
        suggested: 'sensor.oilprice_trend'
      },
      {
        key: 'next_adjustment',
        description: '下次调价窗口期',
        required: false,
        suggested: 'sensor.oilprice_next_adjustment'
      },
      {
        key: 'update_time',
        description: '更新时间',
        required: false,
        suggested: 'sensor.oilprice_update_time'
      }
    ]
  };

  // 获取趋势图标
  _getTrendIcon(trend) {
    const trendMap = {
      'up': '📈',
      'down': '📉',
      'stable': '➡️',
      'rise': '📈',
      'fall': '📉',
      'unchanged': '➡️'
    };
    
    return trendMap[trend] || '➡️';
  }

  // 获取趋势颜色
  _getTrendColor(trend, useColor = true) {
    if (!useColor) return 'var(--cf-text-primary)';
    
    const colorMap = {
      'up': 'var(--cf-error-color)',
      'down': 'var(--cf-success-color)',
      'stable': 'var(--cf-text-secondary)',
      'rise': 'var(--cf-error-color)',
      'fall': 'var(--cf-success-color)',
      'unchanged': 'var(--cf-text-secondary)'
    };
    
    return colorMap[trend] || 'var(--cf-text-secondary)';
  }

  // 获取趋势文本
  _getTrendText(trend) {
    const textMap = {
      'up': '上涨',
      'down': '下降',
      'stable': '持平',
      'rise': '上涨',
      'fall': '下降',
      'unchanged': '持平'
    };
    
    return textMap[trend] || '未知';
  }

  // 格式化价格
  _formatPrice(price) {
    if (!price) return '--';
    const num = parseFloat(price);
    return isNaN(num) ? price : num.toFixed(2);
  }

  // 渲染标准布局
  _renderStandardLayout(config, entities) {
    const showProvince = config.show_province !== false;
    const showTrend = config.show_trend !== false;
    const showNextAdjustment = config.show_next_adjustment !== false;
    const showUpdateTime = config.show_update_time !== false;
    const useColorCoding = config.use_color_coding !== false;

    const province = this._getCardValue(this.hass, entities, 'province', '全国');
    const trend = this._getCardValue(this.hass, entities, 'price_trend', 'stable');
    const nextAdjustment = this._getCardValue(this.hass, entities, 'next_adjustment', '');
    const updateTime = this._getCardValue(this.hass, entities, 'update_time', '');

    const dieselPrice = config.show_diesel ? this._getCardValue(this.hass, entities, 'diesel_0', '') : null;
    const gasoline92 = config.show_92 ? this._getCardValue(this.hass, entities, 'gasoline_92', '') : null;
    const gasoline95 = config.show_95 ? this._getCardValue(this.hass, entities, 'gasoline_95', '') : null;
    const gasoline98 = config.show_98 ? this._getCardValue(this.hass, entities, 'gasoline_98', '') : null;

    const trendIcon = this._getTrendIcon(trend);
    const trendColor = this._getTrendColor(trend, useColorCoding);
    const trendText = this._getTrendText(trend);

    return `
      <div class="oilprice-standard">
        <!-- 头部信息 -->
        <div class="oilprice-header">
          ${showProvince ? `
            <div class="province-info">
              <span class="province-icon">📍</span>
              <span class="province-name">${province}</span>
            </div>
          ` : ''}
          
          ${showTrend ? `
            <div class="trend-info" style="color: ${trendColor}">
              <span class="trend-icon">${trendIcon}</span>
              <span class="trend-text">${trendText}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- 油价表格 -->
        <div class="price-table">
          ${dieselPrice ? `
            <div class="price-row diesel-row">
              <div class="fuel-type">
                <span class="fuel-icon">🛢️</span>
                <span class="fuel-name">0#柴油</span>
              </div>
              <div class="fuel-price">${this._formatPrice(dieselPrice)} 元/升</div>
            </div>
          ` : ''}
          
          ${gasoline92 ? `
            <div class="price-row gasoline-92-row">
              <div class="fuel-type">
                <span class="fuel-icon">⛽</span>
                <span class="fuel-name">92#汽油</span>
              </div>
              <div class="fuel-price">${this._formatPrice(gasoline92)} 元/升</div>
            </div>
          ` : ''}
          
          ${gasoline95 ? `
            <div class="price-row gasoline-95-row">
              <div class="fuel-type">
                <span class="fuel-icon">⛽</span>
                <span class="fuel-name">95#汽油</span>
              </div>
              <div class="fuel-price">${this._formatPrice(gasoline95)} 元/升</div>
            </div>
          ` : ''}
          
          ${gasoline98 ? `
            <div class="price-row gasoline-98-row">
              <div class="fuel-type">
                <span class="fuel-icon">⛽</span>
                <span class="fuel-name">98#汽油</span>
              </div>
              <div class="fuel-price">${this._formatPrice(gasoline98)} 元/升</div>
            </div>
          ` : ''}
        </div>
        
        <!-- 底部信息 -->
        <div class="oilprice-footer">
          ${showNextAdjustment && nextAdjustment ? `
            <div class="next-adjustment">
              <span class="adjustment-icon">📅</span>
              <span class="adjustment-text">下次调价: ${nextAdjustment}</span>
            </div>
          ` : ''}
          
          ${showUpdateTime && updateTime ? `
            <div class="update-time">
              <span class="time-icon">🕒</span>
              <span class="time-text">更新: ${updateTime}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 渲染紧凑布局
  _renderCompactLayout(config, entities) {
    const showProvince = config.show_province !== false;
    const showTrend = config.show_trend !== false;
    const useColorCoding = config.use_color_coding !== false;

    const province = this._getCardValue(this.hass, entities, 'province', '全国');
    const trend = this._getCardValue(this.hass, entities, 'price_trend', 'stable');
    
    const dieselPrice = config.show_diesel ? this._getCardValue(this.hass, entities, 'diesel_0', '') : null;
    const gasoline92 = config.show_92 ? this._getCardValue(this.hass, entities, 'gasoline_92', '') : null;
    const gasoline95 = config.show_95 ? this._getCardValue(this.hass, entities, 'gasoline_95', '') : null;
    const gasoline98 = config.show_98 ? this._getCardValue(this.hass, entities, 'gasoline_98', '') : null;

    const trendIcon = this._getTrendIcon(trend);
    const trendColor = this._getTrendColor(trend, useColorCoding);

    return `
      <div class="oilprice-compact">
        <div class="compact-header">
          ${showProvince ? `
            <div class="compact-province">${province}油价</div>
          ` : ''}
          ${showTrend ? `
            <div class="compact-trend" style="color: ${trendColor}">${trendIcon}</div>
          ` : ''}
        </div>
        
        <div class="compact-prices">
          ${gasoline92 ? `
            <div class="compact-price-item">
              <div class="compact-fuel-name">92#</div>
              <div class="compact-price">${this._formatPrice(gasoline92)}</div>
            </div>
          ` : ''}
          
          ${gasoline95 ? `
            <div class="compact-price-item">
              <div class="compact-fuel-name">95#</div>
              <div class="compact-price">${this._formatPrice(gasoline95)}</div>
            </div>
          ` : ''}
          
          ${dieselPrice ? `
            <div class="compact-price-item">
              <div class="compact-fuel-name">0#</div>
              <div class="compact-price">${this._formatPrice(dieselPrice)}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 渲染详细布局
  _renderDetailedLayout(config, entities) {
    const showProvince = config.show_province !== false;
    const showTrend = config.show_trend !== false;
    const showNextAdjustment = config.show_next_adjustment !== false;
    const showUpdateTime = config.show_update_time !== false;
    const useColorCoding = config.use_color_coding !== false;

    const province = this._getCardValue(this.hass, entities, 'province', '全国');
    const trend = this._getCardValue(this.hass, entities, 'price_trend', 'stable');
    const nextAdjustment = this._getCardValue(this.hass, entities, 'next_adjustment', '');
    const updateTime = this._getCardValue(this.hass, entities, 'update_time', '');

    const dieselPrice = config.show_diesel ? this._getCardValue(this.hass, entities, 'diesel_0', '') : null;
    const gasoline92 = config.show_92 ? this._getCardValue(this.hass, entities, 'gasoline_92', '') : null;
    const gasoline95 = config.show_95 ? this._getCardValue(this.hass, entities, 'gasoline_95', '') : null;
    const gasoline98 = config.show_98 ? this._getCardValue(this.hass, entities, 'gasoline_98', '') : null;

    const trendIcon = this._getTrendIcon(trend);
    const trendColor = this._getTrendColor(trend, useColorCoding);
    const trendText = this._getTrendText(trend);

    return `
      <div class="oilprice-detailed">
        <div class="detailed-header">
          <div class="detailed-title">
            <span class="title-icon">⛽</span>
            <span class="title-text">油价信息</span>
          </div>
          
          ${showProvince ? `
            <div class="detailed-province">
              <span class="province-badge">${province}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="detailed-content">
          <!-- 趋势信息 -->
          ${showTrend ? `
            <div class="trend-card" style="border-left-color: ${trendColor}">
              <div class="trend-card-icon">${trendIcon}</div>
              <div class="trend-card-content">
                <div class="trend-card-title">价格趋势</div>
                <div class="trend-card-value" style="color: ${trendColor}">${trendText}</div>
              </div>
            </div>
          ` : ''}
          
          <!-- 价格网格 -->
          <div class="price-grid">
            ${gasoline92 ? `
              <div class="price-card">
                <div class="price-card-header">
                  <span class="fuel-icon-small">⛽</span>
                  <span class="fuel-name-small">92#汽油</span>
                </div>
                <div class="price-card-value">${this._formatPrice(gasoline92)}</div>
                <div class="price-card-unit">元/升</div>
              </div>
            ` : ''}
            
            ${gasoline95 ? `
              <div class="price-card">
                <div class="price-card-header">
                  <span class="fuel-icon-small">⛽</span>
                  <span class="fuel-name-small">95#汽油</span>
                </div>
                <div class="price-card-value">${this._formatPrice(gasoline95)}</div>
                <div class="price-card-unit">元/升</div>
              </div>
            ` : ''}
            
            ${dieselPrice ? `
              <div class="price-card">
                <div class="price-card-header">
                  <span class="fuel-icon-small">🛢️</span>
                  <span class="fuel-name-small">0#柴油</span>
                </div>
                <div class="price-card-value">${this._formatPrice(dieselPrice)}</div>
                <div class="price-card-unit">元/升</div>
              </div>
            ` : ''}
            
            ${gasoline98 ? `
              <div class="price-card">
                <div class="price-card-header">
                  <span class="fuel-icon-small">⛽</span>
                  <span class="fuel-name-small">98#汽油</span>
                </div>
                <div class="price-card-value">${this._formatPrice(gasoline98)}</div>
                <div class="price-card-unit">元/升</div>
              </div>
            ` : ''}
          </div>
          
          <!-- 附加信息 -->
          <div class="additional-info">
            ${showNextAdjustment && nextAdjustment ? `
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span class="info-label">下次调价:</span>
                <span class="info-value">${nextAdjustment}</span>
              </div>
            ` : ''}
            
            ${showUpdateTime && updateTime ? `
              <div class="info-item">
                <span class="info-icon">🕒</span>
                <span class="info-label">更新时间:</span>
                <span class="info-value">${updateTime}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染极简布局
  _renderMinimalLayout(config, entities) {
    const gasoline92 = config.show_92 ? this._getCardValue(this.hass, entities, 'gasoline_92', '') : null;
    const gasoline95 = config.show_95 ? this._getCardValue(this.hass, entities, 'gasoline_95', '') : null;

    if (!gasoline92 && !gasoline95) return '<div class="oilprice-minimal">暂无油价数据</div>';

    return `
      <div class="oilprice-minimal">
        <div class="minimal-prices">
          ${gasoline92 ? `
            <div class="minimal-price">
              <span class="minimal-label">92#</span>
              <span class="minimal-value">${this._formatPrice(gasoline92)}</span>
            </div>
          ` : ''}
          
          ${gasoline95 ? `
            <div class="minimal-price">
              <span class="minimal-label">95#</span>
              <span class="minimal-value">${this._formatPrice(gasoline95)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getTemplate(config, hass, entities) {
    this.hass = hass;
    const layoutStyle = config.layout_style || 'standard';

    let layoutHTML = '';
    
    switch (layoutStyle) {
      case 'compact':
        layoutHTML = this._renderCompactLayout(config, entities);
        break;
      case 'detailed':
        layoutHTML = this._renderDetailedLayout(config, entities);
        break;
      case 'minimal':
        layoutHTML = this._renderMinimalLayout(config, entities);
        break;
      default:
        layoutHTML = this._renderStandardLayout(config, entities);
    }

    return `
      <div class="cardforge-responsive-container oilprice-card layout-${layoutStyle}">
        <div class="cardforge-content-grid">
          ${layoutHTML}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutStyle = config.layout_style || 'standard';
    const useColorCoding = config.use_color_coding !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .oilprice-card {
        padding: var(--cf-spacing-lg);
        min-height: 180px;
      }
      
      /* ===== 标准布局样式 ===== */
      .oilprice-standard {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        height: 100%;
      }
      
      .oilprice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .province-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .province-icon {
        font-size: 1.1em;
      }
      
      .trend-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
        font-size: 0.9em;
        font-weight: 500;
      }
      
      .price-table {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        flex: 1;
      }
      
      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
      }
      
      .diesel-row {
        border-left-color: #8B4513;
      }
      
      .gasoline-92-row {
        border-left-color: #FF6B6B;
      }
      
      .gasoline-95-row {
        border-left-color: #4ECDC4;
      }
      
      .gasoline-98-row {
        border-left-color: #45B7D1;
      }
      
      .fuel-type {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .fuel-price {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      .oilprice-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }
      
      .next-adjustment,
      .update-time {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
      }
      
      /* ===== 紧凑布局样式 ===== */
      .oilprice-compact {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        height: 100%;
        justify-content: center;
      }
      
      .compact-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .compact-province {
        font-weight: 600;
        color: var(--cf-text-primary);
        font-size: 1.1em;
      }
      
      .compact-trend {
        font-size: 1.2em;
      }
      
      .compact-prices {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--cf-spacing-sm);
      }
      
      .compact-price-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-xs);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-radius: var(--cf-radius-md);
        text-align: center;
      }
      
      .compact-fuel-name {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-weight: 500;
      }
      
      .compact-price {
        font-size: 1.3em;
        font-weight: 700;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      /* ===== 详细布局样式 ===== */
      .oilprice-detailed {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        height: 100%;
      }
      
      .detailed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .detailed-title {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .province-badge {
        background: var(--cf-primary-color);
        color: white;
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        font-size: 0.85em;
        font-weight: 500;
      }
      
      .detailed-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        flex: 1;
      }
      
      .trend-card {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid;
      }
      
      .trend-card-icon {
        font-size: 1.5em;
      }
      
      .trend-card-content {
        flex: 1;
      }
      
      .trend-card-title {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .trend-card-value {
        font-size: 1.1em;
        font-weight: 600;
      }
      
      .price-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }
      
      .price-card {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-radius: var(--cf-radius-md);
        text-align: center;
        border: 1px solid var(--cf-border);
      }
      
      .price-card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xs);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .price-card-value {
        font-size: 1.4em;
        font-weight: 700;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      .price-card-unit {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
      
      .additional-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }
      
      .info-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .info-label {
        font-weight: 500;
      }
      
      .info-value {
        color: var(--cf-text-primary);
        font-weight: 500;
      }
      
      /* ===== 极简布局样式 ===== */
      .oilprice-minimal {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      
      .minimal-prices {
        display: flex;
        gap: var(--cf-spacing-xl);
        align-items: baseline;
      }
      
      .minimal-price {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-xs);
      }
      
      .minimal-label {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        font-weight: 500;
      }
      
      .minimal-value {
        font-size: 1.8em;
        font-weight: 700;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
      }
      
      /* ===== 响应式优化 ===== */
      @media (max-width: 600px) {
        .oilprice-card {
          padding: var(--cf-spacing-md);
        }
        
        .oilprice-header {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          align-items: flex-start;
        }
        
        .oilprice-footer {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          align-items: flex-start;
        }
        
        .compact-prices {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .price-grid {
          grid-template-columns: 1fr;
        }
        
        .minimal-prices {
          gap: var(--cf-spacing-lg);
        }
        
        .minimal-value {
          font-size: 1.5em;
        }
      }
      
      @media (max-width: 400px) {
        .compact-prices {
          grid-template-columns: 1fr;
        }
        
        .minimal-prices {
          flex-direction: column;
          gap: var(--cf-spacing-md);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .price-row,
        .compact-price-item,
        .price-card {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .trend-card {
          background: rgba(255, 255, 255, 0.03);
        }
      }
    `;
  }
}

export default OilPriceCard;
export const manifest = OilPriceCard.manifest;