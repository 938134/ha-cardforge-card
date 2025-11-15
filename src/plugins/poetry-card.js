// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '古诗卡片',
    version: '1.0.0',
    description: '显示优美古诗',
    category: '文化',
    icon: '📜',
    entityRequirements: [
      {
        key: 'title',
        description: '诗词标题',
        required: false
      },
      {
        key: 'dynasty',
        description: '诗词朝代',
        required: false
      },
      {
        key: 'famous_line',
        description: '名句',
        required: false
      },
      {
        key: 'poet',
        description: '诗人',
        required: false
      }
    ]
  };

  // 默认诗词数据
  _getDefaultPoetry() {
    return {
      title: '虞美人·春花秋月何时了',
      dynasty: '五代',
      famous_line: '小楼昨夜又东风，故国不堪回首月明中。',
      poet: '李煜'
    };
  }

  // 解析诗词数据
  _parsePoetryData(entities) {
    const defaultData = this._getDefaultPoetry();
    
    return {
      title: this._getEntityValue(entities, 'title', defaultData.title),
      dynasty: this._getEntityValue(entities, 'dynasty', defaultData.dynasty),
      famous_line: this._getEntityValue(entities, 'famous_line', defaultData.famous_line),
      poet: this._getEntityValue(entities, 'poet', defaultData.poet)
    };
  }

  // 获取完整的诗词内容
  _getFullPoetryContent(poetryData) {
    const lines = [
      poetryData.title,
      `朝代：${poetryData.dynasty}`,
      '',
      poetryData.famous_line,
      '',
      `诗人：${poetryData.poet}`
    ];
    
    return lines.join('\n');
  }

  getTemplate(config, hass, entities) {
    const poetryData = this._parsePoetryData(entities);
    
    // 检查是否有有效数据
    const hasData = poetryData.title || poetryData.dynasty || poetryData.famous_line || poetryData.poet;
    
    if (!hasData) {
      return this._renderEmpty('暂无诗词数据', '📜');
    }

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn poetry-card">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            ${poetryData.title ? `
              <div class="cardforge-content-header poetry-title">${this._renderSafeHTML(poetryData.title)}</div>
            ` : ''}
            
            ${poetryData.dynasty ? `
              <div class="cardforge-content-small poetry-dynasty">${this._renderSafeHTML(poetryData.dynasty)}</div>
            ` : ''}
            
            ${poetryData.famous_line ? `
              <div class="cardforge-content-body poetry-famous-line cardforge-multiline">
                ${this._renderSafeHTML(poetryData.famous_line)}
              </div>
            ` : ''}
            
            ${poetryData.poet ? `
              <div class="cardforge-content-small poetry-poet">—— ${this._renderSafeHTML(poetryData.poet)}</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .poetry-card {
        text-align: center;
      }
      
      .poetry-title {
        ${this._cfTextSize('lg')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        line-height: 1.3;
        margin: 0;
      }
      
      .poetry-dynasty {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        font-style: italic;
        margin: 0;
      }
      
      .poetry-famous-line {
        ${this._cfTextSize('md')}
        ${this._cfColor('text')}
        line-height: 1.6;
        margin: var(--cf-spacing-sm) 0;
        font-style: italic;
      }
      
      .poetry-poet {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        margin: 0;
        font-weight: 500;
      }
      
      /* 水墨主题特殊样式 */
      .theme-ink-wash .poetry-card {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
        border: 1px solid #7f8c8d;
      }
      
      .theme-ink-wash .poetry-title {
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .theme-ink-wash .poetry-famous-line {
        color: #ecf0f1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      
      .theme-ink-wash .poetry-dynasty,
      .theme-ink-wash .poetry-poet {
        color: #bdc3c7;
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .poetry-title {
          ${this._cfTextSize('md')}
        }
        
        .poetry-famous-line {
          ${this._cfTextSize('sm')}
          line-height: 1.5;
        }
        
        .poetry-dynasty,
        .poetry-poet {
          ${this._cfTextSize('xs')}
        }
      }
      
      @media (max-width: 400px) {
        .poetry-card {
          ${this._cfPadding('md')}
        }
        
        .poetry-title {
          ${this._cfTextSize('sm')}
        }
        
        .poetry-famous-line {
          ${this._cfTextSize('xs')}
          line-height: 1.4;
        }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;