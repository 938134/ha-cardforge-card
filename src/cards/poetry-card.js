// src/cards/poetry.js - 添加预设块配置
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
  
  // 添加预设块配置
  blocks: {
    presets: {
      poetry_title: {
        type: 'text',
        name: '诗词标题',
        content: '静夜思',
        icon: 'mdi:format-title'
      },
      poetry_dynasty: {
        type: 'text',
        name: '朝代',
        content: '唐',
        icon: 'mdi:calendar-clock'
      },
      poetry_author: {
        type: 'text', 
        name: '作者',
        content: '李白',
        icon: 'mdi:account'
      },
      poetry_content: {
        type: 'text',
        name: '诗词内容',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        icon: 'mdi:format-quote-close'
      },
      poetry_translation: {
        type: 'text',
        name: '诗词译文',
        content: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
        icon: 'mdi:translate'
      }
    }
  },
  
  template: (config, data, context) => {
    // 获取块配置
    const blocks = config.blocks || {};
    
    // 如果没有块，使用预设块
    if (Object.keys(blocks).length === 0 && this.blocks?.presets) {
      // 在编辑器模式下显示提示
      return `
        <div class="poetry-card">
          <div class="poetry-empty">
            <div class="empty-icon">📜</div>
            <div class="empty-text">诗词卡片需要配置内容</div>
            <div class="empty-hint">请在编辑器中添加诗词块</div>
          </div>
        </div>
      `;
    }
    
    // 提取块内容
    const title = this._getBlockContent(blocks, 'poetry_title', '静夜思');
    const dynasty = this._getBlockContent(blocks, 'poetry_dynasty', '唐');
    const author = this._getBlockContent(blocks, 'poetry_author', '李白');
    const content = this._getBlockContent(blocks, 'poetry_content', '床前明月光，疑是地上霜。举头望明月，低头思故乡。');
    const translation = config.showTranslation 
      ? this._getBlockContent(blocks, 'poetry_translation', '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。')
      : '';
    
    // 根据字体大小设置类名
    const fontSizeClass = `font-${config.fontSize}`;
    
    return `
      <div class="poetry-card ${fontSizeClass}">
        ${title ? `<div class="poetry-title">${this._escapeHtml(title)}</div>` : ''}
        ${(dynasty || author) ? `
          <div class="poetry-meta">
            ${dynasty ? `<span class="dynasty">${this._escapeHtml(dynasty)}</span>` : ''}
            ${dynasty && author ? `<span class="separator">·</span>` : ''}
            ${author ? `<span class="author">${this._escapeHtml(author)}</span>` : ''}
          </div>
        ` : ''}
        ${content ? `<div class="poetry-content">${this._formatPoetryContent(content)}</div>` : ''}
        ${translation ? `
          <div class="translation-section">
            <div class="translation-divider"></div>
            <div class="translation-content">${this._escapeHtml(translation)}</div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  // 辅助方法
  _getBlockContent(blocks, blockId, defaultValue = '') {
    // 查找指定类型的块
    const blockEntry = Object.entries(blocks).find(([id, block]) => 
      block.type === blockId || id.includes(blockId)
    );
    
    if (blockEntry) {
      const [_, block] = blockEntry;
      return block.content || block.value || defaultValue;
    }
    
    // 查找块名称为指定ID的块
    for (const block of Object.values(blocks)) {
      if (block.name?.includes(blockId.replace('_', '')) || 
          block.name?.includes(blockId.replace('poetry_', ''))) {
        return block.content || block.value || defaultValue;
      }
    }
    
    return defaultValue;
  },
  
  _formatPoetryContent(content) {
    if (!content) return '';
    // 将诗词按句分割
    const sentences = content.split(/[。，；]/).filter(s => s.trim());
    return sentences.map(sentence => 
      `<div class="poetry-line">${this._escapeHtml(sentence.trim())}</div>`
    ).join('');
  },
  
  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  styles: (config, theme) => {
    // ... 样式代码保持不变 ...
  },
  
  layout: {
    type: 'single',
    recommendedSize: 4
  }
};

export class PoetryCard {
  static card = card;
}