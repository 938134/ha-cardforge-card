// src/themes/ink-wash-theme.js
export default {
  id: 'ink-wash',
  name: '水墨丹青',
  description: '中国传统水墨画风格，淡雅意境',
  icon: '🖌️',
  category: 'art',

  preview: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
    color: '#ecf0f1',
    border: '1px solid #7f8c8d',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },

  getStyles(config = {}) {
    const inkColor = config.inkColor || '#2c3e50';
    const paperColor = config.paperColor || '#f8f9fa';
    const brushStroke = config.brushStroke || 2;
    
    return `
      background: 
        linear-gradient(135deg, ${inkColor} 0%, #34495e 50%, #7f8c8d 100%),
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
      background-blend-mode: overlay, screen, screen;
      color: ${paperColor};
      border: ${brushStroke}px solid rgba(124, 124, 124, 0.3);
      box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      
      /* 水墨纹理效果 */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
          linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%);
        pointer-events: none;
        opacity: 0.6;
      }
      
      /* 边缘晕染效果 */
      &::after {
        content: '';
        position: absolute;
        top: -10%;
        left: -10%;
        right: -10%;
        bottom: -10%;
        background: 
          radial-gradient(ellipse at 20% 20%, rgba(52, 73, 94, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(44, 62, 80, 0.3) 0%, transparent 50%);
        pointer-events: none;
        opacity: 0.4;
        z-index: 0;
      }
      
      /* 确保内容在顶层 */
      .cardforge-content {
        position: relative;
        z-index: 1;
      }
      
      /* 文字效果 */
      .cardforge-title {
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        font-weight: 600;
        letter-spacing: 1px;
      }
      
      .cardforge-text-large {
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
        font-weight: 300;
      }
      
      .cardforge-text-medium {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
    `;
  },

  applyTheme(element, config = {}) {
    // 添加水墨动画效果
    if (!element.querySelector('.ink-wash-animation')) {
      const animation = document.createElement('div');
      animation.className = 'ink-wash-animation';
      animation.innerHTML = `
        <style>
          .ink-wash-animation {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            opacity: 0.1;
            background: 
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
            animation: inkFlow 15s ease-in-out infinite;
            z-index: 0;
          }
          
          @keyframes inkFlow {
            0%, 100% {
              opacity: 0.1;
              transform: scale(1) rotate(0deg);
            }
            25% {
              opacity: 0.15;
              transform: scale(1.02) rotate(1deg);
            }
            50% {
              opacity: 0.1;
              transform: scale(1) rotate(0deg);
            }
            75% {
              opacity: 0.12;
              transform: scale(0.98) rotate(-1deg);
            }
          }
        </style>
      `;
      element.appendChild(animation);
    }

    // 根据配置调整效果
    if (config.useCalligraphyFont) {
      element.style.fontFamily = "'Ma Shan Zheng', 'ZCOOL XiaoWei', 'Noto Serif SC', serif";
    }
    
    if (config.enhancedInkEffect) {
      element.style.backgroundBlendMode = 'overlay, multiply, screen';
    }
  },

  // 水墨主题特有的配置选项
  getConfigSchema() {
    return {
      inkColor: {
        type: 'select',
        label: '墨色',
        options: ['浓墨(#2c3e50)', '淡墨(#5d6d7e)', '焦墨(#1c2833)', '青墨(#1a5276)'],
        default: '浓墨(#2c3e50)'
      },
      paperColor: {
        type: 'select', 
        label: '纸色',
        options: ['宣纸白(#f8f9fa)', '米黄(#fdf6e3)', '古绢(#f5e6ca)', '青灰(#ecf0f1)'],
        default: '宣纸白(#f8f9fa)'
      },
      brushStroke: {
        type: 'select',
        label: '笔触',
        options: ['细笔(1px)', '中笔(2px)', '粗笔(3px)', '泼墨(4px)'],
        default: '中笔(2px)'
      },
      useCalligraphyFont: {
        type: 'boolean',
        label: '书法字体',
        default: false
      },
      enhancedInkEffect: {
        type: 'boolean',
        label: '增强墨韵',
        default: true
      }
    };
  }
};