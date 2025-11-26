// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { designSystem } from './core/design-system.js';
import { blockManager } from './core/block-manager.js';
import { themeManager } from './core/theme-manager.js';
import { DEFAULT_CONFIG } from './core/config-schema.js';

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

      .vertical-layout {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        height: 100%;
      }

      .horizontal-layout {
        display: flex;
        gap: var(--cf-spacing-sm);
        height: 100%;
      }

      .grid-layout {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-sm);
        height: 100%;
      }

      .card-grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .section {
        flex: 1;
        min-height: 60px;
      }

      .block-item {
        height: 100%;
        min-height: 60px;
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
      await blockManager.initialize();
      await themeManager.initialize();
      
      // 从配置中提取所有块
      this._blocks = this._extractAllBlocks(this.config);
      
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
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  _extractAllBlocks(config) {
    const blocks = [];
    const sections = config.sections || {};
    
    Object.values(sections).forEach(section => {
      if (section.blocks) {
        blocks.push(...section.blocks);
      }
    });
    
    return blocks;
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
            ${this._renderLayout()}
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

  _renderLayout() {
    const layoutType = this.config.layout?.type || 'vertical';
    const sections = this.config.layout?.sections || ['main'];

    switch (layoutType) {
      case 'horizontal':
        return html`
          <div class="horizontal-layout">
            ${sections.map(sectionId => this._renderSection(sectionId))}
          </div>
        `;
      case 'grid':
        return html`
          <div class="grid-layout">
            ${sections.map(sectionId => this._renderSection(sectionId))}
          </div>
        `;
      case 'card-grid':
        return html`
          <div class="card-grid-layout">
            ${sections.map(sectionId => this._renderSection(sectionId))}
          </div>
        `;
      default: // vertical
        return html`
          <div class="vertical-layout">
            ${sections.map(sectionId => this._renderSection(sectionId))}
          </div>
        `;
    }
  }

  _renderSection(sectionId) {
    const section = this.config.sections?.[sectionId];
    const blocks = section?.blocks || [];

    return html`
      <div class="section">
        ${blocks.map(block => this._renderBlock(block))}
      </div>
    `;
  }

  _renderBlock(block) {
    const blockInstance = blockManager.createBlockInstance(block.type);
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
      const blockInstance = blockManager.createBlockInstance(block.type);
      return blockInstance ? blockInstance.getStyles(block.config) : '';
    }).join('\n');
  }

  static getConfigElement() {
    return document.createElement('card-forge-editor');
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  getCardSize() {
    return this._blocks.length + 1;
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };
