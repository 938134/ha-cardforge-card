// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PLUGIN_INFO } from './core/plugin-registry.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _searchQuery: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 800px;
    }
    
    .search-header {
      margin-bottom: 20px;
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .plugin-card {
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .plugin-card:hover {
      border-color: var(--primary-color);
    }
    
    .plugin-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .plugin-icon {
      font-size: 2.2em;
      margin-bottom: 8px;
    }
    
    .plugin-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.9em;
    }
    
    .plugin-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    
    .preview-section {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 20px;
      margin: 20px 0;
      border: 1px solid var(--divider-color);
    }
    
    .preview-container {
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .preview-placeholder {
      text-align: center;
      color: var(--secondary-text-color);
    }
    
    .entity-config {
      margin: 20px 0;
    }
    
    .entity-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .actions {
      margin-top: 24px;
      text-align: right;
      border-top: 1px solid var(--divider-color);
      padding-top: 16px;
    }
    
    .debug-info {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 10px;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    
    .test-content {
      border: 3px solid blue;
      padding: 20px;
      background: lightblue;
      margin-bottom: 10px;
      border-radius: 8px;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._plugins = PLUGIN_INFO;
    this._searchQuery = '';
  }

  setConfig(config) {
    console.log('🎮 [Editor] setConfig:', config);
    this.config = { 
      plugin: '',
      entities: {},
      ...config 
    };
  }

  render() {
    return html`
      <div class="editor">
        <!-- 调试面板 -->
        <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px;">调试面板</div>
          <mwc-button 
            outlined 
            label="测试独立渲染"
            @click=${this._testRender}
          ></mwc-button>
          <mwc-button 
            outlined 
            label="检查预览元素"
            @click=${this._inspectCardElement}
            style="margin-left: 8px;"
          ></mwc-button>
          <div class="debug-info">
            当前插件: ${this.config.plugin || '未选择'} | 
            Hass: ${this.hass ? '已连接' : '未连接'} |
            实体数: ${Object.keys(this.config.entities || {}).length}
          </div>
        </div>

        <!-- 插件选择 -->
        <div class="search-header">
          <ha-textfield
            class="flex"
            label="搜索插件..."
            .value=${this._searchQuery}
            @input=${e => this._searchQuery = e.target.value}
            icon="mdi:magnify"
          ></ha-textfield>
        </div>

        <div class="plugin-grid">
          ${this._getFilteredPlugins().map(plugin => html`
            <div class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
                 @click=${() => this._selectPlugin(plugin)}>
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-description">${plugin.description}</div>
            </div>
          `)}
        </div>

        <!-- 实体配置 -->
        ${this.config.plugin ? this._renderEntityConfig() : ''}

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-container" style="border: 2px solid #4CAF50; min-height: 150px; padding: 10px;">
            ${this._renderPreview()}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <mwc-button 
            outlined
            label="取消"
            @click=${this._cancel}
          ></mwc-button>
          <mwc-button 
            raised
            label="保存"
            @click=${this._save}
            .disabled=${!this.config.plugin}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderEntityConfig() {
    const plugin = this._plugins.find(p => p.id === this.config.plugin);
    if (!plugin?.entityRequirements || plugin.entityRequirements.length === 0) {
      return html`
        <div class="entity-config">
          <h3>实体配置</h3>
          <div style="color: var(--secondary-text-color); padding: 10px;">
            此插件无需配置实体
          </div>
        </div>
      `;
    }

    return html`
      <div class="entity-config">
        <h3>实体配置</h3>
        ${plugin.entityRequirements.map(req => html`
          <div class="entity-row">
            <div>${req.description}</div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this.config.entities?.[req.key] || ''}
              @value-changed=${e => this._entityChanged(req.key, e.detail.value)}
              allow-custom-entity
              .label=${`选择${req.description}`}
            ></ha-entity-picker>
          </div>
        `)}
      </div>
    `;
  }

  _renderPreview() {
    console.log('🔄 [Editor] 渲染预览:', this.config.plugin);
    
    if (!this.config.plugin) {
      return html`
        <div class="preview-placeholder" style="border: 2px solid orange; padding: 20px;">
          <ha-icon icon="mdi:card-bulleted-outline"></ha-icon>
          <div>选择插件后显示预览</div>
          <div style="font-size: 12px; color: red;">调试：未选择插件</div>
        </div>
      `;
    }

    const previewConfig = {
      plugin: this.config.plugin,
      entities: this.config.entities || {},
    };

    console.log('📋 [Editor] 预览配置:', previewConfig);
    console.log('🔍 [Editor] Hass 状态:', !!this.hass);

    return html`
      <div style="width: 100%;">
        <div style="color: green; font-size: 12px; margin-bottom: 8px;">
          预览容器开始 - 插件: ${this.config.plugin}
        </div>
        
        <!-- 直接渲染测试内容 -->
        <div class="test-content">
          <h4>直接HTML测试</h4>
          <div>这是一个直接渲染的测试内容</div>
          <div>时间: ${new Date().toLocaleTimeString()}</div>
          <div style="font-size: 12px; color: #666;">如果这个显示但卡片不显示，说明卡片渲染有问题</div>
        </div>

        <!-- 渲染卡片元素 -->
        <ha-cardforge-card
          .hass=${this.hass}
          .config=${previewConfig}
          style="border: 2px solid red; display: block; min-height: 100px;"
        ></ha-cardforge-card>
        
        <div style="color: green; font-size: 12px; margin-top: 8px;">预览容器结束</div>
      </div>
    `;
  }

  _getFilteredPlugins() {
    if (!this._searchQuery) {
      return this._plugins;
    }
    
    const query = this._searchQuery.toLowerCase();
    return this._plugins.filter(plugin => 
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query)
    );
  }

  _selectPlugin(plugin) {
    console.log('🎯 [Editor] 选择插件:', plugin.id);
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._getDefaultEntities(plugin)
    };
    
    this.requestUpdate();
    
    // 延迟检查DOM
    setTimeout(() => {
      this._inspectCardElement();
    }, 200);
  }

  _getDefaultEntities(plugin) {
    const defaults = {};
    plugin.entityRequirements?.forEach(req => {
      if (req.key === 'time') defaults.time = 'sensor.time';
      if (req.key === 'date') defaults.date = 'sensor.date';
      if (req.key === 'week') defaults.week = 'sensor.xing_qi';
    });
    return { ...defaults, ...this.config.entities };
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this.requestUpdate();
  }

  _testRender() {
    console.log('🧪 [Editor] 开始测试渲染');
    
    // 测试直接创建元素
    const testElement = document.createElement('ha-cardforge-card');
    testElement.hass = this.hass;
    testElement.config = {
      plugin: 'simple-clock',
      entities: {}
    };
    
    // 添加到临时容器
    const testContainer = document.createElement('div');
    testContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 200px;
      background: white;
      border: 3px solid red;
      z-index: 10000;
      padding: 20px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;
    
    testContainer.innerHTML = `
      <h3>测试渲染窗口</h3>
      <div style="font-size: 12px; color: #666;">这个窗口应该显示卡片内容</div>
    `;
    testContainer.appendChild(testElement);
    document.body.appendChild(testContainer);
    
    console.log('🧪 [Editor] 测试元素已创建:', testElement);
    
    // 3秒后检查状态
    setTimeout(() => {
      console.log('🔍 [Editor] 测试元素状态检查:', {
        element: testElement,
        shadowRoot: !!testElement.shadowRoot,
        children: testElement.children?.length,
        innerHTML: testElement.innerHTML?.substring(0, 100)
      });
    }, 1000);
    
    // 5秒后移除
    setTimeout(() => {
      testContainer.remove();
      console.log('🧪 [Editor] 测试窗口已移除');
    }, 5000);
  }

  _inspectCardElement() {
    console.log('🔍 [Editor] 检查预览卡片元素');
    const cardElement = this.shadowRoot?.querySelector('ha-cardforge-card');
    
    if (!cardElement) {
      console.log('❌ [Editor] 未找到卡片元素');
      return;
    }
    
    console.log('✅ [Editor] 找到卡片元素:', cardElement);
    console.log('📊 [Editor] 卡片元素详情:', {
      tagName: cardElement.tagName,
      hass: !!cardElement.hass,
      config: cardElement.config,
      shadowRoot: !!cardElement.shadowRoot,
      children: cardElement.children?.length || 0,
      innerHTML: cardElement.innerHTML?.substring(0, 200) || '空'
    });
    
    if (cardElement.shadowRoot) {
      console.log('🎭 [Editor] 影子根内容:', cardElement.shadowRoot.innerHTML.substring(0, 500));
    } else {
      console.log('❌ [Editor] 卡片元素没有影子根');
    }
  }

  _save() {
    console.log('💾 [Editor] 保存配置:', this.config);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _cancel() {
    console.log('❌ [Editor] 取消配置');
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }
}

export { HaCardForgeEditor };