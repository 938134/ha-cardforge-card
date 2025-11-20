// src/themes/ink-wash-theme.js
export default {
  id: 'ink-wash',
  name: '水墨风格',
  description: '中国传统水墨画风格效果',
  icon: '🖌️',
  category: 'art',

  preview: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: '#ecf0f1',
    border: '1px solid #7f8c8d'
  },

  getStyles(config = {}) {
    const inkColor = config.inkColor || '#2c3e50';
    const paperColor = config.paperColor || '#ecf0f1';
    
    return `
      background: linear-gradient(135deg, ${inkColor} 0%, #34495e 100%);
      color: ${paperColor};
      border: 1px solid #7f8c8d;
      position: relative;
      overflow: hidden;
    `;
  },

  applyTheme(element, config = {}) {
    if (!element.querySelector('.ink-wash-decoration')) {
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
            opacity: 0.1;
            background: 
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
          }
        </style>
      `;
      element.appendChild(decoration);
    }
  }
};