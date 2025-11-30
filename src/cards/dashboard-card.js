// src/cards/dashboard-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'dashboard-card',
  name: '仪表盘卡片',
  description: '可配置的仪表盘布局，支持多种布局和对齐方式',
  icon: '📊',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge',
  block_mode: 'custom', // 完全自定义模式
  config_schema: {
    show_header: {
      type: 'boolean',
      label: '显示标题',
      default: true
    },
    header_alignment: {
      type: 'select',
      label: '标题对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'center'
    },
    show_footer: {
      type: 'boolean',
      label: '显示页脚',
      default: true
    },
    footer_alignment: {
      type: 'select',
      label: '页脚对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'center'
    },
    content_layout: {
      type: 'select',
      label: '区域布局',
      options: [
        { value: 'single', label: '单列布局' },
        { value: 'double', label: '双列布局' },
        { value: 'triple', label: '三列布局' },
        { value: 'quad', label: '四列布局' },
        { value: 'grid-2x2', label: '2×2网格' },
        { value: 'grid-3x3', label: '3×3网格' },
        { value: 'custom', label: '自定义行列' }
      ],
      default: 'quad'
    },
    custom_rows: {
      type: 'number',
      label: '自定义行数',
      default: 1,
      min: 1,
      max: 4
    },
    custom_columns: {
      type: 'number', 
      label: '自定义列数',
      default: 4,
      min: 1,
      max: 4
    }
  }
};

export class DashboardCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig,
      // 空配置，用户按需添加块
      blocks: {}
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    const themeStyles = ''; // 可以根据需要添加主题样式
    
    return {
      template: this._renderTemplate(safeConfig, hass, entities),
      styles: this._renderStyles(safeConfig, themeStyles)
    };
  }

  _renderTemplate(config, hass, entities) {
    const headerContent = this._renderHeader(config);
    const contentContent = this._renderContent(config, hass, entities);
    const footerContent = this._renderFooter(config);

    return `
      <div class="cardforge-card ${CARD_CONFIG.id}">
        ${headerContent}
        ${contentContent}
        ${footerContent}
      </div>
    `;
  }

  _renderHeader(config) {
    if (!config.show_header) return '';

    const headerBlock = this._findBlockByArea(config.blocks, 'header');
    if (!headerBlock) return '';

    const alignmentClass = `header-${config.header_alignment || 'center'}`;
    const content = this._getBlockContent(headerBlock, null); // hass 在内容区域处理

    return `
      <div class="dashboard-header ${alignmentClass}">
        <div class="header-content">${this._escapeHtml(content)}</div>
      </div>
    `;
  }

  _renderContent(config, hass, entities) {
    const contentBlocks = this._getBlocksByArea(config.blocks, 'content');
    const layout = this._getContentLayout(config);

    if (contentBlocks.length === 0) {
      return `
        <div class="dashboard-content">
          <div class="empty-content">
            <div class="empty-icon">📊</div>
            <div class="empty-text">请添加内容块</div>
          </div>
        </div>
      `;
    }

    const blocksHtml = contentBlocks.map(block => 
      this._renderDashboardBlock(block, config.blocks[block], hass, entities)
    ).join('');

    return `
      <div class="dashboard-content">
        <div class="content-grid layout-${layout}">
          ${blocksHtml}
        </div>
      </div>
    `;
  }

  _renderDashboardBlock(blockId, blockConfig, hass, entities) {
    const content = this._getBlockContent(blockConfig, hass, entities);
    const style = blockConfig.style ? `style="${blockConfig.style}"` : '';

    return `
      <div class="dashboard-block" data-block-id="${blockId}" ${style}>
        ${blockConfig.icon ? `<div class="block-icon">${blockConfig.icon}</div>` : ''}
        <div class="block-content">${this._escapeHtml(content)}</div>
        ${blockConfig.unit ? `<div class="block-unit">${this._escapeHtml(blockConfig.unit)}</div>` : ''}
      </div>
    `;
  }

  _renderFooter(config) {
    if (!config.show_footer) return '';

    const footerBlock = this._findBlockByArea(config.blocks, 'footer');
    if (!footerBlock) return '';

    const alignmentClass = `footer-${config.footer_alignment || 'center'}`;
    const content = this._getBlockContent(footerBlock, null);

    return `
      <div class="dashboard-footer ${alignmentClass}">
        <div class="footer-content">${this._escapeHtml(content)}</div>
      </div>
    `;
  }

  _getContentLayout(config) {
    if (config.content_layout === 'custom') {
      return `custom-${config.custom_rows || 1}x${config.custom_columns || 4}`;
    }
    return config.content_layout || 'quad';
  }

  _findBlockByArea(blocks, area) {
    if (!blocks) return null;
    return Object.values(blocks).find(block => block.area === area);
  }

  _getBlocksByArea(blocks, area) {
    if (!blocks) return [];
    return Object.entries(blocks)
      .filter(([_, block]) => block.area === area)
      .map(([id]) => id);
  }

  _getBlockContent(blockConfig, hass, entities) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states?.[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 从实体映射获取内容
    if (entities && blockConfig.id && entities[blockConfig.id] && hass?.states[entities[blockConfig.id]]) {
      const entity = hass.states[entities[blockConfig.id]];
      return entity.state || entities[blockConfig.id];
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
    const layout = this._getContentLayout(config);

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 仪表盘整体样式 */
      .dashboard-card {
        display: flex;
        flex-direction: column;
        min-height: 200px;
      }
      
      /* 标题区域 */
      .dashboard-header {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
        background: var(--cf-surface);
      }
      
      .header-content {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .header-left { text-align: left; }
      .header-center { text-align: center; }
      .header-right { text-align: right; }
      
      /* 内容区域 */
      .dashboard-content {
        flex: 1;
        padding: var(--cf-spacing-lg);
        min-height: 120px;
      }
      
      .content-grid {
        display: grid;
        gap: 12px;
        height: 100%;
      }
      
      /* 布局定义 */
      .layout-single {
        grid-template-columns: 1fr;
      }
      
      .layout-double {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .layout-triple {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .layout-quad {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .layout-grid-2x2 {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
      }
      
      .layout-grid-3x3 {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
      }
      
      /* 自定义布局 */
      .layout-custom-1x1 { grid-template-columns: 1fr; }
      .layout-custom-1x2 { grid-template-columns: repeat(2, 1fr); }
      .layout-custom-1x3 { grid-template-columns: repeat(3, 1fr); }
      .layout-custom-1x4 { grid-template-columns: repeat(4, 1fr); }
      .layout-custom-2x1 { grid-template-columns: 1fr; grid-template-rows: repeat(2, 1fr); }
      .layout-custom-2x2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
      .layout-custom-2x3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); }
      .layout-custom-2x4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); }
      .layout-custom-3x1 { grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr); }
      .layout-custom-3x2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); }
      .layout-custom-3x3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
      .layout-custom-3x4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, 1fr); }
      .layout-custom-4x1 { grid-template-columns: 1fr; grid-template-rows: repeat(4, 1fr); }
      .layout-custom-4x2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, 1fr); }
      .layout-custom-4x3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(4, 1fr); }
      .layout-custom-4x4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
      
      /* 仪表盘块样式 */
      .dashboard-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        min-height: 80px;
        text-align: center;
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .block-icon {
        font-size: 1.5em;
        margin-bottom: 8px;
      }
      
      .block-content {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.3;
        margin-bottom: 4px;
      }
      
      .block-unit {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }
      
      /* 空状态 */
      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--cf-text-secondary);
        text-align: center;
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 0.95em;
      }
      
      /* 页脚区域 */
      .dashboard-footer {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        border-top: 1px solid var(--cf-border);
        background: var(--cf-surface);
        color: var(--cf-text-secondary);
        font-size: 0.9em;
      }
      
      .footer-left { text-align: left; }
      .footer-center { text-align: center; }
      .footer-right { text-align: right; }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .dashboard-content {
          padding: var(--cf-spacing-md);
        }
        
        .layout-quad,
        .layout-triple,
        .layout-custom-1x4,
        .layout-custom-1x3 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .layout-grid-3x3 {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: auto;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-content {
          padding: var(--cf-spacing-sm);
        }
        
        .content-grid {
          grid-template-columns: 1fr !important;
          gap: 8px;
        }
        
        .dashboard-block {
          min-height: 70px;
          padding: var(--cf-spacing-sm);
        }
        
        .block-content {
          font-size: 1.1em;
        }
        
        .dashboard-header,
        .dashboard-footer {
          padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .dashboard-block {
          min-height: 60px;
          padding: 8px;
        }
        
        .block-icon {
          font-size: 1.3em;
          margin-bottom: 6px;
        }
        
        .block-content {
          font-size: 1em;
        }
        
        .block-unit {
          font-size: 0.8em;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default DashboardCard;