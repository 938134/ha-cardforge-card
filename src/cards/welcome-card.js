// src/cards/welcome-card.js
import { renderBlocks } from '../core/block-renderer.js';

export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息，显示每日一言',
    icon: '👋',
    category: '信息',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  // 预设块类型
  blockType: 'preset',
  
  // 预设块定义 - 只保留每日一言
  presetBlocks: {
    daily_quote: {
      defaultName: '每日一言',
      defaultIcon: 'mdi:format-quote-close',
      area: 'content',
      required: true,
      description: '显示每日名言警句'
    }
  },
  
  // 区域配置
  layout: {
    areas: [
      { id: 'content', label: '内容区', maxBlocks: 3 }
    ]
  },
  
  schema: {
    showUser: {
      type: 'boolean',
      label: '显示用户',
      default: true
    },
    showGreeting: {
      type: 'boolean',
      label: '显示问候语',
      default: true
    },
    showTime: {
      type: 'boolean',
      label: '显示时间',
      default: true
    }
  },
  
  template: (config, data, context) => {
    const now = new Date();
    const hour = now.getHours();
    const userName = data.hass?.user?.name || '朋友';
    const blocks = config.blocks || {};
    
    // 如果没有块，显示空状态
    if (Object.keys(blocks).length === 0) {
      return `
        <div class="welcome-card">
          <div class="welcome-empty">
            <div class="empty-icon">👋</div>
            <div class="empty-text">欢迎卡片需要配置内容</div>
            <div class="empty-hint">请在编辑器中为预设块关联实体</div>
          </div>
        </div>
      `;
    }
    
    // 问候语
    let greeting = '';
    if (config.showGreeting) {
      if (hour >= 5 && hour < 12) greeting = '早上好';
      else if (hour >= 12 && hour < 14) greeting = '中午好';
      else if (hour >= 14 && hour < 18) greeting = '下午好';
      else if (hour >= 18 && hour < 22) greeting = '晚上好';
      else greeting = '你好';
      
      if (config.showUser) {
        greeting += `，${userName}`;
      }
    } else if (config.showUser) {
      greeting = userName;
    }
    
    // 时间
    const timeStr = config.showTime ? 
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}` : '';
    
    // 使用区域渲染器渲染块
    let blocksHtml = '';
    if (context.renderBlocksByArea) {
      blocksHtml = context.renderBlocksByArea(blocks);
    } else if (context.renderBlocks) {
      blocksHtml = context.renderBlocks(blocks);
    }
    
    return `
      <div class="welcome-card">
        <div class="welcome-content">
          ${greeting ? `<div class="greeting">${escapeHtml(greeting)}</div>` : ''}
          ${timeStr ? `<div class="time">${timeStr}</div>` : ''}
          ${blocksHtml}
        </div>
      </div>
    `;
    
    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    
    return `
      .welcome-card {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 140px;
        padding: 20px;
      }
      
      .welcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        text-align: center;
        width: 100%;
      }
      
      .welcome-empty {
        text-align: center;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
      }
      
      .empty-hint {
        font-size: 0.85em;
        opacity: 0.7;
        margin-top: 8px;
      }
      
      .greeting {
        font-size: 1.4em;
        font-weight: 400;
        color: var(--cf-text-primary);
      }
      
      .time {
        font-size: 2.2em;
        font-weight: 300;
        color: ${primaryColor};
        letter-spacing: 1px;
      }
      
      /* 块样式定制 */
      .welcome-card .cardforge-block {
        background: transparent;
        border: none;
        padding: 8px;
        min-height: 50px;
      }
      
      .welcome-card .block-icon {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
      }
      
      .welcome-card .block-name {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }
      
      .welcome-card .block-value {
        font-size: 1.1em;
        font-weight: 400;
        color: var(--cf-text-primary);
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .welcome-card {
          padding: 16px;
        }
        
        .greeting {
          font-size: 1.2em;
        }
        
        .time {
          font-size: 1.8em;
        }
        
        .welcome-card .block-value {
          font-size: 0.95em;
        }
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
