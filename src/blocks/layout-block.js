// src/blocks/layout-block.js
import { BaseBlock } from '../core/base-block.js';

class LayoutBlock extends BaseBlock {
  getTemplate(config, hass) {
    const layoutType = config.layout || 'vertical';
    
    return this._renderBlockContainer(`
      <div class="layout-content ${layoutType}">
        <div class="layout-placeholder">
          <ha-icon icon="mdi:view-grid-plus"></ha-icon>
          <div>布局容器</div>
          <div class="cf-text-xs cf-text-secondary">${layoutType} 布局</div>
        </div>
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
          .layout-content.horizontal {
            display: flex;
            gap: var(--cf-spacing-md);
            height: 100%;
          }
        `;
        break;
      case 'grid':
        layoutStyles = `
          .layout-content.grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--cf-spacing-md);
            height: 100%;
          }
        `;
        break;
      default: // vertical
        layoutStyles = `
          .layout-content.vertical {
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
      
      .layout-placeholder {
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
