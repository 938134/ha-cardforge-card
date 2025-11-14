// src/styles/theme-styles.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const themeStyles = css`
  /* ===== 主题变量定义 ===== */
  :host {
    /* 自动主题 */
    --theme-auto-background: var(--card-background-color);
    --theme-auto-color: var(--primary-text-color);
    --theme-auto-border: var(--divider-color);
    
    /* 毛玻璃主题 */
    --theme-glass-background: linear-gradient(135deg, 
      rgba(var(--rgb-primary-background-color), 0.25) 0%, 
      rgba(var(--rgb-primary-background-color), 0.15) 50%,
      rgba(var(--rgb-primary-background-color), 0.1) 100%);
    --theme-glass-color: var(--primary-text-color);
    --theme-glass-border: rgba(var(--rgb-primary-text-color), 0.15);
    
    /* 渐变主题 */
    --theme-gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --theme-gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --theme-gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --theme-gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    --theme-gradient-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    --theme-gradient-color: white;
    
    /* 霓虹主题 */
    --theme-neon-background: #1a1a1a;
    --theme-neon-color: #00ff88;
    --theme-neon-border: #00ff88;
    --theme-neon-glow: 0 0 10px #00ff88, 0 0 20px rgba(0, 255, 136, 0.3);
  }
  
  /* ===== 主题应用类 ===== */
  .theme-auto {
    background: var(--theme-auto-background);
    color: var(--theme-auto-color);
    border-color: var(--theme-auto-border);
  }
  
  .theme-glass {
    background: var(--theme-glass-background);
    color: var(--theme-glass-color);
    border: 1px solid var(--theme-glass-border);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
  }
  
  .theme-gradient {
    background: var(--theme-gradient-1);
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
    color: var(--theme-gradient-color);
  }
  
  .theme-neon {
    background: var(--theme-neon-background);
    color: var(--theme-neon-color);
    border: 1px solid var(--theme-neon-border);
    box-shadow: var(--theme-neon-glow);
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  /* ===== 主题工具类 ===== */
  .theme-preview-auto {
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
  }
  
  .theme-preview-glass {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .theme-preview-gradient-1 { background: var(--theme-gradient-1); }
  .theme-preview-gradient-2 { background: var(--theme-gradient-2); }
  .theme-preview-gradient-3 { background: var(--theme-gradient-3); }
  .theme-preview-gradient-4 { background: var(--theme-gradient-4); }
  .theme-preview-gradient-5 { background: var(--theme-gradient-5); }
  
  .theme-preview-neon {
    background: #1a1a1a;
    border: 1px solid #00ff88;
    box-shadow: 0 0 8px #00ff88;
  }
  
  /* ===== 主题动画 ===== */
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes neonPulse {
    0%, 100% {
      box-shadow: 
        0 0 8px #00ff88,
        inset 0 0 15px rgba(0, 255, 136, 0.1);
    }
    50% {
      box-shadow: 
        0 0 20px #00ff88,
        0 0 35px rgba(0, 255, 136, 0.3),
        inset 0 0 25px rgba(0, 255, 136, 0.2);
    }
  }
  
  @keyframes glassShine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  /* ===== 主题响应式 ===== */
  @media (max-width: 480px) {
    .theme-glass {
      backdrop-filter: blur(15px) saturate(160%);
      -webkit-backdrop-filter: blur(15px) saturate(160%);
    }
  }
`;

// 主题工具函数
export const ThemeUtils = {
  // 获取主题预览样式
  getThemePreview(themeId) {
    const previews = {
      'auto': 'theme-preview-auto',
      'glass': 'theme-preview-glass',
      'gradient': 'theme-preview-gradient-1',
      'neon': 'theme-preview-neon'
    };
    return previews[themeId] || 'theme-preview-auto';
  },
  
  // 获取主题应用类
  getThemeClass(themeId) {
    const classes = {
      'auto': 'theme-auto',
      'glass': 'theme-glass',
      'gradient': 'theme-gradient',
      'neon': 'theme-neon'
    };
    return classes[themeId] || 'theme-auto';
  },
  
  // 获取随机渐变
  getRandomGradient() {
    const gradients = [
      'theme-preview-gradient-1',
      'theme-preview-gradient-2', 
      'theme-preview-gradient-3',
      'theme-preview-gradient-4',
      'theme-preview-gradient-5'
    ];
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes();
    return gradients[seed % gradients.length];
  }
};