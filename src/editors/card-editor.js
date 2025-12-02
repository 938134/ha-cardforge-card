// src/editors/card-editor.js - 修复样式和布局
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

// 确保组件已加载
import './card-selector.js';
import './theme-selector.js';
import './form-builder.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        background: var(--cf-background, #ffffff);
        border-radius: var(--cf-radius-lg, 12px);
        border: 1px solid var(--cf-border, #e0e0e0);
        overflow: hidden;
        min-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .editor-section {
        padding: var(--cf-spacing-lg, 16px);
        border-bottom: 1px solid var(--cf-border, #e0e0e0);
      }
      
      .editor-section:last-child {
        border-bottom: none;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm, 8px);
        margin-bottom: var(--cf-spacing-md, 12px);
      }
      
      .section-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary, #212121);
        line-height: 1.2;
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .editor-container {
          background: #1a1a1a;
          border-color: #404040;
        }
        
        .editor-section {
          border-color: #404040;
        }
        
        .section-title {
          color: #e0e0e0;
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto'
    };
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
  }

  async firstUpdated() {
    console.log('🔄 初始化卡片编辑器...');
    
    try {
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
        this.config = this._buildCardConfig(firstCard.id, {});
        this._selectedCard = cardSystem.getCard(firstCard.id);
        this._notifyConfigChange();
      } else if (this.config.card_type) {
        this._selectedCard = cardSystem.getCard(this.config.card_type);
      }
      
      console.log('✅ 编辑器初始化完成');
      
    } catch (error) {
      console.error('❌ 编辑器初始化失败:', error);
      this._initialized = true; // 仍然标记为已初始化，显示错误
    }
  }

  setConfig(config) {
    console.log('📥 编辑器收到配置:', config);
    
    if (!config || typeof config !== 'object') {
      console.log('⚠️ 无效配置，使用默认');
      return;
    }
    
    // 处理传入的配置
    let newConfig = { ...config };
    
    // 确保有 card_type
    if (!newConfig.card_type) {
      if (this._cards.length > 0) {
        const firstCard = this._cards[0];
        newConfig = this._buildCardConfig(firstCard.id, newConfig);
      } else {
        newConfig.card_type = 'clock';
      }
    }
    
    // 确保配置完整
    newConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: newConfig.card_type || 'clock',
      theme: newConfig.theme || 'auto',
      ...newConfig
    };
    
    delete newConfig.cardType;
    
    this.config = newConfig;
    
    if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
    
    console.log('🔄 最终编辑器配置:', this.config);
    this.requestUpdate();
  }

  render() {
    if (!this._initialized) {
      return html`
        <div class="editor-container">
          <div class="editor-section">
            <div style="text-align: center; padding: 32px; color: var(--cf-text-secondary, #757575);">
              <div style="font-size: 2.5em; margin-bottom: 16px; opacity: 0.5;">⏳</div>
              <div>初始化编辑器中...</div>
            </div>
          </div>
        </div>
      `;
    }

    // 检查组件是否已注册
    const hasCardSelector = customElements.get('card-selector');
    const hasThemeSelector = customElements.get('theme-selector');
    const hasFormBuilder = customElements.get('form-builder');

    if (!hasCardSelector || !hasThemeSelector || !hasFormBuilder) {
      return html`
        <div class="editor-container">
          <div class="editor-section">
            <div style="text-align: center; padding: 32px; color: var(--cf-text-secondary, #757575);">
              <div style="font-size: 2.5em; margin-bottom: 16px; opacity: 0.5;">⚠️</div>
              <div>组件加载失败</div>
              <div style="font-size: 0.9em; margin-top: 8px;">
                card-selector: ${hasCardSelector ? '✓' : '✗'}<br>
                theme-selector: ${hasThemeSelector ? '✓' : '✗'}<br>
                form-builder: ${hasFormBuilder ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="editor-container">
        <!-- 卡片选择器 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:palette" style="color: var(--cf-primary-color, #03a9f4);"></ha-icon>
            <span class="section-title">选择卡片类型</span>
          </div>
          <card-selector
            .cards=${this._cards}
            .selectedCard=${this.config.card_type}
            @card-changed=${this._handleCardChange}
          ></card-selector>
        </div>
        
        ${this.config.card_type ? html`
          <!-- 主题选择器 -->
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:format-paint" style="color: var(--cf-primary-color, #03a9f4);"></ha-icon>
              <span class="section-title">选择主题</span>
            </div>
            <theme-selector
              .themes=${this._themes}
              .selectedTheme=${this.config.theme || 'auto'}
              @theme-changed=${this._handleThemeChange}
            ></theme-selector>
          </div>
        ` : ''}
        
        <!-- 卡片设置表单 -->
        ${this.config.card_type && this._selectedCard?.schema ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cog" style="color: var(--cf-primary-color, #03a9f4);"></ha-icon>
              <span class="section-title">卡片设置</span>
            </div>
            <form-builder
              .config=${this.config}
              .schema=${this._selectedCard.schema}
              .hass=${this.hass}
              @config-changed=${this._handleConfigChange}
            ></form-builder>
          </div>
        ` : ''}
      </div>
    `;
  }

  _handleCardChange(e) {
    const cardId = e.detail.cardId;
    if (this.config.card_type === cardId) return;
    
    console.log('🎯 选择卡片:', cardId);
    
    const cardDef = cardSystem.getCard(cardId);
    if (!cardDef) return;
    
    const newConfig = this._buildCardConfig(cardId, {
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
      }
    }
    
    this.config = newConfig;
    this._selectedCard = cardDef;
    
    this._notifyConfigChange();
    this.requestUpdate();
  }

  _handleThemeChange(e) {
    const themeId = e.detail.theme;
    if (this.config.theme === themeId) return;
    
    console.log('🎨 选择主题:', themeId);
    
    this.config = { ...this.config, theme: themeId };
    this._notifyConfigChange();
  }

  _handleConfigChange(e) {
    const changedConfig = e.detail.config;
    console.log('⚙️ 更新配置:', changedConfig);
    
    this.config = { ...this.config, ...changedConfig };
    this._notifyConfigChange();
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

  _notifyConfigChange() {
    console.log('📤 发送配置更新事件');
    
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: { ...this.config } }
    });
    
    this.dispatchEvent(event);
  }

  getConfig() {
    return { ...this.config };
  }

  static getDefaultConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };