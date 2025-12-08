import { BaseCard } from '../core/base-card.js';
import { html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { BlockBase } from '../blocks/block-base.js';

/**
 * 仪表盘卡片 - 三段式布局的仪表盘卡片
 */
export class DashboardCard extends BaseCard {
  static properties = {
    ...BaseCard.properties,
    _blocksByArea: { state: true }
  };

  // 卡片配置模式
  static schema = {
    // 标题区域
    showHeader: {
      type: 'boolean',
      label: '显示标题区域',
      default: true
    },
    headerAlign: {
      type: 'select',
      label: '标题对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left'
    },
    
    // 内容区域
    contentLayout: {
      type: 'select',
      label: '内容布局模式',
      options: [
        { value: 'flow', label: '横向流式' },
        { value: 'stack', label: '纵向堆叠' },
        { value: 'grid-2', label: '网格2列' },
        { value: 'grid-3', label: '网格3列' },
        { value: 'grid-4', label: '网格4列' }
      ],
      default: 'flow'
    },
    contentBlockStyle: {
      type: 'select',
      label: '块样式',
      options: [
        { value: 'compact', label: '紧凑样式' },
        { value: 'horizontal', label: '水平样式' },
        { value: 'vertical', label: '垂直样式' }
      ],
      default: 'compact'
    },
    
    // 页脚区域
    showFooter: {
      type: 'boolean',
      label: '显示页脚区域',
      default: false
    },
    footerAlign: {
      type: 'select',
      label: '页脚对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'right'
    },
    
    // 通用设置
    spacing: {
      type: 'select',
      label: '间距大小',
      options: [
        { value: 'compact', label: '紧凑' },
        { value: 'normal', label: '正常' },
        { value: 'relaxed', label: '宽松' }
      ],
      default: 'normal'
    }
  };

  // 块配置
  static blocksConfig = {
    type: 'custom',
    areas: ['header', 'content', 'footer']
  };

  // 卡片元数据
  static meta = {
    name: '仪表盘',
    description: '三段式布局的仪表盘卡片，支持多区域块管理',
    icon: '📊',
    category: '布局',
    tags: ['仪表盘', '布局', '多区域'],
    recommendedSize: 6
  };

  // 卡片特有样式
  static styles = [
    BaseCard.styles,
    css`
      .dashboard-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 200px;
      }

      /* 区域通用样式 */
      .dashboard-area {
        display: flex;
        align-items: center;
        transition: all var(--cf-transition-normal);
      }

      .area-content {
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
      }

      /* 间距配置 */
      .spacing-compact .dashboard-area {
        padding: var(--cf-spacing-sm);
      }

      .spacing-normal .dashboard-area {
        padding: var(--cf-spacing-md);
      }

      .spacing-relaxed .dashboard-area {
        padding: var(--cf-spacing-lg);
      }

      /* 对齐方式 */
      .align-left .area-content {
        justify-content: flex-start;
      }

      .align-center .area-content {
        justify-content: center;
      }

      .align-right .area-content {
        justify-content: flex-end;
      }

      /* 标题区域 */
      .header-area {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        border-bottom: 1px solid var(--cf-border);
        min-height: 60px;
      }

      .header-area .block-base {
        margin: 0 var(--cf-spacing-sm);
      }

      /* 内容区域 */
      .content-area {
        flex: 1;
        min-height: 80px;
        overflow: auto;
      }

      /* 布局模式 */
      .layout-flow .area-content {
        flex-wrap: wrap;
        gap: var(--cf-spacing-md);
        justify-content: center;
      }

      .layout-stack .area-content {
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .layout-grid-2 .area-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }

      .layout-grid-3 .area-content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--cf-spacing-md);
      }

      .layout-grid-4 .area-content {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--cf-spacing-md);
      }

      /* 块样式 */
      .block-style-compact .block-base {
        min-width: 120px;
      }

      .block-style-horizontal .block-base {
        min-width: 180px;
      }

      .block-style-vertical .block-base {
        min-width: 100px;
      }

      /* 页脚区域 */
      .footer-area {
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-top: 1px solid var(--cf-border);
        min-height: 50px;
      }

      .footer-area .block-base {
        margin: 0 var(--cf-spacing-sm);
      }

      /* 空区域提示 */
      .empty-area {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        font-style: italic;
        width: 100%;
        padding: var(--cf-spacing-lg);
        text-align: center;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .header-area {
          min-height: 50px;
        }

        .footer-area {
          min-height: 45px;
        }

        .layout-grid-3 .area-content,
        .layout-grid-4 .area-content {
          grid-template-columns: repeat(2, 1fr);
        }

        .block-style-compact .block-base,
        .block-style-horizontal .block-base,
        .block-style-vertical .block-base {
          min-width: auto;
        }
      }

      @container cardforge-container (max-width: 480px) {
        .dashboard-area {
          padding: var(--cf-spacing-sm) !important;
        }

        .layout-grid-2 .area-content,
        .layout-grid-3 .area-content,
        .layout-grid-4 .area-content {
          grid-template-columns: 1fr;
        }

        .layout-flow .area-content {
          justify-content: center;
        }

        .header-area,
        .footer-area {
          min-height: 40px;
        }

        .header-area .block-base,
        .footer-area .block-base {
          margin: 0 var(--cf-spacing-xs);
        }
      }

      @container cardforge-container (max-width: 320px) {
        .dashboard-card {
          min-height: 150px;
        }

        .content-area {
          min-height: 60px;
        }
      }

      /* 滚动条样式 */
      .content-area::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .content-area::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--cf-radius-sm);
      }

      .content-area::-webkit-scrollbar-thumb {
        background: rgba(var(--cf-primary-color-rgb), 0.3);
        border-radius: var(--cf-radius-sm);
      }

      .content-area::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--cf-primary-color-rgb), 0.5);
      }
    `
  ];

  constructor() {
    super();
    this._blocksByArea = {
      header: [],
      content: [],
      footer: []
    };
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._groupBlocksByArea();
    }
  }

  /**
   * 按区域分组块
   */
  _groupBlocksByArea() {
    const blocks = this.config?.blocks || {};
    const grouped = {
      header: [],
      content: [],
      footer: []
    };

    Object.entries(blocks).forEach(([blockId, blockConfig]) => {
      const area = blockConfig.area || 'content';
      if (grouped[area]) {
        grouped[area].push({
          id: blockId,
          ...blockConfig
        });
      }
    });

    this._blocksByArea = grouped;
  }

  /**
   * 处理卡片数据
   */
  async processCardData() {
    const {
      showHeader = true,
      headerAlign = 'left',
      contentLayout = 'flow',
      contentBlockStyle = 'compact',
      showFooter = false,
      footerAlign = 'right',
      spacing = 'normal'
    } = this.config;

    return {
      showHeader,
      headerAlign,
      contentLayout,
      contentBlockStyle,
      showFooter,
      footerAlign,
      spacing,
      blocksByArea: this._blocksByArea
    };
  }

  /**
   * 渲染块列表
   */
  _renderBlocks(blocks, area, layout, blockStyle) {
    if (blocks.length === 0) {
      return html`
        <div class="empty-area">
          ${area === 'header' ? '标题区域 - 可在此添加块' :
            area === 'footer' ? '页脚区域 - 可在此添加块' :
            '内容区域 - 请在此添加块'}
        </div>
      `;
    }

    return blocks.map(block => html`
      <block-base
        class="dashboard-block"
        .block=${block}
        .hass=${this.hass}
        .showName=${true}
        .showValue=${true}
        .compact=${blockStyle === 'compact'}
        ?horizontal=${blockStyle === 'horizontal'}
        ?vertical=${blockStyle === 'vertical'}
        style=${area === 'content' ? 
          `grid-column: span 1;` : ''}
      ></block-base>
    `);
  }

  /**
   * 渲染卡片内容
   */
  renderCardContent() {
    const {
      showHeader,
      headerAlign,
      contentLayout,
      contentBlockStyle,
      showFooter,
      footerAlign,
      spacing,
      blocksByArea
    } = this.renderData;

    return html`
      <div class="dashboard-card spacing-${spacing}">
        <!-- 标题区域 -->
        ${showHeader ? html`
          <div class="dashboard-area header-area align-${headerAlign}">
            <div class="area-content">
              ${this._renderBlocks(blocksByArea.header, 'header', 'horizontal', 'horizontal')}
            </div>
          </div>
        ` : ''}

        <!-- 内容区域 -->
        <div class="dashboard-area content-area layout-${contentLayout} block-style-${contentBlockStyle}">
          <div class="area-content">
            ${this._renderBlocks(blocksByArea.content, 'content', contentLayout, contentBlockStyle)}
          </div>
        </div>

        <!-- 页脚区域 -->
        ${showFooter ? html`
          <div class="dashboard-area footer-area align-${footerAlign}">
            <div class="area-content">
              ${this._renderBlocks(blocksByArea.footer, 'footer', 'horizontal', 'horizontal')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    const blockCount = Object.keys(this.config?.blocks || {}).length;
    return Math.min(Math.max(3, Math.ceil(blockCount / 2)), 8);
  }
}

// 注册卡片
if (!customElements.get('dashboard-card')) {
  customElements.define('dashboard-card', DashboardCard);
}

// 导出卡片类供卡片系统使用
export default DashboardCard;
