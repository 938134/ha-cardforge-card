// src/themes/ink-wash-theme.js
export const inkWashTheme = {
  id: 'ink-wash',
  name: '水墨丹青',
  description: '中国传统水墨画风格',
  icon: '🖋️',
  category: 'art',

  preview: {
    background: 'linear-gradient(135deg, #fef7ed 0%, #f8f4e9 100%)',
    color: '#5c4b37',
    border: '1px solid #e8dfca'
  },

  config: {
    paperColor: '#fef7ed',
    inkColor: '#5c4b37',
    borderColor: '#e8dfca',
    sealColor: '#8b4513'
  },

  getStyles(config = {}) {
    const paperColor = config.paperColor || '#fef7ed';
    const inkColor = config.inkColor || '#5c4b37';
    const borderColor = config.borderColor || '#e8dfca';
    const sealColor = config.sealColor || '#8b4513';

    return `
      .theme-ink-wash {
        background: linear-gradient(135deg, ${paperColor} 0%, ${this._darkenColor(paperColor, 0.05)} 100%);
        border: 1px solid ${borderColor};
        color: ${inkColor};
        position: relative;
        overflow: hidden;
      }
      
      .theme-ink-wash::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.02) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .theme-ink-wash::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, transparent 95%, rgba(139, 69, 19, 0.1) 100%),
          linear-gradient(0deg, transparent 95%, rgba(139, 69, 19, 0.1) 100%);
        background-size: 20px 20px;
        pointer-events: none;
        opacity: 0.3;
      }
      
      .theme-ink-wash .cardforge-interactive:hover {
        background: rgba(139, 69, 19, 0.05);
      }
      
      /* 诗词专用样式 */
      .theme-ink-wash .poetry-title {
        color: ${sealColor};
        font-family: "SimSun", "宋体", serif;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .theme-ink-wash .poetry-meta {
        color: ${this._darkenColor(inkColor, 0.3)};
        font-family: "SimSun", "宋体", serif;
      }
      
      .theme-ink-wash .poetry-line {
        color: ${inkColor};
        font-family: "SimSun", "宋体", serif;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      }
      
      .theme-ink-wash .seal {
        border-color: ${sealColor};
        color: ${sealColor};
      }
    `;
  },

  _darkenColor(color, amount) {
    // 简单的颜色变暗函数
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  },

  applyTheme(element, config = {}) {
    // 水墨主题不需要特殊处理
  }
};