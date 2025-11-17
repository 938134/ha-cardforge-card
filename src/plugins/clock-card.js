// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '精美时钟',
    version: '2.0.0',
    description: '多种风格的时钟卡片，支持日期和星期显示',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge',
    
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['现代风格', '经典风格', '简约风格', '毛玻璃风格', '霓虹风格'],
        default: '现代风格'
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
      
      time_format: {
        type: 'boolean',  // 改为 boolean 类型，使用 switch
        label: '24小时制',
        default: true
      },
      
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true
      }
    }
  };

  // 获取时间数据
  _getTimeData() {
    const now = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const hour = now.getHours();
    const isPM = hour >= 12;
    
    return {
      // 时间
      time_24h: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      time_12h: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      
      // 日期
      date: now.toLocaleDateString('zh-CN'),
      date_short: `${now.getMonth() + 1}月${now.getDate()}日`,
      year: now.getFullYear(),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
      
      // 星期
      weekday: `星期${weekdays[now.getDay()]}`,
      weekday_short: `周${weekdays[now.getDay()]}`,
      
      // 时间组件
      hour: String(now.getHours()).padStart(2, '0'),
      hour_12: String(hour % 12 || 12).padStart(2, '0'),
      minute: String(now.getMinutes()).padStart(2, '0'),
      ampm: isPM ? 'PM' : 'AM'
    };
  }

  getTemplate(config, hass, entities) {
    const timeData = this._getTimeData();
    const clockStyle = config.clock_style || '现代风格';
    const showAnimations = config.enable_animations !== false;

    return `
      <div class="cardforge-responsive-container clock-card style-${this._getStyleClass(clockStyle)} ${showAnimations ? 'with-animations' : ''}">
        <div class="cardforge-content-grid">
          ${this._renderClock(timeData, config)}
        </div>
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '现代风格': 'modern',
      '经典风格': 'classic', 
      '简约风格': 'minimal',
      '毛玻璃风格': 'glass',
      '霓虹风格': 'neon'
    };
    return styleMap[styleName] || 'modern';
  }

  _renderClock(timeData, config) {
    const clockStyle = config.clock_style || '现代风格';
    
    switch (clockStyle) {
      case '经典风格':
        return this._renderClassicClock(timeData, config);
      case '简约风格':
        return this._renderMinimalClock(timeData, config);
      case '毛玻璃风格':
        return this._renderGlassClock(timeData, config);
      case '霓虹风格':
        return this._renderNeonClock(timeData, config);
      default:
        return this._renderModernClock(timeData, config);
    }
  }

  _renderModernClock(timeData, config) {
    const timeFormat = config.time_format !== false; // true = 24小时制
    const timeDisplay = timeFormat ? timeData.time_24h : timeData.time_12h;
    
    return `
      <div class="modern-clock">
        <div class="time-main">
          <div class="time-digits">
            ${timeDisplay.split(':').map((part, index) => `
              <span class="digit-part">${part}</span>
              ${index < 1 ? '<span class="digit-separator">:</span>' : ''}
            `).join('')}
          </div>
          ${!timeFormat ? `
            <div class="ampm-indicator">${timeData.ampm}</div>
          ` : ''}
        </div>
        
        ${(config.show_date || config.show_weekday) ? `
          <div class="date-info">
            ${config.show_date ? `<div class="date">${timeData.date}</div>` : ''}
            ${config.show_weekday ? `<div class="weekday">${timeData.weekday}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderClassicClock(timeData, config) {
    const timeFormat = config.time_format !== false;
    const hourDisplay = timeFormat ? timeData.hour : timeData.hour_12;
    
    return `
      <div class="classic-clock">
        <div class="clock-face">
          <div class="time-display">
            <span class="hour">${hourDisplay}</span>
            <span class="time-separator">:</span>
            <span class="minute">${timeData.minute}</span>
          </div>
          ${!timeFormat ? `<div class="ampm-display">${timeData.ampm}</div>` : ''}
        </div>
        
        <div class="classic-info">
          ${config.show_date ? `<div class="classic-date">${timeData.date_short}</div>` : ''}
          ${config.show_weekday ? `<div class="classic-weekday">${timeData.weekday}</div>` : ''}
        </div>
      </div>
    `;
  }

  _renderMinimalClock(timeData, config) {
    const timeFormat = config.time_format !== false;
    const hourDisplay = timeFormat ? timeData.hour : timeData.hour_12;
    
    return `
      <div class="minimal-clock">
        <div class="minimal-time">${hourDisplay}:${timeData.minute}</div>
        ${!timeFormat ? `<div class="minimal-ampm">${timeData.ampm}</div>` : ''}
        
        <div class="minimal-info">
          ${config.show_date ? `<div class="minimal-date">${timeData.date_short}</div>` : ''}
          ${config.show_weekday ? `<div class="minimal-weekday">${timeData.weekday_short}</div>` : ''}
        </div>
      </div>
    `;
  }

  _renderGlassClock(timeData, config) {
    const timeFormat = config.time_format !== false;
    const hourDisplay = timeFormat ? timeData.hour : timeData.hour_12;
    
    return `
      <div class="glass-clock">
        <div class="glass-time">
          <span class="glass-hour">${hourDisplay}</span>
          <span class="glass-separator">:</span>
          <span class="glass-minute">${timeData.minute}</span>
        </div>
        ${!timeFormat ? `<div class="glass-ampm">${timeData.ampm}</div>` : ''}
        
        <div class="glass-info">
          ${config.show_date ? `<div class="glass-date">${timeData.date}</div>` : ''}
          ${config.show_weekday ? `<div class="glass-weekday">${timeData.weekday}</div>` : ''}
        </div>
      </div>
    `;
  }

  _renderNeonClock(timeData, config) {
    const timeFormat = config.time_format !== false;
    const hourDisplay = timeFormat ? timeData.hour : timeData.hour_12;
    
    return `
      <div class="neon-clock">
        <div class="neon-time">
          <span class="neon-digit">${hourDisplay}</span>
          <span class="neon-separator">:</span>
          <span class="neon-digit">${timeData.minute}</span>
        </div>
        ${!timeFormat ? `<div class="neon-ampm">${timeData.ampm}</div>` : ''}
        
        <div class="neon-info">
          ${config.show_date ? `<div class="neon-date">${timeData.date_short}</div>` : ''}
          ${config.show_weekday ? `<div class="neon-weekday">${timeData.weekday_short}</div>` : ''}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const clockStyle = config.clock_style || '现代风格';
    const styleClass = this._getStyleClass(clockStyle);
    const showAnimations = config.enable_animations !== false;

    return `
      ${this.getBaseStyles(config)}
      
      .clock-card {
        padding: var(--cf-spacing-xl);
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      /* ===== 现代风格 ===== */
      .modern-clock {
        width: 100%;
      }

      .modern-clock .time-main {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .modern-clock .time-digits {
        display: flex;
        align-items: baseline;
        gap: 2px;
        font-variant-numeric: tabular-nums;
      }

      .modern-clock .digit-part {
        font-size: 4em;
        font-weight: 300;
        color: var(--cf-text-primary);
        line-height: 1;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .modern-clock .digit-separator {
        font-size: 3em;
        font-weight: 200;
        color: var(--cf-primary-color);
        animation: ${showAnimations ? 'blink 2s infinite' : 'none'};
      }

      .modern-clock .ampm-indicator {
        font-size: 1.5em;
        font-weight: 600;
        color: var(--cf-accent-color);
        margin-left: var(--cf-spacing-sm);
        align-self: flex-end;
        margin-bottom: 0.2em;
      }

      .modern-clock .date-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }

      .modern-clock .date {
        font-size: 1.4em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .modern-clock .weekday {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
        font-weight: 400;
      }

      /* ===== 经典风格 ===== */
      .classic-clock {
        width: 100%;
      }

      .classic-clock .clock-face {
        background: var(--cf-surface);
        border: 3px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-xl);
        padding: var(--cf-spacing-xl);
        margin-bottom: var(--cf-spacing-lg);
        box-shadow: var(--cf-shadow-md);
      }

      .classic-clock .time-display {
        font-size: 3.5em;
        font-weight: 600;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .classic-clock .time-separator {
        color: var(--cf-primary-color);
        animation: ${showAnimations ? 'blink 1s infinite' : 'none'};
      }

      .classic-clock .ampm-display {
        font-size: 1.2em;
        color: var(--cf-accent-color);
        font-weight: 600;
        margin-top: var(--cf-spacing-sm);
      }

      .classic-clock .classic-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        justify-content: center;
        font-size: 1.1em;
      }

      .classic-clock .classic-date {
        color: var(--cf-text-primary);
        font-weight: 500;
      }

      .classic-clock .classic-weekday {
        color: var(--cf-accent-color);
        font-weight: 500;
      }

      /* ===== 简约风格 ===== */
      .minimal-clock {
        width: 100%;
      }

      .minimal-clock .minimal-time {
        font-size: 4.5em;
        font-weight: 200;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
        letter-spacing: -2px;
        margin-bottom: var(--cf-spacing-sm);
      }

      .minimal-clock .minimal-ampm {
        font-size: 1.2em;
        color: var(--cf-accent-color);
        font-weight: 500;
        margin-bottom: var(--cf-spacing-lg);
      }

      .minimal-clock .minimal-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        justify-content: center;
        font-size: 1em;
        color: var(--cf-text-secondary);
      }

      /* ===== 毛玻璃风格 ===== */
      .glass-clock {
        width: 100%;
      }

      .glass-clock .glass-time {
        font-size: 4em;
        font-weight: 300;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
        margin-bottom: var(--cf-spacing-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .glass-clock .glass-separator {
        color: var(--cf-primary-color);
        animation: ${showAnimations ? 'blink 1.5s infinite' : 'none'};
      }

      .glass-clock .glass-ampm {
        font-size: 1.3em;
        color: var(--cf-accent-color);
        font-weight: 500;
        margin-bottom: var(--cf-spacing-lg);
      }

      .glass-clock .glass-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
        font-size: 1.1em;
        color: var(--cf-text-primary);
        opacity: 0.9;
      }

      /* ===== 霓虹风格 ===== */
      .neon-clock {
        width: 100%;
      }

      .neon-clock .neon-time {
        font-size: 4em;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-bottom: var(--cf-spacing-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        text-shadow: 
          0 0 5px #00ff88,
          0 0 10px #00ff88,
          0 0 20px #00ff88;
        animation: ${showAnimations ? 'neonPulse 2s infinite' : 'none'};
      }

      .neon-clock .neon-digit {
        color: #00ff88;
      }

      .neon-clock .neon-separator {
        color: #00ff88;
        animation: ${showAnimations ? 'blink 1s infinite' : 'none'};
      }

      .neon-clock .neon-ampm {
        font-size: 1.3em;
        color: #00ff88;
        font-weight: 500;
        margin-bottom: var(--cf-spacing-lg);
        text-shadow: 0 0 5px #00ff88;
      }

      .neon-clock .neon-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        justify-content: center;
        font-size: 1.1em;
        color: #00ff88;
        text-shadow: 0 0 5px #00ff88;
      }

      /* ===== 动画定义 ===== */
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }

      @keyframes neonPulse {
        0%, 100% { 
          text-shadow: 
            0 0 5px #00ff88,
            0 0 10px #00ff88,
            0 0 20px #00ff88;
        }
        50% { 
          text-shadow: 
            0 0 10px #00ff88,
            0 0 20px #00ff88,
            0 0 40px #00ff88;
        }
      }

      /* ===== 风格特定的容器样式 ===== */
      .style-glass .cardforge-responsive-container {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .style-neon .cardforge-responsive-container {
        background: #1a1a1a;
        border: 1px solid #00ff88;
        box-shadow: 
          0 0 10px #00ff88,
          inset 0 0 15px rgba(0, 255, 136, 0.1);
      }

      .style-minimal .cardforge-responsive-container {
        background: transparent;
        border: none;
        box-shadow: none;
      }

      /* ===== 响应式优化 ===== */
      @media (max-width: 600px) {
        .clock-card {
          padding: var(--cf-spacing-lg);
          min-height: 150px;
        }

        .modern-clock .digit-part {
          font-size: 3em;
        }

        .modern-clock .digit-separator {
          font-size: 2.2em;
        }

        .classic-clock .time-display {
          font-size: 2.8em;
        }

        .minimal-clock .minimal-time {
          font-size: 3.5em;
        }

        .glass-clock .glass-time {
          font-size: 3.2em;
        }

        .neon-clock .neon-time {
          font-size: 3.2em;
        }

        .modern-clock .date-info,
        .classic-clock .classic-info,
        .minimal-clock .minimal-info,
        .neon-clock .neon-info {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
      }

      @media (max-width: 400px) {
        .modern-clock .digit-part {
          font-size: 2.5em;
        }

        .classic-clock .time-display {
          font-size: 2.2em;
        }

        .minimal-clock .minimal-time {
          font-size: 3em;
        }
      }

      /* ===== 深色模式优化 ===== */
      @media (prefers-color-scheme: dark) {
        .style-glass .cardforge-responsive-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .minimal-clock .minimal-time {
          color: var(--cf-dark-text);
        }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;
