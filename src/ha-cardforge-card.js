// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { blockManager } from './core/block-manager.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _error: { state: true },
    _loading: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .cardforge-container {
        position: relative;
        height: 100%;
        min-height: 80px;
      }

      .blocks-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        height: 100%;
      }

      .block-item {
        flex: 1;
        min-height: 60px;
      }

      .cardforge-error-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        min-height: 80px;
        text-align: center;
        padding: var(--cf-spacing-lg);
      }
    `
  ];

  constructor() {
    super();
    this._blocks = [];
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      this.config = this._validateConfig(config);
      await blockRegistry.initialize();
      
      this._blocks = this.config.blocks || [];
      
    } catch (error) {
      console.error('卡片加载失败:', error);
      this._error = error;
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  _validateConfig(config) {
    if (!config) {
      throw new Error('配置不能为空');
    }
    
    return {
      type: 'custom:ha-cardforge-card',
      blocks: [],
      layout: 'vertical',
      theme: 'auto',
      ...config
    };
  }

  render() {
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error-container">
              <div class="cf-error cf-text-xl cf-mb-md">❌</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">卡片加载失败</div>
              <div class="cf-text-sm cf-text-secondary">${this._error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div class="cf-text-md cf-mt-md">加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="blocks-container">
              ${this._blocks.map(block => this._renderBlock(block))}
            </div>
          </div>
        </ha-card>
        
        <style>
          ${this._renderAllStyles()}
        </style>
      `;
    } catch (error) {
      console.error('卡片渲染失败:', error);
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error-container">
              <div class="cf-warning cf-text-xl cf-mb-md">⚠️</div>
              <div class="cf-text-lg cf-font-bold cf-mb-sm">渲染错误</div>
              <div class="cf-text-sm cf-text-secondary">${error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  _renderBlock(block) {
    const blockInstance = blockRegistry.createBlockInstance(block.type);
    if (!blockInstance) {
      return html`<div class="block-item cf-error">未知块类型: ${block.type}</div>`;
    }
    
    try {
      const template = blockInstance.render(block.config, this.hass);
      const styles = blockInstance.getStyles(block.config);
      
      return html`
        <div class="block-item">
          ${unsafeHTML(template)}
        </div>
        
        <style>
          ${styles}
        </style>
      `;
    } catch (error) {
      return html`<div class="block-item cf-error">块渲染错误: ${error.message}</div>`;
    }
  }

  _renderAllStyles() {
    return this._blocks.map(block => {
      const blockInstance = blockRegistry.createBlockInstance(block.type);
      return blockInstance ? blockInstance.getStyles(block.config) : '';
    }).join('\n');
  }

  static getConfigElement() {
    return document.createElement('block-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      blocks: [], // 默认空数组，不包含时间块
      theme: 'auto'
    };
  }

  getCardSize() {
    return this._blocks.length + 1;
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
