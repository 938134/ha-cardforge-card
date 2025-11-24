// src/blocks/layout-block.js
import { BaseBlock } from '../core/base-block.js';

class LayoutBlock extends BaseBlock {
  getTemplate(config, hass) {
    const layoutType = config.layout || 'vertical';
    const childBlocks = config.blocks || [];
    
    return this._renderBlockContainer(`
      <div class="layout-container ${layoutType}">
        ${childBlocks.map(block => `
          <div class="layout-item">
            ${this._renderChildBlock(block, hass)}
          </div>
        `).join('')}
        
        ${childBlocks.length === 0 ? `
          <div class="layout-empty">
            <ha-icon icon="mdi:view-grid-plus"></ha-icon>
            <div>添加子块</div>
          </div>
        ` : ''}
      </div>
    `, 'layout-block');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    const layoutType = config.layout || 'vertical';
    
    let layoutStyles = '';
    
    switch (layoutType) {
      case 'horizontal':
        layoutStyles = `
          .layout-container.horizontal {
            display: flex;
            gap: var(--cf-spacing-md);
            height: 100%;
          }
          .layout-item {
            flex: 1;
          }
        `;
        break;
      case 'grid':
        layoutStyles = `
          .layout-container.grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--cf-spacing-md);
            height: 100%;
          }
        `;
        break;
      default: // vertical
        layoutStyles = `
          .layout-container.vertical {
            display: flex;
            flex-direction: column;
            gap: var(--cf-spacing-md);
            height: 100%;
          }
        `;
    }
    
    return `
      ${baseStyles}
      ${layoutStyles}
      
      .layout-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        height: 100%;
      }
      
      .child-block {
        height: 100%;
      }
    `;
  }

  _renderChildBlock(block, hass) {
    // 这里应该调用其他块的渲染逻辑
    // 简化实现，只显示块信息
    return `
      <div class="child-block">
        <div class="child-info">
          <strong>${block.type}</strong>
          <div>${JSON.stringify(block.config)}</div>
        </div>
      </div>
    `;
  }
}

LayoutBlock.manifest = {
  type: 'layout',
  name: '布局块',
  description: '用于组织其他块的布局容器',
  icon: '📐',
  category: 'layout',
  config_schema: {
    layout: {
      type: 'select',
      label: '布局方式',
      default: 'vertical',
      options: ['vertical', 'horizontal', 'grid']
    }
  }
};

export { LayoutBlock as default };