// src/blocks/types/layout-block.js
import { BaseBlock } from '../base-block.js';

class LayoutBlock extends BaseBlock {
  static blockType = 'layout';
  static blockName = '布局容器';
  static blockIcon = 'mdi:view-grid';
  static category = 'layout';
  static description = '嵌套布局容器';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const childBlocks = config.blocks || [];

    return this._renderContainer(`
      ${this._renderHeader(config.title)}
      <div class="layout-content ${config.layout}">
        ${childBlocks.length > 0 ? 
          childBlocks.map(child => this._renderChildBlock(child, hass)).join('') :
          this._renderEmptyState()
        }
      </div>
    `, 'layout-block');
  }

  getStyles(block) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    
    return `
      .layout-block .layout-content {
        flex: 1;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-radius: var(--cf-radius-sm);
        min-height: 100px;
      }

      .layout-block .layout-content.grid {
        display: grid;
        gap: var(--cf-spacing-sm);
        grid-template-columns: repeat(${config.columns || 2}, 1fr);
      }

      .layout-block .layout-content.flex {
        display: flex;
        gap: var(--cf-spacing-sm);
        flex-wrap: wrap;
      }

      .layout-block .layout-content.vertical {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .layout-block .child-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        padding: var(--cf-spacing-sm);
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-block .empty-state {
        text-align: center;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
      }

      .layout-block .child-content {
        width: 100%;
        text-align: center;
      }

      .layout-block .child-title {
        font-size: 0.8em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 4px;
      }

      .layout-block .child-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
      }

      @container (max-width: 300px) {
        .layout-block .layout-content.grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-field">
          <label class="form-label">布局类型</label>
          <ha-select
            .value="${config.layout || 'grid'}"
            @closed="${e => e.stopPropagation()}"
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="grid" @click="${() => onConfigChange('layout', 'grid')}">网格</ha-list-item>
            <ha-list-item value="flex" @click="${() => onConfigChange('layout', 'flex')}">弹性</ha-list-item>
            <ha-list-item value="vertical" @click="${() => onConfigChange('layout', 'vertical')}">垂直</ha-list-item>
          </ha-select>
        </div>

        ${config.layout === 'grid' ? html`
          <div class="form-field">
            <label class="form-label">列数</label>
            <ha-textfield
              .value="${config.columns || 2}"
              @input="${e => onConfigChange('columns', parseInt(e.target.value) || 2)}"
              type="number"
              min="1"
              max="6"
              fullwidth
            ></ha-textfield>
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">子块</div>
          <div class="child-blocks-list">
            ${config.blocks && config.blocks.length > 0 ? 
              config.blocks.map((child, index) => this._renderChildBlockEditor(child, index, onConfigChange)).join('') :
              '<div class="empty-state">暂无子块</div>'
            }
          </div>
          <button class="action-btn" onclick="this.addChildBlock()" style="margin-top: var(--cf-spacing-md);">
            <ha-icon icon="mdi:plus"></ha-icon>
            添加子块
          </button>
        </div>
      </div>

      <script>
        class ChildBlockEditor extends HTMLElement {
          constructor() {
            super();
            this.index = 0;
            this.onChange = null;
          }

          addChildBlock() {
            const newChild = {
              id: 'child_' + Date.now(),
              type: 'text',
              config: { content: '新块' }
            };
            
            const currentBlocks = this.getAttribute('blocks') || '[]';
            const blocks = JSON.parse(currentBlocks);
            blocks.push(newChild);
            
            this.onChange('blocks', JSON.stringify(blocks));
          }

          removeChildBlock(index) {
            const currentBlocks = this.getAttribute('blocks') || '[]';
            const blocks = JSON.parse(currentBlocks);
            blocks.splice(index, 1);
            
            this.onChange('blocks', JSON.stringify(blocks));
          }
        }

        if (!customElements.get('child-block-editor')) {
          customElements.define('child-block-editor', ChildBlockEditor);
        }
      </script>
    `;
  }

  _renderChildBlockEditor(child, index, onConfigChange) {
    return `
      <div class="child-block-editor">
        <div class="child-block-header">
          <span>子块 ${index + 1}</span>
          <button onclick="this.removeChildBlock(${index})">删除</button>
        </div>
        <div class="child-block-content">
          <ha-textfield
            value="${child.config?.content || ''}"
            label="内容"
            fullwidth
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      title: '布局容器',
      layout: 'grid',
      columns: 2,
      blocks: []
    };
  }

  _renderChildBlock(child, hass) {
    try {
      const BlockClass = BlockRegistry.getBlockClass(child.type);
      if (BlockClass) {
        const instance = new BlockClass();
        const content = instance.render(child, hass);
        return `
          <div class="child-block">
            <div class="child-content">
              ${content}
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('渲染子块失败:', error);
    }

    return `
      <div class="child-block">
        <div class="child-content">
          <div class="child-title">${child.config?.title || '未命名块'}</div>
          <div class="child-type">${child.type}</div>
        </div>
      </div>
    `;
  }

  _renderEmptyState() {
    return `
      <div class="empty-state">
        <ha-icon icon="mdi:view-grid-plus"></ha-icon>
        <div class="cf-text-sm cf-mt-sm">添加子块</div>
      </div>
    `;
  }
}

export { LayoutBlock as default };