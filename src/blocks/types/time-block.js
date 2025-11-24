// src/blocks/types/time-block.js
class TimeBlock {
  static blockType = 'time';
  static blockName = '时间';
  static blockIcon = 'mdi:clock';
  static category = 'information';
  static description = '显示当前时间';

  render(block, hass) {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN');
    const date = now.toLocaleDateString('zh-CN');
    
    return `
      <div class="block-container">
        <div class="block-content" style="padding: 20px; text-align: center;">
          <div style="font-size: 1.5em; font-weight: bold;">${time}</div>
          <div style="font-size: 0.9em; opacity: 0.7;">${date}</div>
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
    return {};
  }
}

export default TimeBlock;