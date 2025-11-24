// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { BlockRegistry } from './blocks/block-registry.js';
import { LayoutEngine } from './core/layout-engine.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _error: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
        container-type: inline-size;
      }

      .card-layout-grid {
        display: grid;
        gap: var(--cf-spacing-sm);
        height: 100%;
      }

      .card-layout-flex {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-sm);
        align-content: flex-start;
      }

      .card-layout-absolute {
        position: relative;
        height: 100%;
        min-height: 200px;
      }

      .block-item {
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover {
        transform: translateY(-1px);
      }

      .error-container {
        padding: var(--cf-spacing-lg);
        text-align: center;
        color: var(--cf-error-color);
      }

      .loading-container {
        padding: var(--cf-spacing-xl);
        text-align: center;
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this._blocks = [];
    this._error = null;
  }

  setConfig(config) {
    try {
      this.config = this._validateConfig(config);
      this._blocks = this.config.blocks || [];
      this._error = null;
    } catch (error) {
      this._error = error;
    }
  }

  _validateConfig(config) {
    if (!config) {
      throw new Error('配置不能为空');
    }

    return {
      type: 'custom:ha-cardforge-card',
      layout: 'grid',
      theme: 'auto',
      grid: { columns: 4, gap: '8px' },
      blocks: [],
      ...config
    };
  }

  render() {
    if (this._error) {
      return this._renderError();
    }

    if (!this._blocks || this._blocks.length === 0) {
      return this._renderEmpty();
    }

    return html`
      <ha-card>
        <div class="cardforge-container">
          ${this._renderLayout()}
        </div>
      </ha-card>
    `;
  }

  _renderLayout() {
    const layout = this.config.layout || 'grid';
    
    switch (layout) {
      case 'grid':
        return this._renderGridLayout();
      case 'flex':
        return this._renderFlexLayout();
      case 'absolute':
        return this._renderAbsoluteLayout();
      default:
        return this._renderGridLayout();
    }
  }

  _renderGridLayout() {
    const gridConfig = this.config.grid || { columns: 4, gap: '8px' };
    const gridStyle = `
      grid-template-columns: repeat(${gridConfig.columns}, 1fr);
      gap: ${gridConfig.gap};
    `;

    return html`
      <div class="card-layout-grid" style="${gridStyle}">
        ${this._blocks.map(block => this._renderBlock(block))}
      </div>
    `;
  }

  _renderFlexLayout() {
    return html`
      <div class="card-layout-flex">
        ${this._blocks.map(block => this._renderBlock(block))}
      </div>
    `;
  }

  _renderAbsoluteLayout() {
    return html`
      <div class="card-layout-absolute">
        ${this._blocks.map(block => this._renderAbsoluteBlock(block))}
      </div>
    `;
  }

  _renderBlock(block) {
    try {
      const blockHtml = BlockRegistry.render(block, this.hass);
      const blockStyles = BlockRegistry.getStyles(block);
      
      return html`
        <div class="block-item" data-block-id="${block.id}">
          ${unsafeHTML(blockHtml)}
        </div>
        <style>${blockStyles}</style>
      `;
    } catch (error) {
      console.error(`渲染块 ${block.id} 失败:`, error);
      return this._renderBlockError(block, error);
    }
  }

  _renderAbsoluteBlock(block) {
    const position = block.position || { x: 0, y: 0, w: 1, h: 1 };
    const style = `
      position: absolute;
      left: ${position.x * 25}%;
      top: ${position.y * 25}%;
      width: ${position.w * 25}%;
      height: ${position.h * 25}%;
    `;

    return html`
      <div class="block-item" data-block-id="${block.id}" style="${style}">
        ${this._renderBlock(block)}
      </div>
    `;
  }

  _renderBlockError(block, error) {
    return html`
      <div class="cf-card cf-error" style="padding: var(--cf-spacing-md);">
        <div class="cf-flex cf-flex-center cf-flex-column">
          <ha-icon icon="mdi:alert-circle" class="cf-error"></ha-icon>
          <div class="cf-text-sm cf-mt-sm">块渲染失败</div>
          <div class="cf-text-xs cf-text-secondary">${block.type}</div>
        </div>
      </div>
    `;
  }

  _renderError() {
    return html`
      <ha-card>
        <div class="error-container">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <div class="cf-text-md cf-mt-sm">${this._error.message}</div>
        </div>
      </ha-card>
    `;
  }

  _renderEmpty() {
    return html`
      <ha-card>
        <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
          <ha-icon icon="mdi:view-grid-plus" style="font-size: 3em; opacity: 0.3;"></ha-icon>
          <div class="cf-text-lg cf-mt-md cf-text-secondary">暂无内容块</div>
          <div class="cf-text-sm cf-mt-sm">点击编辑按钮添加内容块</div>
        </div>
      </ha-card>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.requestUpdate();
    }
  }

  static getConfigElement() {
    return document.createElement('block-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      layout: 'grid',
      theme: 'auto',
      grid: { columns: 4, gap: '8px' },
      blocks: [
        {
          id: 'time-1',
          type: 'time',
          config: {
            format: 'HH:mm',
            showDate: true
          },
          position: { x: 0, y: 0, w: 2, h: 1 }
        }
      ]
    };
  }

  getCardSize() {
    return Math.max(2, Math.ceil(this._blocks.length / 2));
  }
}

try {
  if (!customElements.get('ha-cardforge-card')) {
    customElements.define('ha-cardforge-card', HaCardForgeCard);
  }
} catch (error) {
  console.warn('卡片组件注册失败:', error);
}

export { HaCardForgeCard };