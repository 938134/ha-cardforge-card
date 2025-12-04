// 水墨主题 - 书香味浓郁版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '中国风水墨画效果，书香韵味',
  icon: '🖌️', // 改为毛笔图标
  
  variables: {
    '--cf-primary-color': '#2c1810',        // 墨黑色
    '--cf-accent-color': '#c3272b',         // 朱砂红（印章色）
    '--cf-background': '#f5f0e6',           // 宣纸白
    '--cf-surface': 'rgba(245, 240, 230, 0.9)', // 半透明宣纸
    '--cf-border': 'rgba(44, 24, 16, 0.3)',    // 淡墨边框
    '--cf-text-primary': '#2c1810',         // 墨黑文字
    '--cf-text-secondary': '#5d4037'        // 深褐色副文字
  },
  
  styles: `
    .cardforge-container {
      background: 
        /* 宣纸底色渐变 */
        linear-gradient(135deg, 
          #f5f0e6 0%, 
          #e8e1d1 50%, 
          #d8d0b8 100%),
        /* 水墨晕染效果 */
        radial-gradient(circle at 20% 30%, rgba(44, 24, 16, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(44, 24, 16, 0.03) 0%, transparent 50%);
      
      /* 宣纸纹理 */
      background-blend-mode: multiply;
      position: relative;
      border: 1px solid rgba(44, 24, 16, 0.3);
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', 'SimSun', serif;
      box-shadow: 
        0 2px 12px rgba(44, 24, 16, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    
    /* 毛边效果 */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(44, 24, 16, 0.05) 1px,
          rgba(44, 24, 16, 0.05) 2px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(44, 24, 16, 0.05) 1px,
          rgba(44, 24, 16, 0.05) 2px
        );
      pointer-events: none;
      border-radius: inherit;
      z-index: 1;
      opacity: 0.3;
    }
    
    /* 印章水印效果 */
    .cardforge-container::after {
      content: '墨';
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 24px;
      font-family: 'ZCOOL XiaoWei', cursive;
      color: rgba(195, 39, 43, 0.15);
      transform: rotate(-15deg);
      z-index: 0;
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      :host {
        --cf-primary-color: #e8e1d1;
        --cf-accent-color: #e57373;
        --cf-background: #1a1712;
        --cf-surface: rgba(26, 23, 18, 0.9);
        --cf-border: rgba(232, 225, 209, 0.3);
        --cf-text-primary: #e8e1d1;
        --cf-text-secondary: #b0a18e;
      }
      
      .cardforge-container {
        background: 
          linear-gradient(135deg, 
            #1a1712 0%, 
            #252119 50%, 
            #2e281f 100%),
          radial-gradient(circle at 20% 30%, rgba(232, 225, 209, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(232, 225, 209, 0.03) 0%, transparent 50%);
        border: 1px solid rgba(232, 225, 209, 0.3);
      }
      
      .cardforge-container::after {
        color: rgba(229, 115, 115, 0.2);
      }
    }
    
    /* 卡片内文字样式 */
    .cardforge-container * {
      letter-spacing: 0.5px;
    }
    
    /* 标题样式 */
    .cardforge-container h1,
    .cardforge-container h2,
    .cardforge-container h3 {
      font-weight: 700;
      text-shadow: 1px 1px 2px rgba(44, 24, 16, 0.1);
    }
    
    /* 链接样式 */
    .cardforge-container a {
      color: #1c6a87;
      text-decoration: none;
      border-bottom: 1px dashed rgba(28, 106, 135, 0.3);
      transition: all 0.2s ease;
    }
    
    .cardforge-container a:hover {
      color: #c3272b;
      border-bottom-color: rgba(195, 39, 43, 0.5);
    }
  `,
  
  preview: {
    background: 'linear-gradient(135deg, #f5f0e6 0%, #e8e1d1 50%, #d8d0b8 100%)',
    color: '#2c1810',
    border: '1px solid rgba(44, 24, 16, 0.3)',
    borderColor: 'rgba(44, 24, 16, 0.3)',
    boxShadow: '0 2px 8px rgba(44, 24, 16, 0.15)',
    // 在方形预览中显示"墨"字
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ctext x='24' y='32' font-family='ZCOOL XiaoWei' font-size='24' fill='rgba(195,39,43,0.15)' text-anchor='middle'%3E墨%3C/text%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
};