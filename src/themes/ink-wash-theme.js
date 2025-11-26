// src/themes/ink-wash-theme.js
export default {
  id: 'ink-wash',
  name: '水墨丹青',
  description: '中国传统水墨画风格，淡雅意境',
  icon: '🖌️',

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
    `;
  }
};
