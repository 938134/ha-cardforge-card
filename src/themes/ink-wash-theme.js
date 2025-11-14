// src/themes/ink-wash-theme.js
export const inkWashTheme = {
  id: 'ink-wash',
  name: '水墨丹青',
  description: '中国传统水墨画风格，适合诗词展示',
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
    sealColor: '#8b4513',
    showInkEffect: true,
    showPaperTexture: true
  },

  getStyles(config = {}) {
    const paperColor = config.paperColor || '#fef7ed';
    const inkColor = config.inkColor || '#5c4b37';
    const borderColor = config.borderColor || '#e8dfca';
    const sealColor = config.sealColor || '#8b4513';
    const showInkEffect = config.showInkEffect !== false;
    const showPaperTexture = config.showPaperTexture !== false;

    return `
      .theme-ink-wash {
        background: linear-gradient(135deg, ${paperColor} 0%, ${this._darkenColor(paperColor, 0.05)} 100%);
        border: 1px solid ${borderColor};
        color: ${inkColor};
        position: relative;
        overflow: hidden;
        font-family: "SimSun", "宋体", "Noto Serif SC", serif;
        ${this._borderRadius('8px')}
      }
      
      ${showPaperTexture ? `
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
      ` : ''}
      
      ${showInkEffect ? `
      .theme-ink-wash .ink-blur {
        position: absolute;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(92, 75, 55, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(5px);
        pointer-events: none;
      }
      ` : ''}
      
      .theme-ink-wash .cardforge-interactive:hover {
        background: rgba(139, 69, 19, 0.05);
        ${this._borderRadius('4px')}
      }
      
      /* 诗词专用样式 */
      .theme-ink-wash .poetry-title {
        color: ${sealColor};
        font-family: "SimSun", "宋体", "Noto Serif SC", serif;
        font-weight: bold;
        font-size: 1.3em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        margin-bottom: 0.5em;
        text-align: center;
      }
      
      .theme-ink-wash .poetry-meta {
        color: ${this._darkenColor(inkColor, 0.3)};
        font-family: "SimSun", "宋体", "Noto Serif SC", serif;
        font-size: 0.9em;
        text-align: center;
        margin-bottom: 1em;
        font-style: italic;
      }
      
      .theme-ink-wash .poetry-line {
        color: ${inkColor};
        font-family: "SimSun", "宋体", "Noto Serif SC", serif;
        font-size: 1.1em;
        line-height: 1.8;
        text-align: center;
        margin: 0.3em 0;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
      }
      
      .theme-ink-wash .poetry-line:hover {
        color: ${this._darkenColor(inkColor, 0.2)};
        transform: translateX(2px);
        transition: all 0.3s ease;
      }
      
      .theme-ink-wash .seal {
        display: inline-block;
        border: 1px solid ${sealColor};
        color: ${sealColor};
        padding: 2px 8px;
        margin: 0 4px;
        font-size: 0.8em;
        ${this._borderRadius('2px')}
        transform: rotate(-5deg);
        background: rgba(139, 69, 19, 0.05);
      }
      
      /* 书法笔触效果 */
      .theme-ink-wash .calligraphy {
        position: relative;
        display: inline-block;
      }
      
      .theme-ink-wash .calligraphy::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1px;
        background: ${inkColor};
        opacity: 0.3;
        transform: scaleX(0.8);
        transition: transform 0.3s ease;
      }
      
      .theme-ink-wash .calligraphy:hover::after {
        transform: scaleX(1);
      }
      
      /* 卷轴效果 */
      .theme-ink-wash.scroll-style {
        background: linear-gradient(to bottom, 
          ${this._darkenColor(paperColor, 0.1)} 0%, 
          ${paperColor} 10%, 
          ${paperColor} 90%, 
          ${this._darkenColor(paperColor, 0.1)} 100%);
        border-left: 3px solid ${borderColor};
        border-right: 3px solid ${borderColor};
        ${this._borderRadius('0')}
      }
      
      /* 响应式调整 */
      @media (max-width: 480px) {
        .theme-ink-wash .poetry-title {
          font-size: 1.1em;
        }
        
        .theme-ink-wash .poetry-line {
          font-size: 1em;
          line-height: 1.6;
        }
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

  _borderRadius(radius) {
    return `border-radius: ${radius};`;
  },

  applyTheme(element, config = {}) {
    // 添加水墨主题特有的类名
    element.classList.add('ink-wash-theme');
    
    // 如果启用墨水效果，添加动态墨水点
    if (config.showInkEffect) {
      this._addInkEffects(element);
    }
    
    // 如果启用卷轴样式
    if (config.scrollStyle) {
      element.classList.add('scroll-style');
    }
  },

  _addInkEffects(element) {
    // 创建几个随机的墨水晕染效果
    for (let i = 0; i < 3; i++) {
      const inkBlur = document.createElement('div');
      inkBlur.className = 'ink-blur';
      inkBlur.style.left = `${Math.random() * 80 + 10}%`;
      inkBlur.style.top = `${Math.random() * 80 + 10}%`;
      inkBlur.style.opacity = `${Math.random() * 0.3 + 0.1}`;
      inkBlur.style.width = `${Math.random() * 60 + 40}px`;
      inkBlur.style.height = inkBlur.style.width;
      
      element.appendChild(inkBlur);
    }
  }
};