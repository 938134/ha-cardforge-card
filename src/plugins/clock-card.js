// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '视觉时钟',
    version: '2.0.0',
    description: '现代化视觉时钟，支持多种动画效果和主题',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge Visual Team',
    
    config_schema: {
      // 布局配置
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['digital', 'analog', 'minimal', 'neon', 'glass'],
        default: 'digital',
        description: '选择时钟显示风格'
      },
      
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true,
        description: '显示完整日期信息'
      },
      
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true,
        description: '显示星期信息'
      },
      
      show_seconds: {
        type: 'boolean',
        label: '显示秒数',
        default: true,
        description: '显示秒钟动画'
      },
      
      // 动画配置
      enable_glow: {
        type: 'boolean',
        label: '启用光晕效果',
        default: true,
        description: '为数字添加光晕动画'
      },
      
      enable_pulse: {
        type: 'boolean',
        label: '启用脉动效果',
        default: true,
        description: '时间数字脉动动画'
      },
      
      enable_float: {
        type: 'boolean',
        label: '启用浮动效果',
        default: false,
        description: '时钟元素浮动动画'
      },
      
      // 高级配置
      time_format: {
        type: 'select',
        label: '时间格式',
        options: ['24h', '12h'],
        default: '24h',
        description: '选择12小时或24小时制'
      },
      
      emphasis_color: {
        type: 'select',
        label: '强调色',
        options: ['primary', 'accent', 'dynamic', 'rainbow'],
        default: 'dynamic',
        description: '选择时钟强调颜色'
      }
    },
    
    entity_requirements: []
  };

  // 获取动态颜色
  _getDynamicColor(hour) {
    const colorMap = {
      primary: 'var(--cf-primary-color)',
      accent: 'var(--cf-accent-color)',
      dynamic: this._getTimeBasedColor(hour),
      rainbow: this._getRainbowColor()
    };
    
    return colorMap[this.config?.emphasis_color] || colorMap.dynamic;
  }

  // 基于时间的颜色变化
  _getTimeBasedColor(hour) {
    const colors = [
      '#667eea', '#764ba2', // 清晨 0-6
      '#f093fb', '#f5576c', // 上午 6-12  
      '#4facfe', '#00f2fe', // 下午 12-18
      '#fa709a', '#fee140'  // 晚上 18-24
    ];
    
    const index = Math.floor(hour / 6);
    return `linear-gradient(135deg, ${colors[index * 2]} 0%, ${colors[index * 2 + 1]} 100%)`;
  }

  // 彩虹色
  _getRainbowColor() {
    return 'linear-gradient(135deg, #ff6b6b, #ffa726, #ffee58, #66bb6a, #42a5f5, #5c6bc0, #ab47bc)';
  }

  // 生成数字时钟
  _renderDigitalClock(timeData, config) {
    const enableGlow = config.enable_glow !== false;
    const enablePulse = config.enable_pulse !== false;
    const showSeconds = config.show_seconds !== false;
    const dynamicColor = this._getDynamicColor(timeData.hour);

    return `
      <div class="digital-clock ${enableGlow ? 'with-glow' : ''} ${enablePulse ? 'with-pulse' : ''}">
        <div class="time-main">
          <div class="time-digits">
            <span class="digit-group hours">${timeData.hours}</span>
            <span class="digit-separator">:</span>
            <span class="digit-group minutes">${timeData.minutes}</span>
            ${showSeconds ? `
              <span class="digit-separator">:</span>
              <span class="digit-group seconds">${timeData.seconds}</span>
            ` : ''}
          </div>
          ${config.time_format === '12h' ? `
            <div class="ampm-indicator">${timeData.ampm}</div>
          ` : ''}
        </div>
        
        ${(config.show_date || config.show_weekday) ? `
          <div class="date-info">
            ${config.show_date ? `<div class="date">${timeData.date}</div>` : ''}
            ${config.show_weekday ? `<div class="weekday">${timeData.weekday}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- 动态背景元素 -->
        <div class="clock-background">
          <div class="bg-particle particle-1"></div>
          <div class="bg-particle particle-2"></div>
          <div class="bg-particle particle-3"></div>
          <div class="bg-particle particle-4"></div>
        </div>
      </div>
    `;
  }

  // 生成模拟时钟
  _renderAnalogClock(timeData, config) {
    const secondRotation = (timeData.seconds / 60) * 360;
    const minuteRotation = ((timeData.minutes + timeData.seconds / 60) / 60) * 360;
    const hourRotation = ((timeData.hour % 12 + timeData.minutes / 60) / 12) * 360;

    return `
      <div class="analog-clock">
        <div class="clock-face">
          <!-- 时钟刻度 -->
          ${Array.from({length: 12}, (_, i) => `
            <div class="hour-mark mark-${i + 1}" style="transform: rotate(${i * 30}deg)">
              <div class="mark-line"></div>
              <div class="mark-number">${i === 0 ? 12 : i}</div>
            </div>
          `).join('')}
          
          <!-- 时钟指针 -->
          <div class="clock-hands">
            <div class="hand hour-hand" style="transform: rotate(${hourRotation}deg)"></div>
            <div class="hand minute-hand" style="transform: rotate(${minuteRotation}deg)"></div>
            <div class="hand second-hand" style="transform: rotate(${secondRotation}deg)"></div>
            <div class="hand-center"></div>
          </div>
        </div>
        
        <!-- 底部信息 -->
        <div class="analog-info">
          ${config.show_date ? `<div class="date">${timeData.date_short}</div>` : ''}
          ${config.show_weekday ? `<div class="weekday">${timeData.weekday}</div>` : ''}
        </div>
      </div>
    `;
  }

  // 生成简约时钟
  _renderMinimalClock(timeData, config) {
    return `
      <div class="minimal-clock">
        <div class="minimal-time">${timeData.hours}:${timeData.minutes}</div>
        ${config.show_seconds ? `<div class="minimal-seconds">${timeData.seconds}</div>` : ''}
        <div class="minimal-date">
          ${config.show_date ? `<span>${timeData.date_short}</span>` : ''}
          ${config.show_weekday ? `<span>${timeData.weekday}</span>` : ''}
        </div>
      </div>
    `;
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    const timeData = {
      ...systemData,
      hour: new Date().getHours(),
      hours: systemData.time.split(':')[0],
      minutes: systemData.time.split(':')[1],
      seconds: String(new Date().getSeconds()).padStart(2, '0'),
      ampm: systemData.hour >= 12 ? 'PM' : 'AM'
    };

    const clockStyle = config.clock_style || 'digital';
    const enableFloat = config.enable_float || false;

    let clockHTML = '';
    
    switch (clockStyle) {
      case 'analog':
        clockHTML = this._renderAnalogClock(timeData, config);
        break;
      case 'minimal':
        clockHTML = this._renderMinimalClock(timeData, config);
        break;
      case 'neon':
        clockHTML = this._renderDigitalClock(timeData, { ...config, enable_glow: true });
        break;
      case 'glass':
        clockHTML = this._renderDigitalClock(timeData, config);
        break;
      default:
        clockHTML = this._renderDigitalClock(timeData, config);
    }

    return `
      <div class="cardforge-responsive-container clock-card style-${clockStyle} ${enableFloat ? 'with-float' : ''}">
        <div class="cardforge-content-grid">
          ${clockHTML}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const clockStyle = config.clock_style || 'digital';
    const enableGlow = config.enable_glow !== false;
    const enablePulse = config.enable_pulse !== false;
    const enableFloat = config.enable_float || false;
    const showSeconds = config.show_seconds !== false;
    const dynamicColor = this._getDynamicColor(new Date().getHours());

    return `
      ${this.getBaseStyles(config)}
      
      .clock-card {
        padding: ${clockStyle === 'analog' ? 'var(--cf-spacing-xl)' : 'var(--cf-spacing-lg)'};
        position: relative;
        overflow: hidden;
        min-height: ${clockStyle === 'analog' ? '280px' : '180px'};
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* 数字时钟样式 */
      .digital-clock {
        text-align: center;
        position: relative;
        z-index: 2;
      }
      
      .time-main {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .time-digits {
        display: flex;
        align-items: baseline;
        gap: 2px;
        font-variant-numeric: tabular-nums;
      }
      
      .digit-group {
        font-size: 3.5em;
        font-weight: 300;
        background: ${dynamicColor};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        position: relative;
      }
      
      .digit-separator {
        font-size: 2.5em;
        font-weight: 200;
        color: var(--cf-text-secondary);
        animation: blink 2s infinite;
      }
      
      .seconds {
        font-size: 2em;
        opacity: 0.8;
      }
      
      .ampm-indicator {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-accent-color);
        margin-left: var(--cf-spacing-sm);
        opacity: 0.8;
      }
      
      .date-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .date {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .weekday {
        font-size: 1em;
        color: var(--cf-text-secondary);
        font-weight: 400;
      }
      
      /* 光晕效果 */
      .with-glow .digit-group {
        filter: drop-shadow(0 0 10px currentColor);
      }
      
      .with-glow .digit-group::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        filter: blur(15px);
        opacity: 0.3;
        z-index: -1;
      }
      
      /* 脉动效果 */
      .with-pulse .digit-group {
        animation: gentle-pulse 3s ease-in-out infinite;
      }
      
      .with-pulse .seconds {
        animation: gentle-pulse 1s ease-in-out infinite;
      }
      
      /* 模拟时钟样式 */
      .analog-clock {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-lg);
      }
      
      .clock-face {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: var(--cf-surface);
        border: 3px solid var(--cf-primary-color);
        position: relative;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.1),
          inset 0 0 20px rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .hour-mark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
      }
      
      .mark-line {
        width: 2px;
        height: 12px;
        background: var(--cf-text-primary);
        margin: 8px auto 0;
        opacity: 0.6;
      }
      
      .mark-number {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-top: 4px;
        transform: rotate(-90deg);
      }
      
      .clock-hands {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
      }
      
      .hand {
        position: absolute;
        background: var(--cf-text-primary);
        border-radius: 4px;
        transform-origin: bottom center;
        transition: transform 0.2s cubic-bezier(0.4, 2.3, 0.8, 1);
      }
      
      .hour-hand {
        width: 6px;
        height: 40px;
        top: 30px;
        left: calc(50% - 3px);
        background: var(--cf-primary-color);
      }
      
      .minute-hand {
        width: 4px;
        height: 60px;
        top: 10px;
        left: calc(50% - 2px);
        background: var(--cf-text-primary);
      }
      
      .second-hand {
        width: 2px;
        height: 70px;
        top: 0;
        left: calc(50% - 1px);
        background: var(--cf-accent-color);
      }
      
      .hand-center {
        position: absolute;
        top: calc(50% - 6px);
        left: calc(50% - 6px);
        width: 12px;
        height: 12px;
        background: var(--cf-accent-color);
        border-radius: 50%;
        border: 2px solid var(--cf-surface);
      }
      
      .analog-info {
        display: flex;
        gap: var(--cf-spacing-md);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      /* 简约时钟样式 */
      .minimal-clock {
        text-align: center;
      }
      
      .minimal-time {
        font-size: 4em;
        font-weight: 200;
        color: var(--cf-text-primary);
        font-variant-numeric: tabular-nums;
        margin-bottom: var(--cf-spacing-sm);
        letter-spacing: -2px;
      }
      
      .minimal-seconds {
        font-size: 1.2em;
        color: var(--cf-accent-color);
        margin-bottom: var(--cf-spacing-md);
        font-variant-numeric: tabular-nums;
      }
      
      .minimal-date {
        display: flex;
        gap: var(--cf-spacing-md);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        justify-content: center;
      }
      
      /* 背景粒子 */
      .clock-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        overflow: hidden;
      }
      
      .bg-particle {
        position: absolute;
        border-radius: 50%;
        background: rgba(var(--cf-rgb-primary), 0.1);
        animation: float-particle 20s infinite linear;
      }
      
      .particle-1 {
        width: 80px;
        height: 80px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      .particle-2 {
        width: 120px;
        height: 120px;
        top: 60%;
        right: 10%;
        animation-delay: -5s;
      }
      
      .particle-3 {
        width: 60px;
        height: 60px;
        bottom: 20%;
        left: 20%;
        animation-delay: -10s;
      }
      
      .particle-4 {
        width: 100px;
        height: 100px;
        top: 30%;
        right: 20%;
        animation-delay: -15s;
      }
      
      /* 动画定义 */
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      @keyframes gentle-pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.9;
        }
      }
      
      @keyframes float-particle {
        0% {
          transform: translateY(0px) rotate(0deg);
        }
        33% {
          transform: translateY(-20px) rotate(120deg);
        }
        66% {
          transform: translateY(10px) rotate(240deg);
        }
        100% {
          transform: translateY(0px) rotate(360deg);
        }
      }
      
      /* 浮动效果 */
      .with-float .digital-clock,
      .with-float .analog-clock,
      .with-float .minimal-clock {
        animation: gentle-float 6s ease-in-out infinite;
      }
      
      @keyframes gentle-float {
        0%, 100% { 
          transform: translateY(0px); 
        }
        50% { 
          transform: translateY(-8px); 
        }
      }
      
      /* 风格变体 */
      .style-neon .digital-clock {
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #00ff88;
        box-shadow: 
          0 0 20px #00ff88,
          inset 0 0 20px rgba(0, 255, 136, 0.1);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
      }
      
      .style-glass .digital-clock {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .clock-card {
          padding: var(--cf-spacing-md);
          min-height: 150px;
        }
        
        .digit-group {
          font-size: 2.5em;
        }
        
        .digit-separator {
          font-size: 1.8em;
        }
        
        .seconds {
          font-size: 1.5em;
        }
        
        .clock-face {
          width: 150px;
          height: 150px;
        }
        
        .minimal-time {
          font-size: 3em;
        }
      }
      
      @media (max-width: 400px) {
        .digit-group {
          font-size: 2em;
        }
        
        .time-main {
          flex-direction: column;
          align-items: center;
          gap: var(--cf-spacing-xs);
        }
        
        .clock-face {
          width: 120px;
          height: 120px;
        }
        
        .minimal-time {
          font-size: 2.5em;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .style-glass .digital-clock {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .bg-particle {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;