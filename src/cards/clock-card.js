// src/cards/clock-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'clock-card',
  name: '时钟卡片',
  description: '显示当前时间和日期，支持12/24小时制',
  icon: '⏰',
  category: '时间',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    use_24_hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    show_date: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    show_weekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    show_seconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    },
    font_size: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    },
    text_color: {
      type: 'color',
      label: '文字颜色',
      options: [
        { value: 'blue', label: '蓝色' },
        { value: 'red', label: '红色' },
        { value: 'green', label: '绿色' },
        { value: 'yellow', label: '黄色' },
        { value: 'purple', label: '紫色' }
      ],
      default: 'blue'
    }
  }
};

export class ClockCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig,
      // 不再使用块管理
      areas: {
        content: {
          layout: 'single',
          blocks: ['clock_display']
        }
      },
      blocks: {
        clock_display: {
          type: 'clock_display',
          area: 'content',
          entity: '',
          content: ''
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，添加实时时间
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 创建配置的深拷贝，避免修改原始配置
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 更新时间为当前时间
    const now = new Date();
    dynamicConfig.blocks.clock_display.content = this._generateClockContent(now, dynamicConfig);
    
    return super.render(dynamicConfig, hass, entities);
  }

  _generateClockContent(date, config) {
    const timeHtml = this._formatTime(date, config);
    const dateHtml = this._formatDate(date, config);
    const weekdayHtml = this._formatWeekday(date, config);
    
    let content = timeHtml;
    
    if (config.show_date && dateHtml) {
      content += dateHtml;
    }
    
    if (config.show_weekday && weekdayHtml) {
      content += weekdayHtml;
    }
    
    return content;
  }

  _formatTime(date, config) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = '';
    
    if (config.show_seconds) {
      seconds = ':' + date.getSeconds().toString().padStart(2, '0');
    }
    
    if (config.use_24_hour) {
      return `<div class="clock-time">${hours.toString().padStart(2, '0')}:${minutes}${seconds}</div>`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `<div class="clock-time">${hours}:${minutes}${seconds} <span class="clock-ampm">${ampm}</span></div>`;
    }
  }

  _formatDate(date, config) {
    if (!config.show_date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `<div class="clock-date">${year}年${month}月${day}日</div>`;
  }

  _formatWeekday(date, config) {
    if (!config.show_weekday) return '';
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `<div class="clock-weekday">${weekday}</div>`;
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    // 时钟显示块特殊处理
    if (blockConfig.type === 'clock_display') {
      const content = this._getBlockContent(blockConfig, hass);
      if (!content) return '';
      
      return `<div class="clock-display">${content}</div>`;
    }
    
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _getBlockContent(blockConfig, hass) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states?.[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 回退到静态内容
    return blockConfig.content || '';
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderStyles(config, themeStyles) {
    // 安全地访问配置，提供默认值
    const safeConfig = config || {};
    const font_size = safeConfig.font_size || CARD_CONFIG.config_schema.font_size.default;
    const text_color = safeConfig.text_color || CARD_CONFIG.config_schema.text_color.default;
    
    const colorMap = {
      blue: '#4285f4',
      red: '#ea4335',
      green: '#34a853',
      yellow: '#fbbc05',
      purple: '#a142f4'
    };
    
    const fontSizeMap = {
      small: { time: '2em', date: '0.9em', weekday: '0.9em' },
      medium: { time: '2.5em', date: '1em', weekday: '1em' },
      large: { time: '3em', date: '1.1em', weekday: '1.1em' }
    };
    
    const selectedColor = colorMap[text_color] || text_color;
    const selectedSize = fontSizeMap[font_size] || fontSizeMap.medium;

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 时钟显示区域 */
      .cardforge-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 120px;
        text-align: center;
      }
      
      .clock-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: ${selectedColor};
        font-family: 'Segoe UI', 'Roboto', sans-serif;
      }
      
      .clock-time {
        font-size: ${selectedSize.time};
        font-weight: 300;
        line-height: 1.2;
        margin: 0;
      }
      
      .clock-ampm {
        font-size: 0.5em;
        font-weight: 400;
        margin-left: 4px;
        opacity: 0.8;
      }
      
      .clock-date {
        font-size: ${selectedSize.date};
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
        opacity: 0.9;
      }
      
      .clock-weekday {
        font-size: ${selectedSize.weekday};
        font-weight: 400;
        line-height: 1.3;
        margin: 0;
        opacity: 0.8;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-area {
          min-height: 100px;
          padding: var(--cf-spacing-md);
        }
        
        .clock-time {
          font-size: ${font_size === 'large' ? '2.2em' : 
                      font_size === 'medium' ? '1.8em' : '1.5em'};
        }
        
        .clock-date,
        .clock-weekday {
          font-size: ${font_size === 'large' ? '0.9em' : 
                      font_size === 'medium' ? '0.85em' : '0.8em'};
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default ClockCard;