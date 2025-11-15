import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const themeStyles = css`
  /* ===== 主题预览样式 ===== */
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
  
  .theme-preview-gradient-1 { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  }
  .theme-preview-gradient-2 { 
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
  }
  .theme-preview-gradient-3 { 
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); 
  }
  .theme-preview-gradient-4 { 
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); 
  }
  .theme-preview-gradient-5 { 
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); 
  }
  
  .theme-preview-neon {
    background: #1a1a1a;
    border: 1px solid #00ff88;
    box-shadow: 0 0 8px #00ff88;
  }
  
  .theme-preview-ink-wash {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border: 1px solid #7f8c8d;
  }

  /* ===== 主题动画 ===== */
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
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
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes sealRotate {
    0%, 100% { transform: rotate(15deg); }
    50% { transform: rotate(25deg); }
  }
  
  @keyframes messageFade {
    0% { opacity: 0; transform: translateY(5px); }
    100% { opacity: 0.8; transform: translateY(0px); }
  }

  /* ===== 主题应用类 ===== */
  .theme-auto {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border-color: var(--divider-color);
  }
  
  .theme-glass {
    background: linear-gradient(135deg, 
      rgba(var(--rgb-primary-background-color), 0.25) 0%, 
      rgba(var(--rgb-primary-background-color), 0.15) 50%,
      rgba(var(--rgb-primary-background-color), 0.1) 100%);
    color: var(--primary-text-color);
    border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
  }
  
  .theme-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: 200% 200%;
    animation: gradientShift 8s ease infinite;
    color: white;
    border: none;
  }
  
  .theme-neon {
    background: #1a1a1a;
    color: #00ff88;
    border: 1px solid #00ff88;
    box-shadow: 
      0 0 10px #00ff88,
      0 0 20px rgba(0, 255, 136, 0.3);
    animation: neonPulse 2s ease-in-out infinite;
  }
  
  .theme-ink-wash {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: #ecf0f1;
    border: 1px solid #7f8c8d;
    position: relative;
    overflow: hidden;
  }
`;