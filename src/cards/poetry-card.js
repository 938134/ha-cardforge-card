// src/cards/poetry.js

export const card = {
  id: 'poetry',
  meta: {
    name: '诗词',
    description: '显示经典诗词，支持译文',
    icon: '📜',
    category: '文化',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    showTranslation: {
      type: 'boolean',
      label: '显示译文',
      default: false
    },
    fontSize: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  },
  
  template: (config) => {
    // 示例诗词 - 静夜思
    const poetry = {
      title: '静夜思',
      dynasty: '唐',
      author: '李白',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
      translation: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。'
    };
    
    // 根据字体大小设置类名
    const fontSizeClass = `font-${config.fontSize}`;
    
    let translationHtml = '';
    if (config.showTranslation) {
      translationHtml = `
        <div class="translation-section">
          <div class="translation-divider"></div>
          <div class="translation-content">${poetry.translation}</div>
        </div>
      `;
    }
    
    return `
      <div class="poetry-card ${fontSizeClass}">
        <div class="poetry-title">${poetry.title}</div>
        <div class="poetry-meta">
          <span class="dynasty">${poetry.dynasty}</span>
          <span class="separator">·</span>
          <span class="author">${poetry.author}</span>
        </div>
        <div class="poetry-content">${formatPoetryContent(poetry.content)}</div>
        ${translationHtml}
      </div>
    `;
    
    function formatPoetryContent(content) {
      // 将诗词按句分割
      const sentences = content.split(/[。，；]/).filter(s => s.trim());
      return sentences.map(sentence => 
        `<div class="poetry-line">${sentence.trim()}</div>`
      ).join('');
    }
  },
  
  styles: (config, theme) => {
    // 字体大小映射
    const fontSizeMap = {
      small: {
        title: '1.1em',
        meta: '0.8em',
        content: '0.9em',
        translation: '0.8em'
      },
      medium: {
        title: '1.3em',
        meta: '0.9em',
        content: '1.1em',
        translation: '0.9em'
      },
      large: {
        title: '1.5em',
        meta: '1em',
        content: '1.3em',
        translation: '1em'
      }
    };
    
    const sizes = fontSizeMap[config.fontSize] || fontSizeMap.medium;
    
    return `
      .poetry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 160px;
        padding: 20px;
        text-align: center;
        font-family: 'Noto Serif SC', serif;
      }
      
      .poetry-title {
        font-size: ${sizes.title};
        font-weight: bold;
        color: var(--cf-text-primary);
        margin-bottom: 8px;
      }
      
      .poetry-meta {
        font-size: ${sizes.meta};
        color: var(--cf-text-secondary);
        margin-bottom: 16px;
        opacity: 0.8;
      }
      
      .separator {
        margin: 0 6px;
        opacity: 0.6;
      }
      
      .poetry-content {
        font-size: ${sizes.content};
        color: var(--cf-text-primary);
        line-height: 1.8;
        margin-bottom: 20px;
      }
      
      .poetry-line {
        margin: 0.1em 0;
      }
      
      .translation-section {
        max-width: 90%;
      }
      
      .translation-divider {
        width: 60px;
        height: 1px;
        background: var(--cf-border);
        margin: 0 auto 12px auto;
        opacity: 0.6;
      }
      
      .translation-content {
        font-size: ${sizes.translation};
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-family: 'Noto Sans SC', sans-serif;
        text-align: left;
        padding: 12px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: var(--cf-radius-sm);
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: 16px;
        }
        
        .poetry-title {
          font-size: ${config.fontSize === 'large' ? '1.3em' : '1.1em'};
        }
        
        .poetry-content {
          font-size: ${config.fontSize === 'large' ? '1.1em' : '0.9em'};
          line-height: 1.6;
        }
        
        .translation-content {
          font-size: ${config.fontSize === 'large' ? '0.9em' : '0.8em'};
          padding: 10px;
        }
      }
      
      @container cardforge-container (max-width: 320px) {
        .poetry-card {
          padding: 12px;
        }
        
        .translation-content {
          text-align: center;
        }
      }
    `;
  },
  
  layout: {
    type: 'single',
    recommendedSize: 4
  }
};

export class PoetryCard {
  static card = card;
}
