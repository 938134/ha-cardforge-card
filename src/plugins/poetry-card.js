// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  version: '1.2.0',
  description: '显示古典诗词，支持灵活数据源配置',
  author: 'CardForge Team',
  category: 'info',
  icon: '📜',
  dataSourceRequirements: [
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
      key: 'dynasty_source',
      description: '朝代来源（实体ID或Jinja2模板）',
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
    const dynasty = this._getCardValue(hass, entities, 'dynasty_source', '未知朝代');
    const content = this._getCardValue(hass, entities, 'content_source', '');
    
    return `
      <div class="cardforge-card poetry-card theme-${config.theme || 'auto'}">
        <div class="poetry-content">
          <!-- 第一行：标题居中 -->
          <div class="poetry-title">${title}</div>
          
          <!-- 第二行：朝代-作者靠右 -->
          <div class="poetry-meta">${dynasty} · ${author}</div>
          
          <!-- 诗词内容：标点后换行居中 -->
          <div class="poetry-text">
            ${this._formatPoetryContent(content)}
          </div>
        </div>
        
        <div class="poetry-decoration">
          <div class="seal"></div>
        </div>
      </div>
    `;
  }

  _formatPoetryContent(content) {
    if (!content) {
      return '<div class="poetry-line">暂无诗词内容</div>';
    }
    
    // 在标点符号后添加换行，并居中显示
    const punctuations = ['，', '。', '！', '？', '；', '：', '、'];
    let formattedContent = content;
    
    // 在标点符号后添加换行标记
    punctuations.forEach(punc => {
      formattedContent = formattedContent.replace(new RegExp(punc, 'g'), `${punc}<br>`);
    });
    
    // 分割成行，每行居中显示
    const lines = formattedContent.split('<br>').filter(line => line.trim());
    
    return lines.map(line => `
      <div class="poetry-line">${line}</div>
    `).join('');
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .poetry-card {
        ${this._responsivePadding('var(--cardforge-spacing-lg)', 'var(--cardforge-spacing-md)')}
        ${this._responsiveHeight('280px', '240px')}
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #fef7ed 0%, #f8f4e9 100%);
        border: 1px solid #e8dfca;
        color: #5c4b37;
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
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 700;
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-sm)', '0 0 var(--cardforge-spacing-xs)')}
        color: #8b4513;
        font-family: "SimSun", "宋体", serif;
        ${this._textShadow()}
        letter-spacing: 2px;
      }
      
      .poetry-meta {
        ${this._responsiveFontSize('0.9em', '0.8em')}
        color: #a0522d;
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-lg)', '0 0 var(--cardforge-spacing-md)')}
        font-family: "SimSun", "宋体", serif;
        opacity: 0.8;
        font-style: italic;
        letter-spacing: 1px;
      }
      
      .poetry-text {
        line-height: 1.8;
        font-family: "SimSun", "宋体", serif;
      }
      
      .poetry-line {
        ${this._responsiveFontSize('1.1em', '1em')}
        ${this._responsiveMargin('0 0 var(--cardforge-spacing-sm)', '0 0 var(--cardforge-spacing-xs)')}
        color: #654321;
        ${this._textShadow()}
        letter-spacing: 1px;
      }
      
      .poetry-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
        opacity: 0.1;
      }
      
      .seal {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border: 2px solid #8b4513;
        ${this._borderRadius('5px')}
        transform: rotate(15deg);
        ${this._flexCenter()}
        font-size: 12px;
        color: #8b4513;
        font-weight: bold;
      }
      
      .seal::before {
        content: '詩';
        font-family: "SimSun", "宋体", serif;
      }
      
      /* 悬停效果 */
      .poetry-card:hover .seal {
        animation: sealRotate 2s ease-in-out;
      }
      
      @keyframes sealRotate {
        0%, 100% {
          transform: rotate(15deg);
        }
        50% {
          transform: rotate(25deg);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 480px) {
        .seal {
          width: 40px;
          height: 40px;
          bottom: 15px;
          right: 15px;
          font-size: 10px;
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
