// src/cards/dashboard.js
import { renderBlocks } from '../core/block-renderer.js';

export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '可配置的仪表盘，支持多种布局',
    icon: '📊',
    category: '信息',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    layout: {
      type: 'select',
      label: '布局方式',
      options: [
        { value: 'grid', label: '网格布局' },
        { value: 'list', label: '列表布局' },
        { value: 'compact', label: '紧凑布局' }
      ],
      default: 'grid'
    },
    columns: {
      type: 'number',
      label: '网格列数',
      min: 1,
      max: 6,
      default: 3,
      visibleWhen: (config) => config.layout === 'grid'
    },
    gap: {
      type: 'select',
      label: '间距大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    },
    showBlockNames: {
      type: 'boolean',
      label: '显示块名称',
      default: true
    },
    cardTitle: {
      type: 'text',
      label: '卡片标题',
      placeholder: '可选标题'
    }
  },
  
  template: (config, data, context) => {
    const blocks = config.blocks || {};
    const blockCount = Object.keys(blocks).length;
    
    // 如果没有块，显示空状态
    if (blockCount === 0) {
      return `
        <div class="dashboard-card empty">
          <div class="empty-icon">📊</div>
          <div class="empty-text">暂无数据块</div>
          <div class="empty-hint">请在编辑器中添加数据块</div>
        </div>
      `;
    }
    
    // 标题
    const titleHtml = config.cardTitle ? 
      `<div class="dashboard-title">${escapeHtml(config.cardTitle)}</div>` : '';
    
    // 使用统一的块渲染函数
    const blocksHtml = context.renderBlocks(blocks);
    
    return `
      <div class="dashboard-card layout-${config.layout} gap-${config.gap}">
        ${titleHtml}
        <div class="dashboard-content columns-${config.columns}">
          ${blocksHtml}
        </div>
      </div>
    `;
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  },
  
  styles: (config, theme) => {
    // 间距映射
    const gapMap = {
      small: '8px',
      medium: '12px',
      large: '16px'
    };
    
    const gap = gapMap[config.gap] || '12px';
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: ${gap};
      }
      
      .dashboard-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: ${gap};
        padding-bottom: 8px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .dashboard-content {
        display: grid;
        gap: ${gap};
        height: calc(100% - 40px);
      }
      
      /* 网格布局 */
      .layout-grid .dashboard-content {
        grid-template-columns: repeat(${config.columns}, 1fr);
      }
      
      /* 列表布局 */
      .layout-list .dashboard-content {
        grid-template-columns: 1fr;
      }
      
      /* 紧凑布局 */
      .layout-compact .dashboard-content {
        grid-template-columns: repeat(${config.columns}, 1fr);
      }
      
      .layout-compact .cardforge-block {
        padding: 8px;
        min-height: 50px;
      }
      
      .layout-compact .block-icon {
        font-size: 1.2em;
      }
      
      .layout-compact .block-name {
        font-size: 0.8em;
        margin-bottom: 2px;
      }
      
      .layout-compact .block-value {
        font-size: 1em;
      }
      
      /* 空状态 */
      .dashboard-card.empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1.1em;
        margin-bottom: 8px;
      }
      
      .empty-hint {
        font-size: 0.9em;
        opacity: 0.7;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 800px) {
        .layout-grid .dashboard-content,
        .layout-compact .dashboard-content {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .layout-grid .dashboard-content,
        .layout-compact .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-card {
          padding: 12px;
        }
        
        .layout-grid .dashboard-content,
        .layout-list .dashboard-content,
        .layout-compact .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .cardforge-block {
          flex-direction: row;
          text-align: left;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .dashboard-card {
          padding: 8px;
        }
        
        .cardforge-block {
          padding: 10px;
        }
        
        .block-icon {
          font-size: 1.3em;
        }
        
        .block-name {
          font-size: 0.85em;
        }
        
        .block-value {
          font-size: 1.1em;
        }
      }
    `;
  },
  
  layout: {
    type: 'grid',
    recommendedSize: 4
  }
};

export class DashboardCard {
  static card = card;
}
