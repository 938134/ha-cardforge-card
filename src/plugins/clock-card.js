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
        type: 'boolean',
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

  // 通用时间渲染函数
  _renderTimeDisplay(timeData, config, styleClass) {
    const timeFormat = config.time_format !== false;
    const hourDisplay = timeFormat ? timeData.hour : timeData.hour_12;
    
    return `
      <div class="${styleClass}-time">
        <span class="${styleClass}-hour">${hourDisplay}</span>
        <span class="${styleClass}-separator">:</span>
        <span class="${styleClass}-minute">${timeData.minute}</span>
      </div>
      ${!timeFormat ? `<div class="${styleClass}-ampm">${timeData.ampm}</div>` : ''}
    `;
  }

  // 通用日期信息渲染函数
  _renderDateInfo(timeData, config, styleClass) {
    if (!config.show_date && !config.show_weekday) return '';
    
    const dateDisplay = config.show_date ? 
      (styleClass === 'minimal' || styleClass === 'neon' ? timeData.date_short : timeData.date) : '';
    const weekdayDisplay = config.show_weekday ? 
      (styleClass === 'minimal' || styleClass === 'neon' ? timeData.weekday_short : timeData.weekday) : '';
    
    return `
      <div class="${styleClass}-info">
        ${config.show_date ? `<div class="${styleClass}-date">${dateDisplay}</div>` : ''}
        ${config.show_weekday ? `<div class="${styleClass}-weekday">${weekdayDisplay}</div>` : ''}
      </div>
    `;
  }

  _renderModernClock(timeData, config) {
    const timeFormat = config.time_format !== false;
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
        ${this._renderDateInfo(timeData, config, 'modern')}
      </div>
    `;
  }

  _renderClassicClock(timeData, config) {
    return `
      <div class="classic-clock">
        <div class="clock-face">
          ${this._renderTimeDisplay(timeData, config, 'classic')}
        </div>
        ${this._renderDateInfo(timeData, config, 'classic')}
      </div>
    `;
  }

  _renderMinimalClock(timeData, config) {
    return `
      <div class="minimal-clock">
        ${this._renderTimeDisplay(timeData, config, 'minimal')}
        ${this._renderDateInfo(timeData, config, 'minimal')}
      </div>
    `;
  }

  _renderGlassClock(timeData, config) {
    return `
      <div class="glass-clock">
        ${this._renderTimeDisplay(timeData, config, 'glass')}
        ${this._renderDateInfo(timeData, config, 'glass')}
      </div>
    `;
  }

  _renderNeonClock(timeData, config) {
    return `
      <div class="neon-clock">
        ${this._renderTimeDisplay(timeData, config, 'neon')}
        ${this._renderDateInfo(timeData, config, 'neon')}
      </div>
    `;
  }

  getStyles(config) {
    const clockStyle = config.clock_style || '现代风格';
    const styleClass = this._getStyleClass(clockStyle);
    const showAnimations = config.enable_animations !== false;

    // 通用样式变量
    const styles = {
      base: `
        .clock-card {
          padding: var(--cf-spacing-xl);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
      `,
      
      modern: `
        .modern-clock { width: 100%; }
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
        .modern-clock .modern-info {
          display: flex;
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        .modern-clock .modern-date {
          font-size: 1.4em;
          font-weight: 500;
          color: var(--cf-text-primary);
        }
        .modern-clock .modern-weekday {
          font-size: 1.2em;
          color: var(--cf-text-secondary);
          font-weight: 400;
        }
      `,
      
      classic: `
        .classic-clock { width: 100%; }
        .classic-clock .clock-face {
          background: var(--cf-surface);
          border: 3px solid var(--cf-primary-color);
          border-radius: var(--cf-radius-xl);
          padding: var(--cf-spacing-xl);
          margin-bottom: var(--cf-spacing-lg);
          box-shadow: var(--cf-shadow-md);
        }
        .classic-clock .classic-time {
          font-size: 3.5em;
          font-weight: 600;
          color: var(--cf-text-primary);
          font-variant-numeric: tabular-nums;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .classic-clock .classic-separator {
          color: var(--cf-primary-color);
          animation: ${showAnimations ? 'blink 1s infinite' : 'none'};
        }
        .classic-clock .classic-ampm {
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
      `,
      
      minimal: `
        .minimal-clock { width: 100%; }
        .minimal-clock .minimal-time {
          font-size: 4.5em;
          font-weight: 200;
          color: var(--cf-text-primary);
          font-variant-numeric: tabular-nums;
          letter-spacing: -2px;
          margin-bottom: var(--cf-spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .minimal-clock .minimal-separator {
          animation: ${showAnimations ? 'blink 1.5s infinite' : 'none'};
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
      `,
      
      glass: `
        .glass-clock { width: 100%; }
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
      `,
      
      neon: `
        .neon-clock { width: 100%; }
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
      `,
      
      container: `
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
      `,
      
      animations: `
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
      `,
      
      responsive: `
        @media (max-width: 600px) {
          .clock-card {
            padding: var(--cf-spacing-lg);
            min-height: 150px;
          }
          .modern-clock .digit-part { font-size: 3em; }
          .modern-clock .digit-separator { font-size: 2.2em; }
          .classic-clock .classic-time { font-size: 2.8em; }
          .minimal-clock .minimal-time { font-size: 3.5em; }
          .glass-clock .glass-time { font-size: 3.2em; }
          .neon-clock .neon-time { font-size: 3.2em; }
          .modern-clock .modern-info,
          .classic-clock .classic-info,
          .minimal-clock .minimal-info,
          .neon-clock .neon-info {
            flex-direction: column;
            gap: var(--cf-spacing-xs);
          }
        }
        @media (max-width: 400px) {
          .modern-clock .digit-part { font-size: 2.5em; }
          .classic-clock .classic-time { font-size: 2.2em; }
          .minimal-clock .minimal-time { font-size: 3em; }
        }
      `,
      
      darkMode: `
        @media (prefers-color-scheme: dark) {
          .style-glass .cardforge-responsive-container {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .minimal-clock .minimal-time {
            color: var(--cf-dark-text);
          }
        }
      `
    };

    return `
      ${this.getBaseStyles(config)}
      ${styles.base}
      ${styles[styleClass] || styles.modern}
      ${styles.container}
      ${styles.animations}
      ${styles.responsive}
      ${styles.darkMode}
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;