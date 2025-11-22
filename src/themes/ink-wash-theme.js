// src/themes/ink-wash-theme.js
export default {
  id: 'ink-wash',
  name: '水墨丹青',
  description: '中国传统水墨画风格，山水意境',
  icon: '🖌️',
  category: 'art',

  preview: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: '#ecf0f1',
    border: '1px solid #7f8c8d'
  },

  getStyles(config = {}) {
    const inkColor = config.inkColor || '#2c3e50';
    const paperColor = config.paperColor || '#f8f3e6';
    const mountainColor = config.mountainColor || '#34495e';
    
    return `
      background: 
        /* 远山背景 */
        radial-gradient(ellipse at 20% 20%, ${mountainColor}99 0%, transparent 50%),
        radial-gradient(ellipse at 80% 30%, ${mountainColor}77 0%, transparent 50%),
        /* 水墨渐变底色 */
        linear-gradient(160deg, ${inkColor} 0%, #34495e 30%, #4a6572 100%);
      color: ${paperColor};
      border: 1px solid #7f8c8d77;
      position: relative;
      overflow: hidden;
      
      /* 添加宣纸纹理 */
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.05) 0%, transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 40%);
      
      /* 水墨晕染效果 */
      box-shadow: 
        inset 0 0 100px rgba(0,0,0,0.3),
        0 4px 20px rgba(0,0,0,0.2);
    `;
  },

  applyTheme(element, config = {}) {
    // 移除旧的装饰
    const oldDecoration = element.querySelector('.ink-wash-decoration');
    if (oldDecoration) {
      oldDecoration.remove();
    }

    // 添加新的水墨意境装饰
    const decoration = document.createElement('div');
    decoration.className = 'ink-wash-decoration';
    decoration.innerHTML = `
      <style>
        .ink-wash-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0.4;
          background: 
            /* 远山轮廓 */
            radial-gradient(ellipse at 10% 90%, rgba(52, 73, 94, 0.6) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 70%, rgba(52, 73, 94, 0.4) 0%, transparent 30%),
            /* 水墨笔触 */
            linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%),
            linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.08) 50%, transparent 55%);
          mix-blend-mode: overlay;
        }
        
        .ink-wash-decoration::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            /* 宣纸纹理 */
            repeating-linear-gradient(0deg, 
              rgba(255,255,255,0.02) 0px, 
              rgba(255,255,255,0.02) 1px, 
              transparent 1px, 
              transparent 3px
            ),
            repeating-linear-gradient(90deg, 
              rgba(255,255,255,0.01) 0px, 
              rgba(255,255,255,0.01) 1px, 
              transparent 1px, 
              transparent 2px
            );
        }
        
        .ink-wash-decoration::after {
          content: '';
          position: absolute;
          top: 20%;
          left: 10%;
          right: 10%;
          bottom: 20%;
          background: 
            radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(10px);
        }
      </style>
    `;
    element.appendChild(decoration);

    // 为卡片内容添加特殊样式
    element.style.fontFamily = config.useCalligraphyFont ? '"楷体", "STKaiti", "SimKai", serif' : 'inherit';
    
    if (config.useCalligraphyFont) {
      element.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
    }
  }
};