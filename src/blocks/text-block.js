// src/blocks/text-block.js
import { BaseBlock } from '../core/base-block.js';

class TextBlock extends BaseBlock {
  getTemplate(config, hass) {
    const content = config.content || '示例文本';
    
    return this._renderBlockContainer(`
      <div class="text-content">
        ${content}
      </div>
    `, 'text-block');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .text-block .text-content {
        padding: var(--cf-spacing-md);
        text-align: ${config.align || 'center'};
        font-size: ${config.size || '1em'};
        color: var(--cf-text-primary);
      }
    `;
  }
}

TextBlock.manifest = {
  type: 'text',
  name: '文本块',
  description: '显示自定义文本内容',
  icon: '📝',
  category: 'basic',
  config_schema: {
    content: {
      type: 'string',
      label: '文本内容',
      default: '示例文本'
    },
    align: {
      type: 'select',
      label: '对齐方式',
      default: 'center',
      options: ['left', 'center', 'right']
    },
    size: {
      type: 'select',
      label: '字体大小',
      default: '1em',
      options: ['0.8em', '1em', '1.2em', '1.5em']
    }
  }
};

export { TextBlock as default };
