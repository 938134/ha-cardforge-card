// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    version: '1.0.0',
    description: '优雅的诗词展示卡片，支持自动换行和古典风格',
    category: 'culture',
    icon: '📜',
    author: 'CardForge Team',
    
    config_schema: {
      // 布局配置
      text_alignment: {
        type: 'select',
        label: '文字对齐',
        options: ['left', 'center', 'right'],
        default: 'center',
        description: '诗词文字对齐方式'
      },
      
      font_style: {
        type: 'select',
        label: '字体风格',
        options: ['modern', 'classical', 'elegant'],
        default: 'classical',
        description: '选择适合古诗的字体风格'
      },
      
      show_decoration: {
        type: 'boolean',
        label: '显示装饰',
        default: true,
        description: '显示古典风格的装饰元素'
      },
      
      // 内容配置
      auto_wrap: {
        type: 'boolean',
        label: '自动换行',
        default: true,
        description: '根据标点符号自动换行'
      },
      
      max_lines: {
        type: 'number',
        label: '最大行数',
        default: 10,
        min: 4,
        max: 20,
        description: '内容区域最大显示行数'
      },
      
      // 交互配置
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        description: '启用淡入动画效果'
      }
    },
    
    entity_requirements: [
      {
        key: 'title',
        description: '诗词标题',
        required: false,
        type: 'string'
      },
      {
        key: 'dynasty',
        description: '诗词朝代',
        required: false,
        type: 'string'
      },
      {
        key: 'author',
        description: '诗词作者',
        required: false,
        type: 'string'
      },
      {
        key: 'content',
        description: '诗词内容',
        required: false,
        type: 'string'
      }
    ]
  };

  // 默认诗词数据
  _getDefaultPoetry() {
    return {
      title: '虞美人·春花秋月何时了',
      dynasty: '五代',
      author: '李煜',
      content: '春花秋月何时了？往事知多少。小楼昨夜又东风，故国不堪回首月明中。雕栏玉砌应犹在，只是朱颜改。问君能有几多愁？恰似一江春水向东流。'
    };
  }

  // 解析诗词数据
  _parsePoetryData(entities) {
    const defaultData = this._getDefaultPoetry();
    
    return {
      title: this._getEntityValue(entities, 'title', defaultData.title),
      dynasty: this._getEntityValue(entities, 'dynasty', defaultData.dynasty),
      author: this._getEntityValue(entities, 'author', defaultData.author),
      content: this._getEntityValue(entities, 'content', defaultData.content)
    };
  }

  // 智能换行处理
  _formatPoetryContent(content, autoWrap = true) {
    if (!content) return '';
    
    if (!autoWrap) {
      return content;
    }
    
    // 根据中文标点符号进行换行
    const punctuationMarks = ['。', '？', '！', '；', '，'];
    let formattedContent = content;
    
    // 在标点符号后添加换行
    punctuationMarks.forEach(mark => {
      formattedContent = formattedContent.replace(new RegExp(mark, 'g'), mark + '\n');
    });
    
    // 清理多余的换行和空格
    formattedContent = formattedContent
      .replace(/\n+/g, '\n')  // 多个换行合并为一个
      .replace(/^\n+|\n+$/g, '')  // 去除首尾换行
      .replace(/ \n/g, '\n')  // 去除换行前的空格
      .replace(/\n /g, '\n'); // 去除换行后的空格
    
    return formattedContent;
  }

  getTemplate(config, hass, entities) {
    const poetryData = this._parsePoetryData(entities);
    
    // 检查是否有有效数据
    const hasData = poetryData.title || poetryData.dynasty || poetryData.author || poetryData.content;
    
    if (!hasData) {
      return this._renderEmpty('暂无诗词数据', '📜');
    }

    const textAlignment = config.text_alignment || 'center';
    const fontStyle = config.font_style || 'classical';
    const showDecoration = config.show_decoration !== false;
    const autoWrap = config.auto_wrap !== false;
    const maxLines = config.max_lines || 10;
    const enableAnimations = config.enable_animations !== false;

    const formattedContent = this._formatPoetryContent(poetryData.content, autoWrap);

    return `
      <div class="cardforge-responsive-container poetry-card ${enableAnimations ? 'with-animations' : ''}">
        <div class="cardforge-content-grid">
          <div class="poetry-layout text-${textAlignment} font-${fontStyle}">
            
            ${showDecoration ? `
              <div class="poetry-decoration-top">〖</div>
            ` : ''}
            
            <!-- 标题区域 -->
            ${poetryData.title ? `
              <div class="title-section">
                <h1 class="poetry-title">${this._renderSafeHTML(poetryData.title)}</h1>
              </div>
            ` : ''}
            
            <!-- 朝代作者区域 -->
            ${(poetryData.dynasty || poetryData.author) ? `
              <div class="author-section">
                ${poetryData.dynasty ? `<span class="dynasty">${this._renderSafeHTML(poetryData.dynasty)}</span>` : ''}
                ${poetryData.dynasty && poetryData.author ? '<span class="author-separator">·</span>' : ''}
                ${poetryData.author ? `<span class="author">${this._renderSafeHTML(poetryData.author)}</span>` : ''}
              </div>
            ` : ''}
            
            <!-- 内容区域 -->
            ${poetryData.content ? `
              <div class="content-section">
                <div class="poetry-content" style="--max-lines: ${maxLines}">
                  ${this._renderSafeHTML(formattedContent)}
                </div>
              </div>
            ` : ''}
            
            ${showDecoration ? `
              <div class="poetry-decoration-bottom">〗</div>
            ` : ''}
            
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const textAlignment = config.text_alignment || 'center';
    const fontStyle = config.font_style || 'classical';
    const showDecoration = config.show_decoration !== false;
    const enableAnimations = config.enable_animations !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .poetry-card {
        padding: var(--cf-spacing-xl) var(--cf-spacing-lg);
        background: linear-gradient(135deg, var(--card-background-color) 0%, rgba(var(--cf-rgb-primary), 0.03) 100%);
      }
      
      .poetry-layout {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        position: relative;
      }
      
      /* 装饰元素 */
      .poetry-decoration-top,
      .poetry-decoration-bottom {
        font-size: 1.5em;
        color: rgba(var(--cf-rgb-primary), 0.3);
        line-height: 1;
        font-family: serif;
      }
      
      .poetry-decoration-top {
        align-self: flex-start;
        margin-bottom: -0.5em;
      }
      
      .poetry-decoration-bottom {
        align-self: flex-end;
        margin-top: -0.5em;
      }
      
      /* 标题区域 */
      .title-section {
        margin: var(--cf-spacing-sm) 0;
      }
      
      .poetry-title {
        font-size: 1.4em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0;
        line-height: 1.3;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      /* 作者区域 */
      .author-section {
        font-size: 0.95em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .dynasty {
        font-weight: 500;
        font-style: italic;
      }
      
      .author-separator {
        margin: 0 var(--cf-spacing-xs);
        opacity: 0.6;
      }
      
      .author {
        font-weight: 500;
      }
      
      /* 内容区域 */
      .content-section {
        margin: var(--cf-spacing-md) 0;
      }
      
      .poetry-content {
        font-size: 1.1em;
        line-height: 1.8;
        color: var(--cf-text-primary);
        white-space: pre-line;
        max-height: calc(var(--max-lines) * 1.8em);
        overflow: hidden;
        position: relative;
      }
      
      /* 字体风格 */
      .font-modern .poetry-content {
        font-family: var(--paper-font-common-nowrap_-_font-family);
      }
      
      .font-classical .poetry-content {
        font-family: 'SimSun', 'NSimSun', 'STSong', serif;
        letter-spacing: 0.5px;
      }
      
      .font-elegant .poetry-content {
        font-family: 'STKaiti', 'KaiTi', '楷体', serif;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
      
      .font-classical .poetry-title,
      .font-elegant .poetry-title {
        font-family: inherit;
      }
      
      /* 文字对齐 */
      .text-left {
        text-align: left;
        align-items: flex-start;
      }
      
      .text-center {
        text-align: center;
        align-items: center;
      }
      
      .text-right {
        text-align: right;
        align-items: flex-end;
      }
      
      /* 动画效果 */
      .with-animations .title-section {
        animation: poetry-fade-in 0.6s ease-out;
      }
      
      .with-animations .author-section {
        animation: poetry-fade-in 0.6s ease-out 0.2s both;
      }
      
      .with-animations .content-section {
        animation: poetry-fade-in 0.6s ease-out 0.4s both;
      }
      
      .with-animations .poetry-decoration-top,
      .with-animations .poetry-decoration-bottom {
        animation: poetry-fade-in 0.8s ease-out 0.6s both;
      }
      
      @keyframes poetry-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .poetry-card {
          background: linear-gradient(135deg, var(--card-background-color) 0%, rgba(255, 255, 255, 0.03) 100%);
        }
        
        .poetry-title {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
      
      /* 主题适配 */
      .theme-ink-wash .poetry-card {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
        border: 1px solid #7f8c8d;
      }
      
      .theme-ink-wash .poetry-title {
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .theme-ink-wash .poetry-content {
        color: #ecf0f1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      
      .theme-ink-wash .author-section {
        color: #bdc3c7;
      }
      
      .theme-ink-wash .poetry-decoration-top,
      .theme-ink-wash .poetry-decoration-bottom {
        color: rgba(255, 255, 255, 0.2);
      }
      
      .theme-glass .poetry-card {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .poetry-card {
          padding: var(--cf-spacing-lg) var(--cf-spacing-md);
        }
        
        .poetry-layout {
          gap: var(--cf-spacing-md);
        }
        
        .poetry-title {
          font-size: 1.2em;
        }
        
        .poetry-content {
          font-size: 1em;
          line-height: 1.6;
        }
        
        .author-section {
          font-size: 0.9em;
        }
      }
      
      @media (max-width: 400px) {
        .poetry-card {
          padding: var(--cf-spacing-md) var(--cf-spacing-sm);
        }
        
        .poetry-title {
          font-size: 1.1em;
        }
        
        .poetry-content {
          font-size: 0.95em;
          line-height: 1.5;
        }
        
        .author-section {
          font-size: 0.85em;
        }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;