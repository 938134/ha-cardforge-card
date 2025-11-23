// src/editors/dashboard/layout-presets.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class LayoutPresets extends LitElement {
  static properties = {
    selectedLayout: { type: String },
    blocks: { type: Array } // 新增：用于显示使用情况
  };

  static styles = [
    designSystem,
    css`
      .layout-selector {
        width: 100%;
      }

      .layout-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        gap: var(--cf-spacing-sm);
        width: 100%;
      }

      .layout-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        min-height: 50px;
        text-align: center;
        position: relative;
      }

      .layout-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .layout-name {
        font-size: 0.75em;
        font-weight: 500;
        line-height: 1.2;
      }

      .layout-item.selected .layout-name {
        color: white;
      }

      .usage-info {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6em;
        font-weight: 600;
      }

      .layout-item.selected .usage-info {
        background: white;
        color: var(--cf-primary-color);
      }

      .layout-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-sm);
        text-align: center;
      }

      /* 紧凑模式 */
      @media (max-width: 768px) {
        .layout-grid {
          grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
          gap: var(--cf-spacing-xs);
        }

        .layout-item {
          min-height: 45px;
          padding: 4px;
        }

        .layout-name {
          font-size: 0.7em;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .layout-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }
    `
  ];

  constructor() {
    super();
    this.blocks = [];
  }

  render() {
    return html`
      <div class="layout-selector">
        <div class="layout-grid">
          ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => {
            const usageInfo = this._getLayoutUsage(key);
            return html`
              <div 
                class="layout-item ${this.selectedLayout === key ? 'selected' : ''}"
                @click=${() => this._selectLayout(key)}
                title="${preset.name} - ${usageInfo.used}/${usageInfo.total} 位置已使用"
              >
                <div class="layout-name">${preset.cols}×${preset.rows}</div>
                ${usageInfo.used > 0 ? html`
                  <div class="usage-info">${usageInfo.used}</div>
                ` : ''}
              </div>
            `;
          })}
        </div>
        <div class="layout-description">
          布局仅影响内容区域的块，标题和页脚块不受影响
        </div>
      </div>
    `;
  }

  _getLayoutUsage(layout) {
    const contentBlocks = this.blocks.filter(block => 
      !block.config?.blockType || block.config.blockType === 'content'
    );
    
    const gridConfig = BlockManager.LAYOUT_PRESETS[layout];
    const usedPositions = new Set();
    
    contentBlocks.forEach(block => {
      if (block.position) {
        usedPositions.add(`${block.position.row},${block.position.col}`);
      }
    });
    
    const totalPositions = gridConfig.rows * gridConfig.cols;
    
    return {
      used: usedPositions.size,
      total: totalPositions,
      percent: totalPositions > 0 ? Math.round((usedPositions.size / totalPositions) * 100) : 0
    };
  }

  _selectLayout(layout) {
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: { layout }
    }));
  }
}

if (!customElements.get('layout-presets')) {
  customElements.define('layout-presets', LayoutPresets);
}