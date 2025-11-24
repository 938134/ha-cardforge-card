// src/blocks/types/text-block.js
class TextBlock {
  static blockType = 'text';
  static blockName = '文本';
  static blockIcon = 'mdi:text';
  static category = 'basic';
  static description = '显示文本内容';

  render(block, hass) {
    const config = block.config || {};
    const content = config.content || '示例文本';
    
    return `
      <div class="block-container">
        <div class="block-content" style="padding: 20px; text-align: center;">
          ${this._escapeHtml(content)}
        </div>
      </div>
    `;
  }

  getStyles(block) {
    return `
      .block-container {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        height: 100%;
      }
    `;
  }

  getDefaultConfig() {
    return {
      content: '文本内容'
    };
  }

  _escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

export { TextBlock as default, TextBlock };