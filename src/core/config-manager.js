// src/core/config-manager.js
export class ConfigManager {
  // 统一配置schema
  static getUnifiedSchema() {
    return {
      // 基础设置
      'font_size': {
        type: 'select',
        label: '字体大小',
        options: ['较小', '正常', '较大', '超大'],
        default: '正常'
      },
      'text_alignment': {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      'spacing': {
        type: 'select',
        label: '内容间距',
        options: ['紧凑', '正常', '宽松', '超宽'],
        default: '正常'
      },
      
      // 外观设置
      'border_style': {
        type: 'select',
        label: '边框样式',
        options: ['无', '细线', '粗线', '虚线', '阴影', '发光'],
        default: '无'
      },
      'border_radius': {
        type: 'select',
        label: '圆角大小',
        options: ['无圆角', '小圆角', '中圆角', '大圆角', '圆形'],
        default: '中圆角'
      },
      'color_theme': {
        type: 'select',
        label: '颜色主题',
        options: ['跟随系统', '浅色', '深色', '主色', '强调色', '渐变'],
        default: '跟随系统'
      },
      
      // 动画效果
      'animation_style': {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放', '弹跳', '打字机', '逐字显示'],
        default: '淡入'
      },
      'animation_duration': {
        type: 'select',
        label: '动画时长',
        options: ['快速', '正常', '慢速'],
        default: '正常'
      }
    };
  }

  // 样式配置
  static getStyleConfig(config) {
    const schema = this.getUnifiedSchema();
    const styleConfig = {};
    
    Object.keys(schema).forEach(key => {
      styleConfig[key] = config[key] !== undefined ? config[key] : schema[key].default;
    });
    
    return styleConfig;
  }

  // 布局配置
  static getLayoutConfig(config, mode) {
    const baseConfig = {
      mode,
      columns: config.columns || 3,
      style: config.layout_style || 'grid',
      gap: config.layout_gap || 'normal'
    };
    
    // 根据模式添加特定配置
    if (mode === 'free') {
      baseConfig.blocks = config.blocks || [];
      baseConfig.allowCustomBlocks = config.allow_custom_blocks !== false;
    }
    
    return baseConfig;
  }

  // 实体配置
  static getEntityConfig(config, mode) {
    const entityConfig = {
      mode,
      entities: config.entities || {},
      strategy: mode
    };
    
    if (mode === 'free') {
      entityConfig.contentBlocks = config.content_blocks || [];
      entityConfig.layout = config.layout || {};
    } else {
      entityConfig.requirements = config.entity_requirements || {};
    }
    
    return entityConfig;
  }

  // 合并配置
  static mergeConfigs(baseConfig, updates) {
    const merged = { ...baseConfig };
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          merged[key] = { ...merged[key], ...value };
        } else {
          merged[key] = value;
        }
      }
    });
    
    return merged;
  }

  // 配置验证
  static validateConfig(config, schema) {
    const errors = [];
    const warnings = [];
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      const value = config[key];
      
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`必需字段 "${field.label}" 不能为空`);
        return;
      }
      
      if (value !== undefined && value !== null && field.type) {
        switch (field.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`字段 "${field.label}" 必须是数字`);
            }
            break;
          case 'select':
            if (field.options && !field.options.includes(value)) {
              warnings.push(`字段 "${field.label}" 的值不在推荐选项中`);
            }
            break;
        }
      }
    });
    
    return { valid: errors.length === 0, errors, warnings };
  }

  // 应用配置默认值
  static applyDefaults(config, schema) {
    const defaults = {};
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      defaults[key] = field.default !== undefined ? field.default : '';
    });
    
    return this.mergeConfigs(defaults, config);
  }

  // 生成CSS变量
  static generateCSSVariables(styleConfig) {
    const fontSizeMap = {
      '较小': { title: '1.2em', content: '0.9em', large: '2em' },
      '正常': { title: '1.4em', content: '1em', large: '2.5em' },
      '较大': { title: '1.6em', content: '1.1em', large: '3em' },
      '超大': { title: '1.8em', content: '1.2em', large: '3.5em' }
    };
    
    const spacingMap = {
      '紧凑': 'var(--cf-spacing-sm)',
      '正常': 'var(--cf-spacing-md)',
      '宽松': 'var(--cf-spacing-lg)',
      '超宽': 'var(--cf-spacing-xl)'
    };
    
    const fontSize = fontSizeMap[styleConfig.font_size] || fontSizeMap['正常'];
    const spacing = spacingMap[styleConfig.spacing] || spacingMap['正常'];
    
    return `
      .cardforge-title { font-size: ${fontSize.title}; }
      .cardforge-text-medium { font-size: ${fontSize.content}; }
      .cardforge-text-large { font-size: ${fontSize.large}; }
      .cardforge-content { gap: ${spacing}; }
      .cardforge-grid { gap: ${spacing}; }
    `;
  }
}