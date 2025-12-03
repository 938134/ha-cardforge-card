// src/cards/welcome-card.js - 优化版
export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息，显示每日一言和实体状态',
    icon: '👋',
    category: '信息',
    version: '3.0.0',
    author: 'CardForge'
  },
  
  // 支持自定义块
  blockType: 'custom',
  
  // 区域配置
  layout: {
    areas: [
      { id: 'content', label: '内容区', maxBlocks: 10 }
    ]
  },
  
  schema: {
    showUser: {
      type: 'boolean',
      label: '显示用户',
      default: true
    },
    showTime: {
      type: 'boolean',
      label: '显示时间',
      default: true
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    },
    quoteSource: {
      type: 'select',
      label: '名言来源',
      options: [
        { value: 'default', label: '内置名言库' },
        { value: 'entity', label: '实体内容' }
      ],
      default: 'default'
    },
    // 当quoteSource为entity时显示的字段
    quoteEntity: {
      type: 'entity',
      label: '名言实体',
      default: '',
      visibleWhen: (config) => config.quoteSource === 'entity'
    },
    // 自定义问候语
    customGreeting: {
      type: 'text',
      label: '自定义问候语',
      placeholder: '例如：欢迎回家！',
      default: ''
    },
    // 布局选项
    layout: {
      type: 'select',
      label: '布局方式',
      options: [
        { value: 'vertical', label: '垂直排列' },
        { value: 'horizontal', label: '水平排列' }
      ],
      default: 'vertical'
    }
  },
  
  template: (config, data, context) => {
    const hass = data.hass;
    const now = new Date();
    const hour = now.getHours();
    
    // 获取用户名
    let userName = '朋友';
    if (config.showUser && hass?.user?.name) {
      userName = hass.user.name;
    } else if (config.showUser && hass?.states) {
      // 尝试从实体获取用户信息
      const personEntities = Object.keys(hass.states).filter(id => 
        id.startsWith('person.')
      );
      if (personEntities.length > 0) {
        const firstPerson = hass.states[personEntities[0]];
        userName = firstPerson.attributes?.friendly_name || '朋友';
      }
    }
    
    // 获取问候语
    let greeting = config.customGreeting;
    if (!greeting) {
      greeting = getGreetingByTime(hour, userName);
    }
    
    // 获取时间显示
    let timeHtml = '';
    if (config.showTime) {
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeHtml = `<div class="welcome-time">${hours}:${minutes}</div>`;
    }
    
    // 获取名言
    let quoteHtml = '';
    if (config.showQuote) {
      let quoteText = '';
      
      if (config.quoteSource === 'entity' && config.quoteEntity && hass?.states?.[config.quoteEntity]) {
        // 从实体获取名言
        quoteText = hass.states[config.quoteEntity].state;
      } else {
        // 使用内置名言
        quoteText = getDailyQuote(now);
      }
      
      if (quoteText) {
        quoteHtml = `
          <div class="quote-section">
            <div class="quote-divider"></div>
            <div class="quote-content">${escapeHtml(quoteText)}</div>
          </div>
        `;
      }
    }
    
    // 获取块内容
    let blocksHtml = '';
    if (config.blocks && Object.keys(config.blocks).length > 0) {
      // 如果有自定义块，使用块渲染
      blocksHtml = context.renderBlocks(config.blocks);
    }
    
    const layoutClass = config.layout === 'horizontal' ? 'layout-horizontal' : 'layout-vertical';
    
    return `
      <div class="welcome-card ${layoutClass}">
        <div class="welcome-main">
          <div class="welcome-content">
            ${greeting ? `<div class="welcome-greeting">${escapeHtml(greeting)}</div>` : ''}
            ${timeHtml}
            ${quoteHtml}
          </div>
          
          ${blocksHtml ? `
            <div class="welcome-blocks">
              ${blocksHtml}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // 辅助函数
    function getGreetingByTime(hour, name) {
      if (hour >= 5 && hour < 12) return `早上好，${name}！`;
      if (hour >= 12 && hour < 14) return `中午好，${name}！`;
      if (hour >= 14 && hour < 18) return `下午好，${name}！`;
      if (hour >= 18 && hour < 22) return `晚上好，${name}！`;
      return `你好，${name}！`;
    }
    
    function getDailyQuote(date) {
      const quotes = [
        "生活不是等待风暴过去，而是学会在雨中跳舞。",
        "成功的秘诀在于对目标的执着追求。",
        "每一天都是一个新的开始，深呼吸，重新出发。",
        "梦想不会逃跑，逃跑的永远都是自己。",
        "生活就像骑自行车，想保持平衡就得往前走。",
        "最困难的时候，就是我们离成功不远的时候。",
        "今天应做的事没有做，明天再早也是耽误了。",
        "人生没有彩排，每一天都是现场直播。",
        "不要等待机会，而要创造机会。",
        "世上没有绝望的处境，只有对处境绝望的人。"
      ];
      
      // 基于日期选择名言，确保每天一致
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const index = dayOfYear % quotes.length;
      return quotes[index];
    }
    
    function escapeHtml(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    
    return `
      .welcome-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 160px;
        padding: 20px;
      }
      
      .welcome-main {
        width: 100%;
        max-width: 800px;
      }
      
      .welcome-content {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .welcome-greeting {
        font-size: 1.6em;
        font-weight: 400;
        color: var(--cf-text-primary);
        margin-bottom: 16px;
        line-height: 1.3;
      }
      
      .welcome-time {
        font-size: 2.4em;
        font-weight: 300;
        color: ${primaryColor};
        letter-spacing: 1px;
        margin-bottom: 16px;
      }
      
      .quote-section {
        max-width: 600px;
        margin: 0 auto;
      }
      
      .quote-divider {
        width: 60px;
        height: 1px;
        background: var(--cf-border);
        margin: 0 auto 12px auto;
        opacity: 0.6;
      }
      
      .quote-content {
        font-size: 1em;
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-style: italic;
      }
      
      /* 块区域 */
      .welcome-blocks {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 24px;
      }
      
      .welcome-blocks .cardforge-block {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-md);
        padding: 12px;
        min-height: 80px;
        transition: all var(--cf-transition-fast);
      }
      
      .welcome-blocks .cardforge-block:hover {
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-color: ${primaryColor};
        transform: translateY(-2px);
      }
      
      .welcome-blocks .block-icon {
        font-size: 1.2em;
        color: ${primaryColor};
        margin-bottom: 8px;
      }
      
      .welcome-blocks .block-name {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }
      
      .welcome-blocks .block-value {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      /* 水平布局 */
      .welcome-card.layout-horizontal .welcome-main {
        display: flex;
        align-items: center;
        gap: 40px;
      }
      
      .welcome-card.layout-horizontal .welcome-content {
        text-align: left;
        flex: 1;
        margin-bottom: 0;
      }
      
      .welcome-card.layout-horizontal .welcome-blocks {
        flex: 1;
        margin-top: 0;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 800px) {
        .welcome-card.layout-horizontal .welcome-main {
          flex-direction: column;
          gap: 24px;
        }
        
        .welcome-card.layout-horizontal .welcome-content {
          text-align: center;
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .welcome-card {
          padding: 16px;
        }
        
        .welcome-greeting {
          font-size: 1.4em;
        }
        
        .welcome-time {
          font-size: 2em;
        }
        
        .quote-content {
          font-size: 0.9em;
        }
        
        .welcome-blocks {
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .welcome-card {
          padding: 12px;
          min-height: 140px;
        }
        
        .welcome-greeting {
          font-size: 1.2em;
          margin-bottom: 12px;
        }
        
        .welcome-time {
          font-size: 1.8em;
          margin-bottom: 12px;
        }
        
        .welcome-blocks {
          grid-template-columns: 1fr;
        }
      }
      
      /* 块为空时的默认样式 */
      .welcome-blocks:empty {
        display: none;
      }
      
      /* 块编辑提示 */
      .welcome-blocks .cardforge-block[data-empty="true"] {
        background: rgba(var(--cf-rgb-primary), 0.02);
        border: 2px dashed var(--cf-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-secondary);
        font-style: italic;
        cursor: pointer;
      }
      
      .welcome-blocks .cardforge-block[data-empty="true"]:hover {
        border-color: ${primaryColor};
        color: ${primaryColor};
      }
    `;
  },
  
  layout: {
    type: 'single',
    recommendedSize: 3
  }
};

export class WelcomeCard {
  static card = card;
}
