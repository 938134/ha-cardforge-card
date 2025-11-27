// src/editors/block-system/block-row.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockSystem } from '../../core/block-system.js';
import { AreaBadge } from './area-badge.js';
import { BlockActions } from './block-actions.js';
import { InlineEditor } from './inline-editor.js';

class BlockRow extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    isEditing: { type: Boolean }
  };

  static styles = [
    designSystem,
    css`
      .block-row {
        display: grid;
        grid-template-columns: 60px 60px 1fr 80px;
        gap: var(--cf-spacing-sm);
        align-items: center;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        min-height: 70px;
        cursor: pointer;
      }

      .block-row:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
        transform: translateY(-1px);
      }

      .block-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4em;
        transition: all var(--cf-transition-fast);
      }

      .block-row:hover .block-icon {
        background: rgba(var(--cf-rgb-primary), 0.2);
        transform: scale(1.05);
      }

      .block-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .block-name {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .block-state {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .inline-editor-container {
        grid-column: 1 / -1;
      }

      @media (max-width: 768px) {
        .block-row {
          grid-template-columns: 50px 50px 1fr 70px;
          gap: var(--cf-spacing-xs);
          padding: var(--cf-spacing-xs);
          min-height: 60px;
        }

        .block-icon {
          width: 42px;
          height: 42px;
          font-size: 1.2em;
        }

        .block-name {
          font-size: 0.9em;
        }

        .block-state {
          font-size: 0.8em;
        }
      }
    `
  ];

  render() {
    const { block, hass, isEditing } = this;
    
    if (!block) {
      return html``;
    }

    const icon = BlockSystem.getBlockIcon(block);
    const state = BlockSystem.getBlockPreview(block, hass);
    const displayName = block.title || block.id;

    return html`
      <div class="block-row" @click=${this._onRowClick}>
        <!-- 列1: 区域标识 -->
        <area-badge .area=${block.area}></area-badge>

        <!-- 列2: 图标 -->
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>

        <!-- 列3: 块信息 -->
        <div class="block-info">
          <div class="block-name">${displayName}</div>
          <div class="block-state">${state}</div>
        </div>

        <!-- 列4: 操作按钮 -->
        <block-actions
          .blockId=${block.id}
          @edit=${this._onEdit}
          @delete=${this._onDelete}
        ></block-actions>

        ${isEditing ? html`
          <div class="inline-editor-container">
            <inline-editor
              .block=${block}
              .hass=${hass}
              @save=${this._onSave}
              @cancel=${this._onCancel}
            ></inline-editor>
          </div>
        ` : ''}
      </div>
    `;
  }

  _onRowClick() {
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId: this.block.id }
    }));
  }

  _onEdit(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('edit-block', {
      detail: { blockId: this.block.id }
    }));
  }

  _onDelete(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('delete-block', {
      detail: { blockId: this.block.id }
    }));
  }

  _onSave(e) {
    this.dispatchEvent(new CustomEvent('save-block', {
      detail: {
        blockId: this.block.id,
        config: e.detail.config
      }
    }));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('cancel-edit'));
  }
}

if (!customElements.get('block-row')) {
  customElements.define('block-row', BlockRow);
}

export { BlockRow };