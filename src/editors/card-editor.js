// src/editors/card-editor.js - 完整修复版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _initialized: { state: true },
    _lastConfig: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
        min-width: 350px;
      }
      
      .editor-section {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .editor-section:last-child {
        border-bottom: none;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .section-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      /* 卡片选择器样式 */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: var(--cf-spacing-md);
      }
      
      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        min-height: 90px;
      }
      
      .card-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
        box-shadow: var(--cf-shadow-md);
      }
      
      .card-icon {
        font-size: 1.8em;
        margin-bottom: 8px;
      }
      
      .card-name {
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .card-item.selected .card-name {
        color: white;
      }
      
      /* 主题选择器样式 */
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: var(--cf-spacing-md);
      }
      
      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        min-height: 100px;
      }
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
        border-width: 2px;
        transform: translateY(-2px);
      }
      
      .theme-preview {
        width: 100%;
        height: 50px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 10px;
        border: 2px solid transparent;
        transition: all var(--cf-transition-fast);
      }
      
      .theme-item.selected .theme-preview {
        border-color: var(--cf-primary-color);
      }
      
      .theme-name {
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.2;
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }
      
      /* 配置表单 */
      .config-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }
      
      /* 开关组 */
      .switch-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .switch-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }
      
      .switch-item:hover {
        border-color: var(--cf-primary-color);
      }
      
      .switch-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        flex: 1;
      }
      
      /* 表单字段 */
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
      }
      
      /* 确保表单组件样式一致 */
      ha-textfield, ha-select, ha-combo-box, ha-icon-picker {
        width: 100%;
      }
      
      /* 响应式 */
      @media (max-width: 480px) {
        .card-grid,
        .theme-grid {
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: var(--cf-spacing-sm);
        }
        
        .card-item,
        .theme-item {
          padding: var(--cf-spacing-sm);
          min-height: 80px;
        }
        
        .theme-preview {
          height: 40px;
        }
        
        .switch-group {
          grid-template-columns: 1fr;
        }
      }
    `
  ];

  constructor() {
    super();
    // 初始配置
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto'
    };
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
    this._lastConfig = null;
  }

  async firstUpdated() {
    console.log('🔄 初始化编辑器...');
    
    await cardSystem.initialize();
    await themeSystem.initialize();
    
    this._cards = cardSystem.getAllCards();
    this._themes = themeSystem.getAllThemes();
    this._initialized = true;
    
    console.log('📋 加载卡片:', this._cards.length, '个');
    console.log('🎨 加载主题:', this._themes.length, '个');
    
    // 如果配置中没有 card_type，设置为第一个卡片
    if (!this.config.card_type && this._cards.length > 0) {
      const firstCard = this._cards[0];
      console.log('🎯 设置默认卡片:', firstCard.id);
      
      this.config = this._buildCardConfig(firstCard.id, {});
      this._selectedCard = cardSystem.getCard(firstCard.id);
      this._lastConfig = JSON.stringify(this.config);
      
      console.log('📤 发送初始配置');
      this._notifyConfigChange();
    } else if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
      console.log('📋 已有卡片:', this.config.card_type);
    }
  }

  setConfig(config) {
    console.log('📥 编辑器收到配置:', config);
    
    if (!config || typeof config !== 'object') {
      console.log('⚠️ 无效配置，保持默认');
      return;
    }
    
    // 处理传入的配置
    let newConfig = { ...config };
    
    // 确保有 card_type
    if (!newConfig.card_type) {
      if (this._cards.length > 0) {
        const firstCard = this._cards[0];
        newConfig = this._buildCardConfig(firstCard.id, newConfig);
        console.log('🎯 补充缺失的 card_type:', newConfig.card_type);
      } else {
        console.log('⚠️ 无可用卡片，使用时钟卡片');
        newConfig.card_type = 'clock';
      }
    }
    
    // 获取卡片定义并应用默认值
    const cardDef = cardSystem.getCard(newConfig.card_type);
    if (cardDef) {
      this._selectedCard = cardDef;
      
      // 应用卡片默认值（仅对缺失的字段）
      const defaultConfig = {};
      const schema = cardDef.schema || {};
      Object.entries(schema).forEach(([key, field]) => {
        if (field.default !== undefined && newConfig[key] === undefined) {
          defaultConfig[key] = field.default;
        }
      });
      
      if (Object.keys(defaultConfig).length > 0) {
        console.log('⚙️ 补充默认值:', defaultConfig);
        newConfig = { ...newConfig, ...defaultConfig };
      }
    }
    
    // 确保配置完整
    newConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: newConfig.card_type || 'clock',
      theme: newConfig.theme || 'auto',
      ...newConfig
    };
    
    // 删除可能存在的旧字段
    delete newConfig.cardType;
    
    // 检查配置是否变化
    const newConfigStr = JSON.stringify(newConfig);
    if (newConfigStr !== this._lastConfig) {
      console.log('🔄 配置更新:', newConfig);
      this.config = newConfig;
      this._lastConfig = newConfigStr;
      this.requestUpdate();
    } else {
      console.log('⚡ 配置无变化，跳过更新');
    }
  }

  render() {
    if (!this._initialized) {
      return html`
        <div class="editor-container">
          <div class="editor-section">
            <div class="empty-state">
              <div class="empty-icon">⏳</div>
              <div>初始化编辑器中...</div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="editor-container">
        ${this._renderCardSelectionSection()}
        ${this.config.card_type ? this._renderThemeSelectionSection() : ''}
        ${this.config.card_type && this._selectedCard?.schema ? this._renderCardSettings() : ''}
      </div>
    `;
  }

  _renderCardSelectionSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span class="section-title">选择卡片类型</span>
        </div>
        <div class="card-grid">
          ${this._cards.map(card => html`
            <div 
              class="card-item ${this.config.card_type === card.id ? 'selected' : ''}"
              @click=${() => this._selectCard(card)}
              title="${card.description}"
            >
              <div class="card-icon">${card.icon}</div>
              <div class="card-name">${card.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderThemeSelectionSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:format-paint"></ha-icon>
          <span class="section-title">选择主题</span>
        </div>
        <div class="theme-grid">
          ${this._themes.map(theme => {
            const preview = themeSystem.getThemePreview(theme.id);
            return html`
              <div 
                class="theme-item ${this.config.theme === theme.id ? 'selected' : ''}"
                @click=${() => this._selectTheme(theme.id)}
                title="${theme.description}"
              >
                <div class="theme-preview" style="
                  background: ${preview.background};
                  color: ${preview.color};
                  border: ${preview.border};
                  ${preview.boxShadow ? `box-shadow: ${preview.boxShadow};` : ''}
                "></div>
                <div class="theme-name">${theme.name}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _renderCardSettings() {
    const schema = this._selectedCard?.schema || {};
    const schemaKeys = Object.keys(schema);
    
    if (schemaKeys.length === 0) {
      return html`
        <div class="editor-section">
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div>此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    // 分离布尔字段和其他字段
    const booleanFields = [];
    const otherFields = [];
    
    schemaKeys.forEach(key => {
      const field = schema[key];
      // 检查字段是否应该显示
      if (field.visibleWhen && typeof field.visibleWhen === 'function') {
        if (!field.visibleWhen(this.config)) {
          return; // 跳过这个字段
        }
      }
      
      if (field.type === 'boolean') {
        booleanFields.push([key, field]);
      } else {
        otherFields.push([key, field]);
      }
    });

    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span class="section-title">卡片设置</span>
        </div>
        
        <!-- 布尔字段（开关组） -->
        ${booleanFields.length > 0 ? html`
          <div class="switch-group">
            ${booleanFields.map(([key, field]) => this._renderBooleanField(key, field))}
          </div>
        ` : ''}
        
        <!-- 其他字段 -->
        ${otherFields.length > 0 ? html`
          <div class="config-form">
            ${otherFields.map(([key, field]) => html`
              <div class="form-field">
                ${this._renderField(key, field)}
                ${field.description ? html`
                  <div class="field-description">${field.description}</div>
                ` : ''}
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderBooleanField(key, field) {
    const value = this.config[key] !== undefined ? this.config[key] : field.default;
    
    return html`
      <div 
        class="switch-item"
        @click=${() => this._updateConfig(key, !value)}
      >
        <ha-switch
          .checked=${value}
          @click=${e => e.stopPropagation()}
          @change=${e => this._updateConfig(key, e.target.checked)}
        ></ha-switch>
        <div class="switch-label">${field.label}</div>
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this.config[key] !== undefined ? this.config[key] : field.default;
    
    switch (field.type) {
      case 'select':
        return this._renderSelectField(key, field, value);
      case 'number':
        return this._renderNumberField(key, field, value);
      case 'entity':
        return this._renderEntityField(key, field, value);
      case 'icon':
        return this._renderIconField(key, field, value);
      default:
        return this._renderTextField(key, field, value);
    }
  }

  _renderSelectField(key, field, value) {
    const options = field.options || [];
    
    return html`
      <ha-select
        .value=${value || ''}
        @closed=${e => e.stopPropagation()}
        naturalMenuWidth
        fixedMenuPosition
        fullwidth
        .label=${field.label}
        @change=${e => this._updateConfig(key, e.target.value)}
      >
        ${options.map(opt => html`
          <ha-list-item .value=${opt.value || opt}>
            ${opt.label || opt}
          </ha-list-item>
        `)}
      </ha-select>
    `;
  }

  _renderNumberField(key, field, value) {
    return html`
      <ha-textfield
        type="number"
        .value=${value}
        @input=${e => this._updateConfig(key, parseInt(e.target.value) || 0)}
        .label=${field.label}
        .min=${field.min}
        .max=${field.max}
        .step=${field.step || 1}
        fullwidth
      ></ha-textfield>
    `;
  }

  _renderEntityField(key, field, value) {
    const entities = this._getAvailableEntities();
    
    return html`
      ${entities.length > 0 ? html`
        <ha-combo-box
          .items=${entities}
          .value=${value || ''}
          @value-changed=${e => this._updateConfig(key, e.detail.value)}
          allow-custom-value
          .label=${field.label}
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${value || ''}
          @input=${e => this._updateConfig(key, e.target.value)}
          .label=${field.label}
          .placeholder=${field.placeholder || '例如: light.living_room'}
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  _renderIconField(key, field, value) {
    return html`
      <ha-icon-picker
        .value=${value || ''}
        @value-changed=${e => this._updateConfig(key, e.detail.value)}
        .label=${field.label}
        fullwidth
      ></ha-icon-picker>
    `;
  }

  _renderTextField(key, field, value) {
    return html`
      <ha-textfield
        .value=${value || ''}
        @input=${e => this._updateConfig(key, e.target.value)}
        .label=${field.label}
        .placeholder=${field.placeholder || ''}
        fullwidth
      ></ha-textfield>
    `;
  }

// 在 card-editor.js 的 _selectCard 方法中添加预设块处理
_selectCard(card) {
  if (this.config.card_type === card.id) {
    console.log('⚡ 已是当前卡片，跳过');
    return;
  }
  
  console.log('🎯 选择卡片:', card.id);
  
  // 获取卡片定义
  const cardDef = cardSystem.getCard(card.id);
  if (!cardDef) return;
  
  // 构建新配置
  const newConfig = this._buildCardConfig(card.id, {
    theme: this.config.theme || 'auto'
  });
  
  // 添加预设块（如果有）
  if (cardDef.blocks?.presets && !this.config.blocks) {
    const presetBlocks = {};
    Object.entries(cardDef.blocks.presets).forEach(([key, preset], index) => {
      const blockId = `block_${key}_${Date.now()}_${index}`;
      presetBlocks[blockId] = {
        ...preset,
        name: preset.name || key,
        content: preset.content || ''
      };
    });
    
    if (Object.keys(presetBlocks).length > 0) {
      newConfig.blocks = presetBlocks;
      console.log('📦 添加预设块:', Object.keys(presetBlocks));
    }
  }
  
  console.log('🔄 新配置:', newConfig);
  
  // 更新状态
  this.config = newConfig;
  this._selectedCard = cardDef;
  this._lastConfig = JSON.stringify(newConfig);
  
  // 立即触发配置更新
  this._notifyConfigChange();
  this.requestUpdate();
}

  _buildCardConfig(cardId, baseConfig = {}) {
    const cardDef = cardSystem.getCard(cardId);
    if (!cardDef) {
      return {
        type: 'custom:ha-cardforge-card',
        card_type: cardId,
        theme: baseConfig.theme || 'auto',
        ...baseConfig
      };
    }
    
    // 应用卡片默认值
    const defaultConfig = {};
    const schema = cardDef.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    // 清理可能存在的其他卡片配置
    const cleanConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: cardId,
      theme: baseConfig.theme || 'auto'
    };
    
    // 保留blocks配置（如果新卡片是仪表盘）
    if (cardId === 'dashboard' && baseConfig.blocks) {
      cleanConfig.blocks = baseConfig.blocks;
    }
    
    return {
      ...cleanConfig,
      ...defaultConfig
    };
  }

  _selectTheme(themeId) {
    if (this.config.theme === themeId) {
      console.log('⚡ 已是当前主题，跳过');
      return; // 已经是当前主题，不重复触发
    }
    
    console.log('🎨 选择主题:', themeId);
    
    this.config = { ...this.config, theme: themeId };
    this._lastConfig = JSON.stringify(this.config);
    this._notifyConfigChange();
  }

  _updateConfig(key, value) {
    // 检查值是否真的变化了
    if (this.config[key] === value) {
      return;
    }
    
    console.log('⚙️ 更新配置:', key, '=', value);
    
    this.config = { ...this.config, [key]: value };
    this._lastConfig = JSON.stringify(this.config);
    this._notifyConfigChange();
  }

  _getAvailableEntities() {
    if (!this.hass?.states) return [];
    
    return Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _notifyConfigChange() {
    console.log('📤 发送配置更新事件');
    
    const event = new CustomEvent('config-changed', {
      bubbles: true,      // 冒泡，让父组件也能收到
      composed: true,     // 跨越 Shadow DOM 边界
      detail: { 
        config: { ...this.config }  // 发送副本，确保是新对象
      }
    });
    
    this.dispatchEvent(event);
    
    // 额外触发事件确保 Home Assistant 收到
    setTimeout(() => {
      const haEvent = new Event('config-changed', {
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(haEvent);
    }, 10);
  }

  getConfig() {
    return { ...this.config };
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };
