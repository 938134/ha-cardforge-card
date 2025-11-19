// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentStrategy: { state: true },
    _contentBlocks: { state: true },
    _availableEntities: { state: true },
    _editingBlock: { state: true },
    _showBlockEditor: { state: true }
  };

  // ... 样式部分保持不变 ...

  constructor() {
    super();
    this._currentStrategy = 'stateless';
    this._contentBlocks = [];
    this._availableEntities = [];
    this._editingBlock = null;
    this._showBlockEditor = false;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest') || changedProperties.has('config')) {
      this._currentStrategy = this._detectStrategy();
      this._contentBlocks = this._extractContentBlocks();
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    const entities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this._availableEntities = entities;
  }

  _detectStrategy() {
    const manifest = this.pluginManifest;
    if (!manifest) return 'stateless';

    if (manifest.layout_type === 'free') return 'free_layout';
    if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
      return 'structured';
    }
    return 'stateless';
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderStrategyContent()}
        ${this._renderBlockEditor()}
        ${this._renderInfoCard()}
      </div>
    `;
  }

  _renderStrategyContent() {
    switch (this._currentStrategy) {
      case 'free_layout':
        return this._renderFreeLayout();
      case 'structured':
        return this._renderStructured();
      default:
        return this._renderStateless();
    }
  }

  _renderFreeLayout() {
    return html`
      <div>
        <!-- 标题和页脚字段 -->
        ${this._renderHeaderFields()}
        
        <!-- 内容块管理 -->
        <div class="blocks-section">
          <div class="section-title">
            <span>内容块管理</span>
            <span class="cf-text-sm cf-text-secondary">${this._contentBlocks.length} 个内容块</span>
          </div>
          
          <div class="content-blocks-grid">
            ${this._contentBlocks.map(block => this._renderContentBlock(block))}
            <button class="add-block-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加内容块
            </button>
          </div>

          ${this._contentBlocks.length === 0 ? html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
              <p class="empty-text">点击"添加内容块"开始构建布局</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderHeaderFields() {
    const capabilities = this.pluginManifest?.capabilities || {};
    
    if (!capabilities.supportsTitle && !capabilities.supportsFooter) {
      return '';
    }

    return html`
      <div class="header-fields">
        ${capabilities.supportsTitle ? html`
          <div class="field-card">
            <div class="field-label">标题</div>
            <div class="field-input">
              <ha-textfield
                .value=${this._getEntityValue('title')}
                @input=${e => this._onHeaderFieldChanged('title', e.target.value)}
                label="卡片标题"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
          
          <div class="field-card">
            <div class="field-label">副标题</div>
            <div class="field-input">
              <ha-textfield
                .value=${this._getEntityValue('subtitle')}
                @input=${e => this._onHeaderFieldChanged('subtitle', e.target.value)}
                label="副标题（可选）"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
        ` : ''}
        
        ${capabilities.supportsFooter ? html`
          <div class="field-card">
            <div class="field-label">页脚</div>
            <div class="field-input">
              <ha-textfield
                .value=${this._getEntityValue('footer')}
                @input=${e => this._onHeaderFieldChanged('footer', e.target.value)}
                label="页脚文本"
                fullwidth
              ></ha-textfield>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStructured() {
    const requirements = this.pluginManifest?.entity_requirements || {};

    return html`
      <div>
        ${Object.entries(requirements).map(([key, requirement]) => 
          this._renderEntityField(key, requirement)
        )}
      </div>
    `;
  }

  _renderStateless() {
    return html``;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block" @click=${() => this._editContentBlock(block)}>
        <div class="block-actions">
          <div class="block-action edit" @click=${(e) => { e.stopPropagation(); this._editContentBlock(block); }}>
            <ha-icon icon="mdi:pencil" style="font-size: 14px;"></ha-icon>
          </div>
          <div class="block-action delete" @click=${(e) => { e.stopPropagation(); this._deleteContentBlock(block.id); }}>
            <ha-icon icon="mdi:delete" style="font-size: 14px;"></ha-icon>
          </div>
        </div>
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
      </div>
    `;
  }

  _renderEntityField(key, requirement) {
    const currentValue = this._getEntityValue(key);

    return html`
      <div class="field-card ${requirement.required ? 'required' : ''}">
        <div class="field-label">
          ${requirement.name}
          ${requirement.required ? html`<span class="required-mark">(*)</span>` : ''}
        </div>
        <div class="field-input">
          <ha-combo-box
            .items=${this._availableEntities}
            .value=${currentValue}
            @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
            allow-custom-value
            label=${`选择 ${requirement.name}`}
          ></ha-combo-box>
        </div>
      </div>
    `;
  }

  _renderBlockEditor() {
    if (!this._showBlockEditor) return '';

    const blockTypes = [
      { value: 'text', label: '文本块', icon: 'mdi:text' },
      { value: 'sensor', label: '传感器', icon: 'mdi:gauge' },
      { value: 'weather', label: '天气', icon: 'mdi:weather-cloudy' },
      { value: 'switch', label: '开关', icon: 'mdi:power' }
    ];

    return html`
      <div class="block-editor-modal" @click=${this._closeBlockEditor}>
        <div class="block-editor" @click=${e => e.stopPropagation()}>
          <div class="editor-header">
            <div class="editor-title">
              ${this._editingBlock ? '编辑内容块' : '添加内容块'}
            </div>
            <button class="close-button" @click=${this._closeBlockEditor}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="editor-form">
            <div class="form-group">
              <label class="form-label">内容块类型</label>
              <ha-combo-box
                .items=${blockTypes}
                .value=${this._editingBlock?.type || 'text'}
                @value-changed=${e => this._onBlockTypeChange(e.detail.value)}
                label="选择内容块类型"
              ></ha-combo-box>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                ${this._getContentFieldLabel(this._editingBlock?.type)}
              </label>
              ${this._renderContentField(this._editingBlock)}
            </div>
            
            ${this._editingBlock?.type === 'text' ? html`
              <div class="form-group">
                <label class="form-label">自定义样式（可选）</label>
                <ha-textfield
                  .value=${this._editingBlock?.config?.background || ''}
                  @input=${e => this._onBlockStyleChange('background', e.target.value)}
                  label="背景颜色"
                  placeholder="#f0f0f0 或 rgba(255,255,255,0.8)"
                ></ha-textfield>
                <ha-textfield
                  .value=${this._editingBlock?.config?.textColor || ''}
                  @input=${e => this._onBlockStyleChange('textColor', e.target.value)}
                  label="文字颜色"
                  placeholder="#333333"
                ></ha-textfield>
              </div>
            ` : ''}
          </div>
          
          <div class="editor-actions">
            <mwc-button @click=${this._closeBlockEditor}>取消</mwc-button>
            <mwc-button raised @click=${this._saveContentBlock}>
              ${this._editingBlock ? '保存' : '添加'}
            </mwc-button>
          </div>
        </div>
      </div>
    `;
  }

  _renderInfoCard() {
    const strategyInfo = this._getStrategyInfo();
    
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" .icon=${strategyInfo.icon}></ha-icon>
        <div class="info-title">${strategyInfo.name}</div>
        <p class="info-description">${strategyInfo.description}</p>
      </div>
    `;
  }

  _getContentFieldLabel(blockType) {
    const labels = {
      'text': '文本内容',
      'sensor': '传感器实体',
      'weather': '天气实体', 
      'switch': '开关实体'
    };
    return labels[blockType] || '内容';
  }

  _renderContentField(block) {
    const blockType = block?.type || 'text';
    
    if (blockType === 'text') {
      return html`
        <ha-textarea
          .value=${block?.content || ''}
          @input=${e => this._onBlockContentChange(e.target.value)}
          label="输入文本内容"
          rows="3"
        ></ha-textarea>
      `;
    } else {
      return html`
        <ha-combo-box
          .items=${this._availableEntities}
          .value=${block?.content || ''}
          @value-changed=${e => this._onBlockContentChange(e.detail.value)}
          label="选择实体"
          allow-custom-value
        ></ha-combo-box>
      `;
    }
  }

  _getStrategyInfo() {
    const strategyInfo = {
      free_layout: {
        name: '自由布局模式',
        description: '可任意添加和排列内容块，构建个性化布局。支持标题、页脚自定义。',
        icon: 'mdi:view-grid-plus'
      },
      structured: {
        name: '智能数据源',
        description: '配置所需的数据源实体，系统将自动获取并展示数据',
        icon: 'mdi:database-cog'
      },
      stateless: {
        name: '智能数据源',
        description: '此卡片使用内置数据源，无需额外配置实体。系统会自动提供相关数据展示。',
        icon: 'mdi:chart-donut'
      }
    };

    return strategyInfo[this._currentStrategy] || strategyInfo.stateless;
  }

  _getEntityValue(key) {
    return this.config.entities?.[key] || '';
  }

  _extractContentBlocks() {
    const blocks = [];
    const entities = this.config.entities || {};
    
    Object.entries(entities).forEach(([key, value]) => {
      // 只处理内容块类型字段，排除标题、页脚等特殊字段
      if (key.endsWith('_type') && 
          !['title', 'subtitle', 'footer', '_layout_columns', '_layout_style', '_layout_spacing'].some(prefix => key.startsWith(prefix))) {
        
        const blockId = key.replace('_type', '');
        
        // 确保值是正确的类型
        const blockType = String(value || 'text');
        const blockContent = String(entities[blockId] || '');
        
        let blockConfig = {};
        const configKey = `${blockId}_config`;
        if (entities[configKey]) {
          try {
            const configStr = String(entities[configKey]);
            blockConfig = JSON.parse(configStr);
          } catch (e) {
            console.warn(`解析内容块配置失败: ${blockId}`, e);
            blockConfig = {};
          }
        }
        
        const order = parseInt(entities[`${blockId}_order`]) || 0;
        
        blocks.push({
          id: blockId,
          type: blockType,
          content: blockContent,
          config: blockConfig,
          order: order
        });
      }
    });

    return blocks.sort((a, b) => a.order - b.order);
  }

  _getBlockIcon(blockType) {
    const icons = {
      text: 'mdi:text',
      sensor: 'mdi:gauge',
      weather: 'mdi:weather-cloudy',
      switch: 'mdi:power',
      image: 'mdi:image'
    };
    return icons[blockType] || 'mdi:cube';
  }

  _getBlockTypeName(blockType) {
    const names = {
      text: '文本块',
      sensor: '传感器',
      weather: '天气',
      switch: '开关',
      image: '图片'
    };
    return names[blockType] || '内容块';
  }

  _getBlockPreview(block) {
    if (block.type === 'text') {
      const content = String(block.content || '');
      return content.substring(0, 15) + (content.length > 15 ? '...' : '');
    }
    if (['sensor', 'weather', 'switch'].includes(block.type) && block.content) {
      const content = String(block.content || '');
      return content.split('.')[1] || content;
    }
    return '点击编辑';
  }

  _onHeaderFieldChanged(field, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [field]: String(value || '')
        }
      }
    }));
  }

  _onEntityChanged(key, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [key]: String(value || '')
        }
      }
    }));
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    this._editingBlock = {
      id: blockId,
      type: 'text',
      content: '',
      config: {},
      order: this._contentBlocks.length
    };
    this._showBlockEditor = true;
  }

  _editContentBlock(block) {
    this._editingBlock = { ...block };
    this._showBlockEditor = true;
  }

  _deleteContentBlock(blockId) {
    if (!confirm('确定要删除这个内容块吗？')) {
      return;
    }

    const newEntities = { ...this.config.entities };
    
    // 删除与内容块相关的所有字段
    Object.keys(newEntities).forEach(key => {
      if (key.startsWith(blockId)) {
        delete newEntities[key];
      }
    });

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  _closeBlockEditor() {
    this._showBlockEditor = false;
    this._editingBlock = null;
  }

  _onBlockTypeChange(type) {
    if (this._editingBlock) {
      this._editingBlock.type = String(type || 'text');
      // 如果切换到非文本类型，清空自定义样式
      if (type !== 'text') {
        this._editingBlock.config = {};
      }
    }
  }

  _onBlockContentChange(content) {
    if (this._editingBlock) {
      this._editingBlock.content = String(content || '');
    }
  }

  _onBlockStyleChange(styleKey, value) {
    if (this._editingBlock) {
      this._editingBlock.config = {
        ...this._editingBlock.config,
        [styleKey]: String(value || '')
      };
    }
  }

  _saveContentBlock() {
    if (!this._editingBlock) return;

    const newEntities = { ...this.config.entities };
    const blockId = this._editingBlock.id;

    // 保存内容块数据 - 确保所有值都是字符串
    newEntities[blockId] = String(this._editingBlock.content || '');
    newEntities[`${blockId}_type`] = String(this._editingBlock.type || 'text');
    newEntities[`${blockId}_order`] = String(this._editingBlock.order || '0');
    
    // 保存配置（如果有）
    if (Object.keys(this._editingBlock.config).length > 0) {
      try {
        newEntities[`${blockId}_config`] = JSON.stringify(this._editingBlock.config);
      } catch (e) {
        console.warn('保存内容块配置失败:', e);
      }
    }

    console.log('Saving content block:', this._editingBlock); // 调试日志
    console.log('New entities:', newEntities); // 调试日志

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));

    this._closeBlockEditor();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}