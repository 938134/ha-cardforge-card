// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  version: '1.3.0',
  description: '精简版古典诗词显示',
  author: 'CardForge Team',
  category: 'info',
  icon: '📜',
  entityRequirements: [
    {
      key: 'title_source',
      description: '标题来源（实体ID或Jinja2模板）',
      required: false
    },
    {
      key: 'author_source',
      description: '作者来源（实体ID或Jinja2模板）',
      required: false
    },
    {
      key: 'content_source',
      description: '内容来源（实体ID或Jinja2模板）',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: false
};

export default class PoetryCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    // 使用统一数据获取方法
    const title = this._getCardValue(hass, entities, 'title_source', '无题');
    const author = this._getCardValue(hass, entities, 'author_source', '佚名');
    const content = this._getCardValue(hass, entities, 'content_source', '');
    
    return `
      <div class="cardforge-card poetry-card">
        <div class="poetry-content">
          <div class="poetry-title">${title}</div>
          <div class="poetry-author">${author}</div>
          <div class="poetry-text">
            ${this._formatPoetryContent(content)}
          </div>
        </div>
        <div class="poetry-seal">詩</div>
      </div>
    `;
  }

  _formatPoetryContent(content) {
    if (!content) {
      return '<div class="poetry-line">暂无诗词内容</div>';
    }
    
    // 精简版：只在句号后换行
    const lines = content.split('。').filter(line => line.trim());
    
    return lines.map(line => {
      const trimmedLine = line.replace(/^，|^、/, '').trim(); // 去除开头的标点
      return trimmedLine ? `<div class="poetry-line">${trimmedLine}。</div>` : '';
    }).join('');
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .poetry-card {
        ${this._responsivePadding('20px', '16px')}
        ${this._responsiveHeight('200px', '180px')}
        position: relative;
        overflow: hidden;
      }
      
      .poetry-content {
        position: relative;
        z-index: 2;
        height: 100%;
        ${this._flexColumn()}
        justify-content: center;
        ${this._textCenter()}
      }
      
      .poetry-title {
        ${this._responsiveFontSize('1.3em', '1.1em')}
        font-weight: 700;
        ${this._responsiveMargin('0 0 8px', '0 0 6px')}
        font-family: "SimSun", "宋体", serif;
        letter-spacing: 2px;
      }
      
      .poetry-author {
        ${this._responsiveFontSize('0.9em', '0.8em')}
        ${this._responsiveMargin('0 0 16px', '0 0 12px')}
        font-family: "SimSun", "宋体", serif;
        opacity: 0.8;
        font-style: italic;
      }
      
      .poetry-text {
        line-height: 1.6;
      }
      
      .poetry-line {
        ${this._responsiveFontSize('1em', '0.9em')}
        ${this._responsiveMargin('0 0 4px', '0 0 3px')}
        font-family: "SimSun", "宋体", serif;
        letter-spacing: 1px;
      }
      
      .poetry-seal {
        position: absolute;
        bottom: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        border: 2px solid currentColor;
        ${this._borderRadius('4px')}
        ${this._flexCenter()}
        font-size: 14px;
        font-weight: bold;
        opacity: 0.3;
        font-family: "SimSun", "宋体", serif;
        transform: rotate(15deg);
      }
      
      /* 主题适配 */
      .poetry-card.glass {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      
      .poetry-card.gradient {
        color: white;
      }
      
      .poetry-card.neon {
        color: #ffd700;
      }
      
      /* 悬停效果 */
      .poetry-card:hover .poetry-seal {
        animation: sealRotate 1.5s ease-in-out;
      }
      
      @keyframes sealRotate {
        0%, 100% {
          transform: rotate(15deg) scale(1);
        }
        50% {
          transform: rotate(25deg) scale(1.1);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 480px) {
        .poetry-seal {
          width: 30px;
          height: 30px;
          font-size: 12px;
          bottom: 8px;
          right: 8px;
        }
      }
    `;
  }

  getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      gradientColors: ['#fef7ed', '#f8f4e9']
    };
  }
}