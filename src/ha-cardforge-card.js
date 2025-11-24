// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { blockManager } from './core/block-manager.js';
import { LayoutEngine } from './core/layout-engine.js';
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

      .empty-container {
        padding: var(--cf-spacing-xl);
        text-align: center;
        color: var(--cf-text-secondary);
      }

      .theme-override {
        /* 主题样式将通过blockManager动态应用 */
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this._blocks = [];
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      // 验证配置
      this.config = this._validateConfig(config);
      
      // 初始化块系统
      await blockManager.initialize();
      
      // 验证块配置
      this._validateBlockConfig();
      
      // 更新块数据
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
      layout: 'grid',
      theme: 'auto',
      grid: { columns: 4, gap: '8px' },
      flex: { direction: 'row', wrap: 'wrap', justifyContent: 'flex-start', alignItems: 'stretch', gap: '8px' },
      absolute: { containerWidth: 1000, containerHeight: 600 },
      blocks: [],
      ...config
    };
  }

  _validateBlockConfig() {
    if (!this.config.blocks || !Array.isArray(this.config.blocks)) {
      return;
    }

    this.config.blocks.forEach((block, index) => {
      if (!block.type) {
        throw new Error(`块 ${index + 1} 缺少类型定义`);
      }

      if (!blockManager.getBlockClass(block.type)) {
        throw new Error(`未知的块类型: ${block.type}`);
      }

      // 验证块配置
      const validation = blockManager.validateConfig(block.type, block.config || {});
      if (!validation.valid) {
        console.warn(`块 ${index + 1} 配置验证失败:`, validation.errors);
      }
    });
  }

  render() {
    if (this._error) {
      return this._renderError();
    }

    if (this._loading) {
      return this._renderLoading();
    }

    if (!this._blocks || this._blocks.length === 0) {
      return this._renderEmpty();
    }

    return html`
      <ha-card>
        <div class="cardforge-container theme-${this.config.theme || 'auto'}">
          ${this._renderLayout()}
        </div>
      </ha-card>
      ${this._renderThemeStyles()}
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
    const flexConfig = this.config.flex || { direction: 'row', wrap: 'wrap', justifyContent: 'flex-start', alignItems: 'stretch', gap: '8px' };
    const flexStyle = `
      flex-direction: ${flexConfig.direction};
      flex-wrap: ${flexConfig.wrap};
      justify-content: ${flexConfig.justifyContent};
      align-items: ${flexConfig.alignItems};
      gap: ${flexConfig.gap};
    `;

    return html`
      <div class="card-layout-flex" style="${flexStyle}">
        ${this._blocks.map(block => this._renderBlock(block))}
      </div>
    `;
  }

  _renderAbsoluteLayout() {
    const absoluteConfig = this.config.absolute || { containerWidth: 1000, containerHeight: 600 };
    const containerStyle = `
      width: ${absoluteConfig.containerWidth}px;
      height: ${absoluteConfig.containerHeight}px;
    `;

    return html`
      <div class="card-layout-absolute" style="${containerStyle}">
        ${this._blocks.map(block => this._renderAbsoluteBlock(block, absoluteConfig))}
      </div>
    `;
  }

  _renderBlock(block) {
    try {
      const blockHtml = blockManager.render(block, this.hass);
      const blockStyles = blockManager.getStyles(block);
      
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

  _renderAbsoluteBlock(block, absoluteConfig) {
    const position = block.position || { x: 0, y: 0, w: 1, h: 1 };
    const cellWidth = absoluteConfig.containerWidth / 10;
    const cellHeight = absoluteConfig.containerHeight / 10;
    
    const style = `
      position: absolute;
      left: ${position.x * cellWidth}px;
      top: ${position.y * cellHeight}px;
      width: ${position.w * cellWidth}px;
      height: ${position.h * cellHeight}px;
      z-index: ${block.config?.zIndex || 1};
    `;

    return html`
      <div class="block-item" data-block-id="${block.id}" style="${style}">
        ${this._renderBlock(block)}
      </div>
    `;
  }

  _renderBlockError(block, error) {
    return html`
      <div class="block-item error" data-block-id="${block.id}">
        <div class="cf-card cf-error" style="padding: var(--cf-spacing-md);">
          <div class="cf-flex cf-flex-center cf-flex-column">
            <ha-icon icon="mdi:alert-circle" class="cf-error"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">块渲染失败</div>
            <div class="cf-text-xs cf-text-secondary">${block.type}</div>
            <div class="cf-text-xs cf-text-secondary">${error.message}</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderThemeStyles() {
    const theme = this.config.theme || 'auto';
    
    // 应用主题到所有块容器
    return html`
      <style>
        .cardforge-container .block-container {
          ${this._getThemeStyles(theme)}
        }
        
        /* 主题特定的覆盖样式 */
        ${this._getThemeOverrides(theme)}
      </style>
    `;
  }

  _getThemeStyles(themeId) {
    // 这里可以集成主题管理器的样式
    // 目前使用简化的主题样式
    const themeStyles = {
      'auto': `
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-color: var(--divider-color);
      `,
      'glass': `
        background: linear-gradient(135deg, 
          rgba(var(--rgb-primary-background-color), 0.8) 0%, 
          rgba(var(--rgb-primary-background-color), 0.6) 50%,
          rgba(var(--rgb-primary-background-color), 0.4) 100%);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
        color: var(--primary-text-color);
      `,
      'gradient': `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: 200% 200%;
        animation: gradientShift 6s ease infinite;
        color: white;
        border: none;
      `,
      'neon': `
        background: #1a1a1a;
        color: #00ff88;
        border: 1px solid #00ff88;
        box-shadow: 
          0 0 8px #00ff88,
          inset 0 0 15px rgba(0, 255, 136, 0.1);
        animation: neonPulse 2s ease-in-out infinite;
      `,
      'ink-wash': `
        background: 
          linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%),
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
        background-blend-mode: overlay, screen, screen;
        color: #f8f9fa;
        border: 2px solid rgba(124, 124, 124, 0.3);
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      `
    };

    return themeStyles[themeId] || themeStyles.auto;
  }

  _getThemeOverrides(themeId) {
    const overrides = {
      'gradient': `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `,
      'neon': `
        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 
              0 0 8px #00ff88,
              inset 0 0 15px rgba(0, 255, 136, 0.1);
          }
          50% {
            box-shadow: 
              0 0 20px #00ff88,
              0 0 35px rgba(0, 255, 136, 0.3),
              inset 0 0 25px rgba(0, 255, 136, 0.2);
          }
        }
      `,
      'ink-wash': `
        .cardforge-container.theme-ink-wash .block-container {
          position: relative;
          overflow: hidden;
        }
        
        .cardforge-container.theme-ink-wash .block-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%);
          pointer-events: none;
          opacity: 0.6;
        }
      `
    };

    return overrides[themeId] || '';
  }

  _renderError() {
    return html`
      <ha-card>
        <div class="error-container">
          <ha-icon icon="mdi:alert-circle-outline" style="font-size: 2em;"></ha-icon>
          <div class="cf-text-lg cf-mt-md cf-font-bold">卡片加载失败</div>
          <div class="cf-text-md cf-mt-sm">${this._error.message}</div>
          <div class="cf-text-sm cf-mt-md cf-text-secondary">
            请检查卡片配置或联系管理员
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderLoading() {
    return html`
      <ha-card>
        <div class="loading-container">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-md cf-mt-md">加载卡片中...</div>
        </div>
      </ha-card>
    `;
  }

  _renderEmpty() {
    return html`
      <ha-card>
        <div class="empty-container">
          <ha-icon icon="mdi:view-grid-plus" style="font-size: 3em; opacity: 0.3;"></ha-icon>
          <div class="cf-text-lg cf-mt-md cf-text-secondary">暂无内容块</div>
          <div class="cf-text-sm cf-mt-sm">点击编辑按钮添加内容块</div>
        </div>
      </ha-card>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      // Home Assistant 状态更新时重新渲染
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
            title: '当前时间',
            use24Hour: true,
            showDate: true,
            showWeek: true,
            showLunar: false
          },
          position: { x: 0, y: 0, w: 2, h: 1 }
        },
        {
          id: 'sensor-1',
          type: 'sensor',
          config: {
            entity: 'sensor.temperature',
            title: '室内温度',
            icon: 'mdi:thermometer'
          },
          position: { x: 2, y: 0, w: 1, h: 1 }
        }
      ]
    };
  }

  getCardSize() {
    if (!this._blocks || this._blocks.length === 0) {
      return 2;
    }

    // 根据布局和块数量计算卡片大小
    const layout = this.config.layout || 'grid';
    
    switch (layout) {
      case 'grid':
        const columns = this.config.grid?.columns || 4;
        return Math.max(2, Math.ceil(this._blocks.length / columns));
      
      case 'flex':
        return Math.max(2, Math.ceil(this._blocks.length / 2));
      
      case 'absolute':
        return 4;
      
      default:
        return Math.max(2, this._blocks.length);
    }
  }

  // 支持Home Assistant的更多功能
  getEntityFilter() {
    // 返回卡片使用的所有实体ID
    const entities = new Set();
    
    if (this._blocks) {
      this._blocks.forEach(block => {
        if (block.config?.entity) {
          entities.add(block.config.entity);
        }
        if (block.config?.entities) {
          block.config.entities.forEach(entity => entities.add(entity));
        }
      });
    }
    
    return Array.from(entities);
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };