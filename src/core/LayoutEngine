// src/core/layout-engine.js
export class LayoutEngine {
  constructor() {
    this._layouts = new Map();
    this._currentLayout = null;
    this._registerBuiltinLayouts();
  }

  // === 布局注册 ===
  registerLayout(name, layoutClass) {
    this._layouts.set(name, layoutClass);
  }

  getLayout(name) {
    return this._layouts.get(name);
  }

  getAllLayouts() {
    return Array.from(this._layouts.entries()).map(([name, layout]) => ({
      name,
      label: layout.label,
      description: layout.description,
      icon: layout.icon
    }));
  }

  // === 布局应用 ===
  applyLayout(container, layoutName, data, config = {}) {
    const LayoutClass = this._layouts.get(layoutName);
    if (!LayoutClass) {
      console.warn(`布局 ${layoutName} 未找到，使用默认布局`);
      return this.applyLayout(container, 'grid', data, config);
    }

    const layout = new LayoutClass();
    this._currentLayout = layout;

    const html = layout.render(data, config);
    const styles = layout.getStyles(config);
    
    container.innerHTML = html;
    this._injectStyles(styles, container);
    
    return layout;
  }

  getCurrentLayout() {
    return this._currentLayout;
  }

  // === 内置布局 ===
  _registerBuiltinLayouts() {
    this.registerLayout('grid', GridLayout);
    this.registerLayout('flex', FlexLayout);
    this.registerLayout('header-content-footer', HeaderContentFooterLayout);
    this.registerLayout('free', FreeLayout);
  }

  // === 样式管理 ===
  _injectStyles(css, container) {
    // 移除旧的样式
    const oldStyle = container.querySelector('style[data-layout-style]');
    if (oldStyle) {
      oldStyle.remove();
    }

    if (css) {
      const style = document.createElement('style');
      style.setAttribute('data-layout-style', 'true');
      style.textContent = css;
      container.appendChild(style);
    }
  }
}

// === 内置布局实现 ===

class GridLayout {
  static label = '网格布局';
  static description = '规则的网格排列';
  static icon = 'mdi:grid';

  render(blocks, config) {
    const columns = config.columns || 3;
    const gap = config.gap || 'var(--cf-spacing-md)';
    
    return `
      <div class="cf-layout-grid" style="grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
        ${blocks.map(block => this._renderBlock(block, config)).join('')}
      </div>
    `;
  }

  _renderBlock(block, config) {
    const alignment = config.textAlignment || 'center';
    
    return `
      <div class="cf-block cf-block-${block.type} alignment-${alignment}" data-block-id="${block.id}">
        ${this._renderBlockHeader(block)}
        <div class="cf-block-content">${block.content}</div>
        ${this._renderBlockFooter(block)}
      </div>
    `;
  }

  _renderBlockHeader(block) {
    if (!block.showHeader) return '';
    
    return `
      <div class="cf-block-header">
        ${block.icon ? `<span class="cf-block-icon">${block.icon}</span>` : ''}
        <span class="cf-block-title">${block.title || this._getDefaultTitle(block)}</span>
      </div>
    `;
  }

  _renderBlockFooter(block) {
    if (!block.footer) return '';
    
    return `
      <div class="cf-block-footer">
        <span class="cf-block-footer-text">${block.footer}</span>
      </div>
    `;
  }

  _getDefaultTitle(block) {
    const titles = {
      'text': '文本',
      'sensor': '传感器',
      'weather': '天气',
      'switch': '开关'
    };
    return titles[block.type] || '内容块';
  }

  getStyles(config) {
    const borderRadius = config.borderRadius || 'var(--cf-radius-md)';
    
    return `
      .cf-layout-grid {
        display: grid;
        width: 100%;
        container-type: inline-size;
      }
      
      .cf-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: ${borderRadius};
        padding: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
      }
      
      .cf-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .cf-block-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
        font-weight: 500;
      }
      
      .cf-block-icon {
        font-size: 1.2em;
      }
      
      .cf-block-content {
        flex: 1;
      }
      
      .cf-block-footer {
        margin-top: var(--cf-spacing-sm);
        font-size: 0.8em;
        opacity: 0.7;
      }
      
      /* 响应式设计 */
      @container (max-width: 400px) {
        .cf-layout-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
  }
}

class FlexLayout {
  static label = '弹性布局';
  static description = '灵活的弹性盒子排列';
  static icon = 'mdi:view-grid-outline';

  render(blocks, config) {
    const direction = config.direction || 'row';
    const justify = config.justify || 'center';
    const align = config.align || 'center';
    
    return `
      <div class="cf-layout-flex" style="flex-direction: ${direction}; justify-content: ${justify}; align-items: ${align};">
        ${blocks.map(block => this._renderBlock(block, config)).join('')}
      </div>
    `;
  }

  _renderBlock(block, config) {
    return `
      <div class="cf-block cf-block-${block.type}" data-block-id="${block.id}">
        <div class="cf-block-content">${block.content}</div>
      </div>
    `;
  }

  getStyles(config) {
    const gap = config.gap || 'var(--cf-spacing-md)';
    
    return `
      .cf-layout-flex {
        display: flex;
        gap: ${gap};
        width: 100%;
        flex-wrap: wrap;
      }
      
      .cf-block {
        flex: 1;
        min-width: 100px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }
    `;
  }
}

class HeaderContentFooterLayout {
  static label = '页眉内容页脚布局';
  static description = '经典的页眉-内容-页脚结构';
  static icon = 'mdi:card-text-outline';

  render(blocks, config) {
    const header = blocks.find(b => b.role === 'header');
    const footer = blocks.find(b => b.role === 'footer');
    const contentBlocks = blocks.filter(b => !b.role || b.role === 'content');
    
    return `
      <div class="cf-layout-hcf">
        ${header ? this._renderHeader(header, config) : ''}
        <div class="cf-layout-content">
          ${contentBlocks.map(block => this._renderBlock(block, config)).join('')}
        </div>
        ${footer ? this._renderFooter(footer, config) : ''}
      </div>
    `;
  }

  _renderHeader(header, config) {
    return `
      <header class="cf-layout-header">
        <div class="cf-header-content">${header.content}</div>
      </header>
    `;
  }

  _renderFooter(footer, config) {
    return `
      <footer class="cf-layout-footer">
        <div class="cf-footer-content">${footer.content}</div>
      </footer>
    `;
  }

  _renderBlock(block, config) {
    return `
      <div class="cf-content-block" data-block-id="${block.id}">
        ${block.content}
      </div>
    `;
  }

  getStyles(config) {
    return `
      .cf-layout-hcf {
        display: flex;
        flex-direction: column;
        min-height: 200px;
      }
      
      .cf-layout-header {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .cf-layout-content {
        flex: 1;
        padding: var(--cf-spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }
      
      .cf-layout-footer {
        background: rgba(var(--cf-rgb-primary), 0.05);
        padding: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
        font-size: 0.9em;
        opacity: 0.8;
      }
      
      .cf-content-block {
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        border: 1px solid var(--cf-border);
      }
    `;
  }
}

class FreeLayout {
  static label = '自由布局';
  static description = '完全自由的元素定位';
  static icon = 'mdi:arrow-all';

  render(blocks, config) {
    return `
      <div class="cf-layout-free">
        ${blocks.map(block => this._renderBlock(block, config)).join('')}
      </div>
    `;
  }

  _renderBlock(block, config) {
    const style = `
      position: absolute;
      left: ${block.x || 0}px;
      top: ${block.y || 0}px;
      width: ${block.width || 100}px;
      height: ${block.height || 100}px;
    `;
    
    return `
      <div class="cf-free-block" style="${style}" data-block-id="${block.id}">
        ${block.content}
      </div>
    `;
  }

  getStyles(config) {
    return `
      .cf-layout-free {
        position: relative;
        width: 100%;
        height: 300px;
        border: 1px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }
      
      .cf-free-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: move;
        user-select: none;
      }
      
      .cf-free-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-md);
      }
    `;
  }
}

// 创建全局实例
export const layoutEngine = new LayoutEngine();