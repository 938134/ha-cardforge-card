// src/ha-cardforge-card.js - 完整优化版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { cardSystem } from './core/card-system.js';
import { themeSystem } from './core/theme-system.js';
import { designSystem } from './core/design-system.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cardData: { state: true },
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
      
      .cardforge-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        text-align: center;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
      }
      
      .error-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .error-message {
        font-size: 0.9em;
        line-height: 1.4;
        white-space: pre-line;
        text-align: left;
      }
      
      .repair-hint {
        margin-top: 12px;
        padding: 12px;
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
        font-size: 0.85em;
        line-height: 1.4;
        text-align: left;
        max-width: 100%;
      }
      
      .repair-hint ol {
        margin: 8px 0;
        padding-left: 20px;
      }
      
      .repair-hint li {
        margin-bottom: 4px;
      }
      
      .cardforge-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        color: var(--cf-text-secondary);
      }
      
      ha-card {
        height: 100%;
        overflow: hidden;
      }
    `
  ];

  constructor() {
    super();
    this._cardData = null;
    this._error = null;
    this._loading = false;
  }

  async setConfig(config) {
    try {
      this._loading = true;
      this._error = null;
      
      this.config = await this._validateAndMergeConfig(config);
      
      await cardSystem.initialize();
      await themeSystem.initialize();
      
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      
      this._loading = false;
      
    } catch (error) {
      this._error = error.message || '未知错误';
      this._loading = false;
    }
  }

  async _validateAndMergeConfig(userConfig) {
    if (!userConfig) {
      return this.constructor.getStubConfig();
    }
    
    let card_type = userConfig.card_type;
    if (!card_type && userConfig.cardType) {
      card_type = userConfig.cardType;
      delete userConfig.cardType;
    }
    
    if (!card_type) {
      throw new Error(
        '请为卡片工坊指定卡片类型（card_type）。\n\n' +
        '配置示例：\n' +
        'type: custom:ha-cardforge-card\n' +
        'card_type: clock\n\n' +
        '请通过Home Assistant的卡片编辑器重新添加此卡片，' +
        '或手动在YAML配置中添加card_type字段。\n\n' +
        '提示：首次配置必须使用卡片编辑器。'
      );
    }
    
    await cardSystem.initialize();
    
    const card = cardSystem.getCard(card_type);
    if (!card) {
      throw new Error(
        `卡片类型 "${card_type}" 不存在或无法加载。\n\n` +
        `可能的原因：\n` +
        `1. 卡片定义文件缺失或错误\n` +
        `2. 卡片工坊插件未完全加载\n` +
        `3. 输入了错误的卡片类型\n\n` +
        `请通过卡片编辑器重新选择卡片类型，或检查卡片工坊的安装。`
      );
    }
    
    const defaultConfig = {};
    const schema = card.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    const mergedConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: card_type,
      theme: userConfig.theme || 'auto',
      ...defaultConfig,
      ...userConfig
    };
    
    delete mergedConfig.cardType;
    
    return mergedConfig;
  }

  _getAvailableCardTypes() {
    try {
      const cards = cardSystem.getAllCards();
      
      if (cards && cards.length > 0) {
        return cards;
      }
      
      return [];
      
    } catch (error) {
      return [];
    }
  }

  render() {
    if (this._error) {
      let repairHint = null;
      
      if (this._error.includes('card_type')) {
        repairHint = html`
          <div class="repair-hint">
            <strong>修复步骤：</strong>
            <ol>
              <li>在仪表盘编辑器中点击此卡片</li>
              <li>选择"编辑卡片"或"配置"按钮</li>
              <li>在弹出窗口中选择卡片类型</li>
              <li>点击"保存"按钮</li>
              <li>或者手动在YAML中添加: <code>card_type: clock</code></li>
            </ol>
          </div>
        `;
      }
      
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">❌</div>
              <div class="error-message">${this._error}</div>
              ${repairHint}
            </div>
          </div>
        </ha-card>
      `;
    }
    
    if (this._loading || !this._cardData) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-loading">
              <ha-circular-progress indeterminate></ha-circular-progress>
              <div>加载中...</div>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    try {
      const themeStyles = themeSystem.getThemeStyles(this.config.theme || 'auto');
      const cardStyles = this._cardData.styles || '';
      
      return html`
        <ha-card>
          <div class="cardforge-container">
            ${unsafeHTML(this._cardData.template)}
          </div>
        </ha-card>
        
        <style>
          ${themeStyles}
          ${cardStyles}
        </style>
      `;
    } catch (error) {
      return html`
        <ha-card>
          <div class="cardforge-container">
            <div class="cardforge-error">
              <div class="error-icon">⚠️</div>
              <div class="error-message">卡片渲染失败: ${error.message}</div>
            </div>
          </div>
        </ha-card>
      `;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateCard();
    }
  }

  async _updateCard() {
    if (!this.config?.card_type) return;
    
    try {
      const themeVariables = themeSystem.getThemeVariables(this.config.theme || 'auto');
      this._cardData = cardSystem.renderCard(
        this.config.card_type,
        this.config,
        this.hass,
        themeVariables
      );
      this.requestUpdate();
    } catch (error) {
      // 静默处理
    }
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto',
      showDate: true,
      showWeekday: true
    };
  }

  getCardSize() {
    const card = cardSystem.getCard(this.config?.card_type);
    return card?.layout?.recommendedSize || 3;
  }

  static getConfigElement() {
    return document.createElement('card-editor');
  }
}

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

export { HaCardForgeCard };