// themes/inkwash-theme.js - 优化版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '中国风水墨意境，宣纸书法风格',
  icon: '🖌️',
  
  styles: css`
    /* 水墨主题 - 卡片容器 */
    .cardforge-container {
      /* 宣纸底色 - 更真实的淡黄色 */
      background-color: #fef9e7 !important;
      
      /* 宣纸纹理 - 更加细腻 */
      background-image: 
        /* 纸张纤维纹理 */
        linear-gradient(
          rgba(182, 157, 115, 0.05) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(182, 157, 115, 0.05) 1px,
          transparent 1px
        ),
        /* 墨迹晕染效果 */
        radial-gradient(
          circle at 10% 20%,
          rgba(139, 117, 81, 0.02) 0%,
          transparent 20%
        ),
        radial-gradient(
          circle at 90% 80%,
          rgba(139, 117, 81, 0.02) 0%,
          transparent 20%
        ),
        /* 水印效果 */
        url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,50 Q50,30 80,50 T140,50' stroke='%238B7551' stroke-opacity='0.02' stroke-width='0.5' fill='none'/%3E%3C/svg%3E") !important;
      
      background-blend-mode: multiply !important;
      background-size: 
        50px 50px, /* 网格大小 */
        50px 50px, /* 网格大小 */
        100% 100%, /* 晕染 */
        100% 100%, /* 晕染 */
        200px 200px !important; /* 水印大小 */
      
      /* 宣纸边框和阴影 */
      border: 0.5px solid rgba(139, 117, 81, 0.15) !important;
      box-shadow: 
        /* 内阴影 - 纸张凹陷感 */
        inset 0 0 60px rgba(182, 157, 115, 0.1),
        inset 0 0 30px rgba(255, 255, 255, 0.8),
        /* 外阴影 - 柔和浮起 */
        0 2px 12px rgba(139, 117, 81, 0.08),
        0 4px 24px rgba(139, 117, 81, 0.04) !important;
      
      /* 圆角 */
      border-radius: 2px !important;
      
      /* 中式字体 */
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', serif !important;
      font-weight: 400 !important;
    }
    
    /* 水墨主题 - 文字颜色（墨色渐变） */
    .cardforge-container .card-title {
      color: #2c1810 !important;
      font-weight: 700 !important;
      letter-spacing: 1.5px !important;
      text-shadow: 
        0.5px 0.5px 0px rgba(255, 255, 255, 0.8),
        -0.5px -0.5px 0px rgba(139, 117, 81, 0.1) !important;
      position: relative;
      padding-bottom: 8px;
    }
    
    .cardforge-container .card-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 10%;
      width: 80%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(139, 117, 81, 0.3),
        transparent
      );
    }
    
    .cardforge-container .card-subtitle {
      color: rgba(44, 24, 16, 0.85) !important;
      font-weight: 500 !important;
      letter-spacing: 0.8px !important;
      font-style: italic !important;
    }
    
    .cardforge-container .card-caption {
      color: rgba(44, 24, 16, 0.65) !important;
      font-style: italic !important;
      border-left: 2px solid rgba(182, 157, 115, 0.4) !important;
      padding-left: 12px !important;
      margin-left: 4px !important;
      line-height: 1.6 !important;
    }
    
    .cardforge-container .card-emphasis {
      color: #8B4513 !important; /* 赭石色 */
      font-weight: 600 !important;
      text-shadow: 
        0.5px 0.5px 0px rgba(255, 255, 255, 0.8),
        -0.5px -0.5px 0px rgba(139, 117, 81, 0.2) !important;
      position: relative;
      display: inline-block;
      padding: 0 4px;
    }
    
    .cardforge-container .card-emphasis::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: rgba(182, 157, 115, 0.1);
      border-radius: 1px;
      z-index: -1;
    }
    
    /* 诗词卡片特定优化 */
    .cardforge-container .poetry-card {
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', serif !important;
    }
    
    .cardforge-container .poetry-title {
      color: #2c1810 !important;
      font-weight: 700 !important;
      font-size: 1.8em !important;
      text-align: center !important;
      margin-bottom: 16px !important;
      position: relative;
    }
    
    .cardforge-container .poetry-title::before,
    .cardforge-container .poetry-title::after {
      content: '「';
      position: absolute;
      top: 0;
      color: rgba(139, 117, 81, 0.4);
      font-size: 1.2em;
    }
    
    .cardforge-container .poetry-title::before {
      left: -24px;
    }
    
    .cardforge-container .poetry-title::after {
      content: '」';
      right: -24px;
    }
    
    .cardforge-container .poetry-line {
      color: rgba(44, 24, 16, 0.9) !important;
      font-size: 1.3em !important;
      line-height: 2.2 !important;
      text-align: center !important;
      margin: 6px 0 !important;
      font-weight: 400 !important;
      letter-spacing: 1px !important;
    }
    
    .cardforge-container .translation-container {
      background: rgba(253, 245, 230, 0.6) !important;
      border: 1px solid rgba(182, 157, 115, 0.2) !important;
      border-left: 3px solid rgba(139, 117, 81, 0.4) !important;
      padding: 16px !important;
      margin-top: 20px !important;
      border-radius: 1px !important;
    }
    
    .cardforge-container .translation-label {
      color: #8B4513 !important;
      font-weight: 600 !important;
      font-size: 0.9em !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      margin-bottom: 12px !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .cardforge-container .translation-label::before {
      content: '';
      width: 16px;
      height: 1px;
      background: rgba(139, 117, 81, 0.4);
    }
    
    .cardforge-container .translation-content {
      color: rgba(44, 24, 16, 0.8) !important;
      line-height: 1.8 !important;
      font-size: 0.95em !important;
    }
    
    .cardforge-container .poetry-divider,
    .cardforge-container .translation-divider {
      width: 80px !important;
      height: 1px !important;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(139, 117, 81, 0.3),
        transparent
      ) !important;
      margin: 16px auto !important;
    }
    
    /* 深色模式优化 - 暗色宣纸效果 */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        background-color: #2c2418 !important;
        background-image: 
          linear-gradient(
            rgba(182, 157, 115, 0.08) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(182, 157, 115, 0.08) 1px,
            transparent 1px
          ),
          radial-gradient(
            circle at 10% 20%,
            rgba(182, 157, 115, 0.04) 0%,
            transparent 20%
          ),
          radial-gradient(
            circle at 90% 80%,
            rgba(182, 157, 115, 0.04) 0%,
            transparent 20%
          ) !important;
        
        border: 0.5px solid rgba(182, 157, 115, 0.2) !important;
        box-shadow: 
          inset 0 0 60px rgba(0, 0, 0, 0.2),
          inset 0 0 30px rgba(255, 255, 255, 0.03),
          0 2px 12px rgba(0, 0, 0, 0.2),
          0 4px 24px rgba(0, 0, 0, 0.1) !important;
      }
      
      .cardforge-container .card-title {
        color: #f5e8d0 !important;
      }
      
      .cardforge-container .card-subtitle {
        color: rgba(245, 232, 208, 0.85) !important;
      }
      
      .cardforge-container .card-caption {
        color: rgba(245, 232, 208, 0.65) !important;
      }
      
      .cardforge-container .card-emphasis {
        color: #d4a76a !important;
      }
      
      /* 深色模式下的诗词卡片 */
      .cardforge-container .poetry-card {
        color: #f5e8d0 !important;
      }
      
      .cardforge-container .poetry-title {
        color: #f5e8d0 !important;
      }
      
      .cardforge-container .poetry-line {
        color: rgba(245, 232, 208, 0.95) !important;
      }
      
      .cardforge-container .translation-container {
        background: rgba(60, 48, 32, 0.6) !important;
        border: 1px solid rgba(182, 157, 115, 0.3) !important;
      }
      
      .cardforge-container .translation-content {
        color: rgba(245, 232, 208, 0.85) !important;
      }
    }
    
    /* 响应式调整 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        background-size: 
          30px 30px,
          30px 30px,
          100% 100%,
          100% 100%,
          150px 150px !important;
      }
      
      .cardforge-container .poetry-title::before,
      .cardforge-container .poetry-title::after {
        display: none;
      }
    }
  `,
  
  preview: {
    background: `#fef9e7 url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,50 Q50,30 80,50 T140,50' stroke='%238B7551' stroke-opacity='0.02' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
    border: '0.5px solid rgba(139, 117, 81, 0.15)',
    boxShadow: 'inset 0 0 30px rgba(182, 157, 115, 0.1), 0 2px 8px rgba(139, 117, 81, 0.08)'
  }
};
