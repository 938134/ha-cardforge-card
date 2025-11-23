// src/editors/dashboard/layout-presets.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';

export class LayoutPresets extends LitElement {
  static properties = {
    selectedLayout: { type: String },
    layoutType: { type: String },
    blocks: { type: Array },
    _layoutOptions: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .layout-selector {
        width: 100%;
      }

      .layout-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-type-item {
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        text-align: center;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
      }

      .layout-type-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-type-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .layout-type-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .layout-type-name {
        font-weight: 500;
        font-size: 0.9em;
      }

      .layout-options {
        margin-top: var(--cf-spacing-lg);
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

      .list-options, .timeline-options {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .option-group {
        background: rgba(var(--cf-rgb-primary), 0.03);
        padding: var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        border: 1px solid var(--cf-border);
      }

      .option-title {
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: var(--cf-text-primary);
      }

      .option-items {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-sm);
      }

      .option-item {
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        font-size: 0.85em;
      }

      .option-item:hover {
        border-color: var(--cf-primary-color);
      }

      .option-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .layout-stats {
        margin-top: var(--cf-spacing-md);
        padding: var(--cf-spacing-sm);
        background: var(--cf-background);
        border-radius: var(--cf-radius-md);
        text-align: center;
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }

      .layout-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-sm);
        text-align: center;
      }

      /* 紧凑模式 */
      @media (max-width: 768px) {
        .layout-type-selector {
          grid-template-columns: 1fr;
        }

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
        .layout-item, .layout-type-item, .option-item {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .option-group {
          background: rgba(var(--cf-rgb-primary), 0.1);
          border-color: var(--cf-dark-border);
        }
      }
    `
  ];

  constructor() {
    super();
    this.layoutType = 'grid';
    this.blocks = [];
    this._layoutOptions = {
      list: {
        style: 'compact',
        showIcons: true,
        showDividers: true
      },
      timeline: {
        orientation: 'vertical',
        showTimestamps: true,
        showIcons: true,
        alternate: true
      }
    };
  }

  render() {
    return html`
      <div class="layout-selector">
        <!-- 布局类型选择 -->
        <div class="layout-type-selector">
          ${this._renderLayoutType('grid', '网格布局', 'mdi:view-grid')}
          ${this._renderLayoutType('list', '列表布局', 'mdi:format-list-bulleted')}
          ${this._renderLayoutType('timeline', '时间线', 'mdi:timeline')}
          ${this._renderLayoutType('free', '自由面板', 'mdi:arrow-all')}
        </div>

        <!-- 布局选项 -->
        <div class="layout-options">
          ${this._renderLayoutOptions()}
        </div>

        <!-- 布局统计 -->
        ${this._renderLayoutStats()}
      </div>
    `;
  }

  _renderLayoutType(type, name, icon) {
    return html`
      <div 
        class="layout-type-item ${this.layoutType === type ? 'selected' : ''}"
        @click=${() => this._selectLayoutType(type)}
      >
        <div class="layout-type-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="layout-type-name">${name}</div>
      </div>
    `;
  }

  _renderLayoutOptions() {
    switch (this.layoutType) {
      case 'grid':
        return this._renderGridOptions();
      case 'list':
        return this._renderListOptions();
      case 'timeline':
        return this._renderTimelineOptions();
      case 'free':
        return this._renderFreeOptions();
      default:
        return '';
    }
  }

  _renderGridOptions() {
    const usageInfo = this._getLayoutUsage(this.selectedLayout);
    
    return html`
      <div class="option-group">
        <div class="option-title">网格布局</div>
        <div class="layout-grid">
          ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => {
            const blockUsage = this._getLayoutUsage(key);
            return html`
              <div 
                class="layout-item ${this.selectedLayout === key ? 'selected' : ''}"
                @click=${() => this._selectGridLayout(key)}
                title="${preset.name} - ${blockUsage.used}/${blockUsage.total} 位置已使用"
              >
                <div class="layout-name">${preset.cols}×${preset.rows}</div>
                ${blockUsage.used > 0 ? html`
                  <div class="usage-info">${blockUsage.used}</div>
                ` : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _renderListOptions() {
    const options = this._layoutOptions.list;
    
    return html`
      <div class="list-options">
        <div class="option-group">
          <div class="option-title">列表样式</div>
          <div class="option-items">
            <div class="option-item ${options.style === 'compact' ? 'selected' : ''}"
                 @click=${() => this._updateListOption('style', 'compact')}>
              紧凑列表
            </div>
            <div class="option-item ${options.style === 'card' ? 'selected' : ''}"
                 @click=${() => this._updateListOption('style', 'card')}>
              卡片列表
            </div>
          </div>
        </div>

        <div class="option-group">
          <div class="option-title">显示选项</div>
          <div class="option-items">
            <div class="option-item ${options.showIcons ? 'selected' : ''}"
                 @click=${() => this._updateListOption('showIcons', !options.showIcons)}>
              显示图标
            </div>
            <div class="option-item ${options.showDividers ? 'selected' : ''}"
                 @click=${() => this._updateListOption('showDividers', !options.showDividers)}>
              显示分割线
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderTimelineOptions() {
    const options = this._layoutOptions.timeline;
    
    return html`
      <div class="timeline-options">
        <div class="option-group">
          <div class="option-title">时间线方向</div>
          <div class="option-items">
            <div class="option-item ${options.orientation === 'vertical' ? 'selected' : ''}"
                 @click=${() => this._updateTimelineOption('orientation', 'vertical')}>
              垂直时间线
            </div>
            <div class="option-item ${options.orientation === 'horizontal' ? 'selected' : ''}"
                 @click=${() => this._updateTimelineOption('orientation', 'horizontal')}>
              水平时间线
            </div>
          </div>
        </div>

        <div class="option-group">
          <div class="option-title">显示选项</div>
          <div class="option-items">
            <div class="option-item ${options.showTimestamps ? 'selected' : ''}"
                 @click=${() => this._updateTimelineOption('showTimestamps', !options.showTimestamps)}>
              显示时间戳
            </div>
            <div class="option-item ${options.showIcons ? 'selected' : ''}"
                 @click=${() => this._updateTimelineOption('showIcons', !options.showIcons)}>
              显示图标
            </div>
            <div class="option-item ${options.alternate ? 'selected' : ''}"
                 @click=${() => this._updateTimelineOption('alternate', !options.alternate)}>
              交替布局
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderFreeOptions() {
    return html`
      <div class="option-group">
        <div class="option-title">自由面板布局</div>
        <div class="layout-description">
          自由拖拽排列块位置，支持重叠和自定义大小
        </div>
      </div>
    `;
  }

  _renderLayoutStats() {
    const usageInfo = this._getLayoutUsage(this.selectedLayout);
    const layoutName = BlockManager.LAYOUT_PRESETS[this.selectedLayout]?.name || '当前布局';
    
    return html`
      <div class="layout-stats">
        <div>${layoutName} · 已使用 ${usageInfo.used}/${usageInfo.total} 位置 (${usageInfo.percent}%)</div>
      </div>
      <div class="layout-description">
        布局仅影响内容区域的块，标题和页脚块不受影响
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
    
    const totalPositions = gridConfig ? gridConfig.rows * gridConfig.cols : contentBlocks.length;
    
    return {
      used: usedPositions.size,
      total: totalPositions,
      percent: totalPositions > 0 ? Math.round((usedPositions.size / totalPositions) * 100) : 0
    };
  }

  _selectLayoutType(layoutType) {
    this.layoutType = layoutType;
    this.dispatchEvent(new CustomEvent('layout-type-changed', {
      detail: { layoutType }
    }));
  }

  _selectGridLayout(layout) {
    this.dispatchEvent(new CustomEvent('layout-changed', {
      detail: { layout, layoutType: 'grid' }
    }));
  }

  _updateListOption(key, value) {
    this._layoutOptions.list[key] = value;
    this.dispatchEvent(new CustomEvent('layout-options-changed', {
      detail: { 
        layoutType: 'list',
        options: this._layoutOptions.list 
      }
    }));
    this.requestUpdate();
  }

  _updateTimelineOption(key, value) {
    this._layoutOptions.timeline[key] = value;
    this.dispatchEvent(new CustomEvent('layout-options-changed', {
      detail: { 
        layoutType: 'timeline',
        options: this._layoutOptions.timeline 
      }
    }));
    this.requestUpdate();
  }
}

if (!customElements.get('layout-presets')) {
  customElements.define('layout-presets', LayoutPresets);
}