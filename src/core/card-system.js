// 卡片系统 - 修复版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class CardSystem {
  constructor() {
    this.cards = new Map();
    this._initialized = false;
    this._initializationPromise = null;
  }

  // 初始化
  async initialize() {
    // 如果已经在初始化，返回同一个 Promise
    if (this._initializationPromise) {
      return this._initializationPromise;
    }
    
    // 如果已经初始化完成，直接返回
    if (this._initialized) {
      return Promise.resolve();
    }
    
    // 开始初始化
    this._initializationPromise = this._discoverCards().then(() => {
      this._initialized = true;
      console.log('卡片系统初始化完成，加载了', this.cards.size, '个卡片');
    }).catch(error => {
      console.error('卡片系统初始化失败:', error);
      this._initializationPromise = null;
      throw error;
    });
    
    return this._initializationPromise;
  }

  // 动态发现卡片
  async _discoverCards() {
    const cardModules = [
      () => import('../cards/clock-card.js'),
      () => import('../cards/week-card.js'),
      () => import('../cards/welcome-card.js'),
      () => import('../cards/poetry-card.js'),
      () => import('../cards/dashboard-card.js')
    ];

    const promises = [];
    
    for (const importFn of cardModules) {
      const promise = importFn().then(module => {
        this._registerCardModule(module);
      }).catch(error => {
        console.warn('卡片加载失败:', error);
      });
      promises.push(promise);
    }
    
    await Promise.allSettled(promises);
    
    // 确保至少有一个卡片
    if (this.cards.size === 0) {
      console.warn('未加载到任何卡片，创建默认卡片');
      // 创建默认的时钟卡片
      this.cards.set('clock', {
        id: 'clock',
        meta: {
          name: '时钟',
          description: '显示当前时间和日期',
          icon: '⏰',
          category: '时间'
        },
        schema: {
          use24Hour: { type: 'boolean', label: '24小时制', default: true },
          showDate: { type: 'boolean', label: '显示日期', default: true },
          showWeekday: { type: 'boolean', label: '显示星期', default: true },
          showSeconds: { type: 'boolean', label: '显示秒数', default: false }
        },
        template: (config, { hass }) => {
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          
          return html`
            <div class="clock-card">
              <div class="card-wrapper">
                <div class="card-content layout-center">
                  <div class="clock-time card-emphasis">
                    ${hours}:${minutes}${config.showSeconds ? `:${seconds}` : ''}
                  </div>
                  ${config.showDate ? html`
                    <div class="clock-date card-subtitle">
                      ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日
                    </div>
                  ` : ''}
                  ${config.showWeekday ? html`
                    <div class="clock-weekday card-caption">
                      ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        },
        styles: (config) => css`
          .clock-card {
            min-height: 160px;
          }
          
          .clock-time {
            font-size: var(--cf-font-size-4xl);
            letter-spacing: 1px;
            margin: var(--cf-spacing-md) 0;
          }
        `
      });
    }
  }

  // 注册卡片模块
  _registerCardModule(module) {
    if (!module.card) {
      console.warn('模块中没有 card 导出:', module);
      return;
    }
    
    const card = module.card;
    const cardId = card.id;
    
    if (!cardId) {
      console.warn('卡片没有 id:', card);
      return;
    }
    
    console.log('注册卡片:', cardId);
    this.cards.set(cardId, card);
  }

  // 获取卡片定义
  getCard(cardId) {
    if (!this._initialized) {
      console.warn('卡片系统未初始化，尝试获取卡片:', cardId);
      return null;
    }
    
    const card = this.cards.get(cardId);
    if (!card) {
      console.warn('卡片不存在:', cardId, '可用卡片:', Array.from(this.cards.keys()));
    }
    return card || null;
  }

  // 获取默认卡片
  getDefaultCard() {
    if (!this._initialized) return null;
    
    const defaultCards = ['clock', 'welcome', 'dashboard'];
    for (const cardId of defaultCards) {
      if (this.cards.has(cardId)) {
        return this.getCard(cardId);
      }
    }
    return this.cards.values().next().value || null;
  }

  // 获取所有卡片
  getAllCards() {
    if (!this._initialized) return [];
    
    return Array.from(this.cards.values()).map(card => ({
      id: card.id,
      ...card.meta,
      schema: card.schema || {},
      blockType: card.blockType || 'none'
    }));
  }

  // 渲染卡片
  renderCard(cardId, userConfig = {}, hass = null) {
    if (!this._initialized) {
      throw new Error('卡片系统未初始化');
    }
    
    const card = this.getCard(cardId);
    if (!card) {
      throw new Error(`卡片不存在: ${cardId}`);
    }

    // 合并配置
    const config = this._mergeConfig(card.schema || {}, userConfig);
    
    try {
      console.log('渲染卡片:', cardId, '配置:', config);
      
      // 调用卡片的 template 方法
      let template;
      if (typeof card.template === 'function') {
        template = card.template(config, { hass });
      } else {
        console.warn(`卡片 "${cardId}" 的 template 不是函数，使用空模板`);
        template = html`<div>卡片模板错误</div>`;
      }
      
      // 确保 template 是有效的 TemplateResult
      if (!template || !template._$litType$) {
        console.warn(`卡片 "${cardId}" 的 template 不是有效的 TemplateResult`);
        template = html`<div>无效的卡片模板</div>`;
      }
      
      // 调用卡片的 styles 方法
      let styles = css``;
      if (typeof card.styles === 'function') {
        styles = card.styles(config);
      } else if (card.styles) {
        styles = card.styles;
      }
      
      console.log('卡片渲染完成:', {
        cardId,
        templateType: typeof template,
        stylesType: typeof styles
      });
      
      return {
        template,
        styles,
        config
      };
    } catch (error) {
      console.error(`卡片 "${cardId}" 渲染失败:`, error);
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  // 合并配置
  _mergeConfig(schema, userConfig) {
    const config = { ...userConfig };
    
    // 应用schema中的默认值
    if (schema) {
      Object.entries(schema).forEach(([key, field]) => {
        if (config[key] === undefined && field.default !== undefined) {
          config[key] = field.default;
        }
      });
    }
    
    // 确保有blocks字段
    if (config.blocks === undefined) {
      config.blocks = {};
    }
    
    return config;
  }
}

// 全局实例
const cardSystem = new CardSystem();

export { cardSystem, CardSystem };
