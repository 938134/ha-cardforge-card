// src/core/config-manager.js
export class ConfigManager {
  // 基础配置schema
  static getBaseSchema() {
    return {
      'theme': {
        type: 'select',
        label: '主题风格',
        options: ['自动', '浅色', '深色', '毛玻璃', '渐变', '霓虹', '水墨'],
        default: '自动'
      },
      'animation': {
        type: 'select',
        label: '入场动画', 
        options: ['无', '淡入', '上浮', '缩放'],
        default: '淡入'
      }
    };
  }

  // 应用配置默认值
  static applyDefaults(config, schema) {
    const defaults = {};
    
    // 基础配置默认值
    const baseSchema = this.getBaseSchema();
    Object.entries(baseSchema).forEach(([key, field]) => {
      defaults[key] = field.default;
    });
    
    // 插件配置默认值
    if (schema) {
      Object.entries(schema).forEach(([key, field]) => {
        defaults[key] = field.default !== undefined ? field.default : '';
      });
    }
    
    return { ...defaults, ...config };
  }

  // 生成CSS变量（简化）
  static generateThemeStyles(theme) {
    const themeStyles = {
      '自动': `
        background: var(--card-background-color);
        color: var(--primary-text-color);
      `,
      '浅色': `
        background: #ffffff;
        color: #333333;
      `,
      '深色': `
        background: #1a1a1a;
        color: #ffffff;
      `,
      '毛玻璃': `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: var(--primary-text-color);
      `,
      '渐变': `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      `,
      '霓虹': `
        background: #1a1a1a;
        color: #00ff88;
        border: 1px solid #00ff88;
        box-shadow: 0 0 10px #00ff88;
      `,
      '水墨': `
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
      `
    };
    
    return themeStyles[theme] || themeStyles['自动'];
  }

  // 生成动画样式
  static generateAnimationStyles(animation) {
    const animationStyles = {
      '无': '',
      '淡入': `
        animation: fadeIn 0.6s ease-out;
      `,
      '上浮': `
        animation: slideUp 0.5s ease-out;
      `,
      '缩放': `
        animation: scaleIn 0.4s ease-out;
      `
    };
    
    return animationStyles[animation] || '';
  }
}
