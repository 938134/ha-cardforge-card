// src/core/layout-engine.js
class LayoutEngine {
  constructor() {
    this.layouts = new Map();
  }

  registerLayout(layoutType, layoutConfig) {
    this.layouts.set(layoutType, layoutConfig);
  }

  getLayout(layoutType) {
    return this.layouts.get(layoutType) || this.layouts.get('vertical');
  }

  generateLayout(layoutType, sections) {
    const layout = this.getLayout(layoutType);
    
    return {
      type: layoutType,
      sections: sections || ['main'],
      styles: layout?.styles || '',
      template: layout?.template || this._getDefaultTemplate(layoutType)
    };
  }

  _getDefaultTemplate(layoutType) {
    switch (layoutType) {
      case 'vertical':
        return `
          <div class="vertical-layout">
            {{#each sections}}
              <div class="section" data-section="{{this}}">
                {{> sectionContent}}
              </div>
            {{/each}}
          </div>
        `;
      case 'horizontal':
        return `
          <div class="horizontal-layout">
            {{#each sections}}
              <div class="section" data-section="{{this}}">
                {{> sectionContent}}
              </div>
            {{/each}}
          </div>
        `;
      case 'grid':
        return `
          <div class="grid-layout">
            {{#each sections}}
              <div class="section" data-section="{{this}}">
                {{> sectionContent}}
              </div>
            {{/each}}
          </div>
        `;
      case 'card-grid':
        return `
          <div class="card-grid-layout">
            {{#each sections}}
              <div class="card-section" data-section="{{this}}">
                {{> sectionContent}}
              </div>
            {{/each}}
          </div>
        `;
      default:
        return `
          <div class="vertical-layout">
            {{#each sections}}
              <div class="section" data-section="{{this}}">
                {{> sectionContent}}
              </div>
            {{/each}}
          </div>
        `;
    }
  }

  getLayoutStyles(layoutType) {
    switch (layoutType) {
      case 'vertical':
        return `
          .vertical-layout {
            display: flex;
            flex-direction: column;
            gap: var(--cf-spacing-sm);
            height: 100%;
          }
        `;
      case 'horizontal':
        return `
          .horizontal-layout {
            display: flex;
            gap: var(--cf-spacing-sm);
            height: 100%;
          }
          .horizontal-layout .section {
            flex: 1;
          }
        `;
      case 'grid':
        return `
          .grid-layout {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--cf-spacing-sm);
            height: 100%;
          }
        `;
      case 'card-grid':
        return `
          .card-grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--cf-spacing-sm);
          }
          .card-grid-layout .card-section {
            background: var(--cf-surface);
            border: 1px solid var(--cf-border);
            border-radius: var(--cf-radius-md);
            padding: var(--cf-spacing-md);
          }
        `;
      default:
        return `
          .vertical-layout {
            display: flex;
            flex-direction: column;
            gap: var(--cf-spacing-sm);
            height: 100%;
          }
        `;
    }
  }

  validateLayout(config) {
    const layoutType = config.layout?.type;
    const sections = config.layout?.sections;
    
    if (!layoutType || !sections || !Array.isArray(sections)) {
      throw new Error('布局配置无效');
    }
    
    if (!this.layouts.has(layoutType)) {
      throw new Error(`不支持的布局类型: ${layoutType}`);
    }
    
    return true;
  }
}

const layoutEngine = new LayoutEngine();

// 注册默认布局
layoutEngine.registerLayout('vertical', {
  name: '垂直布局',
  description: '垂直排列的布局',
  maxSections: 6
});

layoutEngine.registerLayout('horizontal', {
  name: '水平布局', 
  description: '水平排列的布局',
  maxSections: 4
});

layoutEngine.registerLayout('grid', {
  name: '网格布局',
  description: '2列网格布局', 
  maxSections: 4
});

layoutEngine.registerLayout('card-grid', {
  name: '卡片网格',
  description: '自适应卡片网格',
  maxSections: 8
});

export { layoutEngine, LayoutEngine };
