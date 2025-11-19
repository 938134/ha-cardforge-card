// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '精美时钟',
    version: '2.2.0',
    description: '六种独特风格的时钟卡片，每种都有鲜明特色',
    category: '时间',
    icon: '🕰️',
    author: 'CardForge',
    
    config_schema: {
      clock_style: {
        type: 'select',
        label: '时钟风格',
        options: ['液态金属', '霓虹赛博', '机械齿轮', '水墨书法', '全息投影', '极简线条'],
        default: '液态金属'
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
      }
    },
    
    entity_requirements: {}
  };

  constructor() {
    super();
    this._currentTime = this._getTimeData({});
    this._intervalId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // 启动时钟更新
    this._intervalId = setInterval(() => {
      this._currentTime = this._getTimeData(this.config || {});
      this.requestUpdate();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  getTemplate(config, hass, entities) {
    const timeData = this._getTimeData(config);
    const clockStyle = config.clock_style || '液态金属';

    const content = this._renderClockContent(clockStyle, timeData, config);
    return this._renderCardContainer(content, `clock-card style-${this._getStyleClass(clockStyle)}`, config);
  }

  _getTimeData(config) {
    const now = new Date();
    const timeFormat = config.time_format !== false;
    const hour = now.getHours();
    
    return {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: !timeFormat 
      }),
      time24: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      hour: String(hour).padStart(2, '0'),
      minute: String(now.getMinutes()).padStart(2, '0'),
      second: String(now.getSeconds()).padStart(2, '0'),
      ampm: hour >= 12 ? 'PM' : 'AM',
      date: now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      dateDigital: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      weekdayEn: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()],
      timestamp: now.getTime()
    };
  }

  _renderClockContent(style, timeData, config) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'liquid': () => this._renderLiquidMetalStyle(timeData, config),
      'cyber': () => this._renderCyberStyle(timeData, config),
      'mechanical': () => this._renderMechanicalStyle(timeData, config),
      'ink': () => this._renderInkStyle(timeData, config),
      'hologram': () => this._renderHologramStyle(timeData, config),
      'minimal': () => this._renderMinimalStyle(timeData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['liquid']();
  }

  /* ===== 液态金属风格 ===== */
  _renderLiquidMetalStyle(timeData, config) {
    return `
      <div class="liquid-layout">
        <div class="liquid-container">
          <div class="liquid-time">${timeData.time24}</div>
          <div class="liquid-reflect"></div>
        </div>
        ${config.show_date || config.show_weekday ? `
          <div class="liquid-info">
            ${config.show_date ? `<div class="liquid-date">${timeData.dateDigital}</div>` : ''}
            ${config.show_weekday ? `<div class="liquid-weekday">${timeData.weekdayEn}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 霓虹赛博风格 ===== */
  _renderCyberStyle(timeData, config) {
    return `
      <div class="cyber-layout">
        <div class="cyber-grid"></div>
        <div class="cyber-time">${timeData.time24}</div>
        <div class="cyber-scanline"></div>
        ${config.show_date || config.show_weekday ? `
          <div class="cyber-info">
            ${config.show_date ? `<div class="cyber-date">${timeData.dateDigital}</div>` : ''}
            ${config.show_weekday ? `<div class="cyber-weekday">${timeData.weekdayEn}</div>` : ''}
          </div>
        ` : ''}
        <div class="cyber-glitch"></div>
      </div>
    `;
  }

  /* ===== 机械齿轮风格 ===== */
  _renderMechanicalStyle(timeData, config) {
    const hourRotation = (timeData.hour % 12) * 30;
    const minuteRotation = timeData.minute * 6;
    
    return `
      <div class="mechanical-layout">
        <div class="clock-face">
          <div class="gear large-gear" style="transform: rotate(${hourRotation}deg)">
            <div class="gear-teeth"></div>
            <div class="hour-hand"></div>
          </div>
          <div class="gear small-gear" style="transform: rotate(${minuteRotation}deg)">
            <div class="gear-teeth"></div>
            <div class="minute-hand"></div>
          </div>
          <div class="center-dot"></div>
        </div>
        <div class="mechanical-time">${timeData.time}</div>
        ${config.show_date || config.show_weekday ? `
          <div class="mechanical-info">
            ${config.show_date ? `<div class="mechanical-date">${timeData.date}</div>` : ''}
            ${config.show_weekday ? `<div class="mechanical-weekday">${timeData.weekday}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 水墨书法风格 ===== */
  _renderInkStyle(timeData, config) {
    return `
      <div class="ink-layout">
        <div class="ink-background"></div>
        <div class="ink-time">
          <span class="ink-hour">${timeData.hour}</span>
          <span class="ink-colon">:</span>
          <span class="ink-minute">${timeData.minute}</span>
        </div>
        ${config.show_date || config.show_weekday ? `
          <div class="ink-info">
            ${config.show_date ? `<div class="ink-date">${timeData.date}</div>` : ''}
            ${config.show_weekday ? `<div class="ink-weekday">${timeData.weekday}</div>` : ''}
          </div>
        ` : ''}
        <div class="ink-splash"></div>
      </div>
    `;
  }

  /* ===== 全息投影风格 ===== */
  _renderHologramStyle(timeData, config) {
    return `
      <div class="hologram-layout">
        <div class="hologram-beam"></div>
        <div class="hologram-time">${timeData.time24}</div>
        <div class="hologram-grid"></div>
        ${config.show_date || config.show_weekday ? `
          <div class="hologram-info">
            ${config.show_date ? `<div class="hologram-date">${timeData.dateDigital}</div>` : ''}
            ${config.show_weekday ? `<div class="hologram-weekday">${timeData.weekdayEn}</div>` : ''}
          </div>
        ` : ''}
        <div class="hologram-particles"></div>
      </div>
    `;
  }

  /* ===== 极简线条风格 ===== */
  _renderMinimalStyle(timeData, config) {
    const hourRotation = (timeData.hour % 12) * 30 + timeData.minute * 0.5;
    const minuteRotation = timeData.minute * 6;
    
    return `
      <div class="minimal-layout">
        <div class="minimal-face">
          <div class="minimal-hour-hand" style="transform: rotate(${hourRotation}deg)"></div>
          <div class="minimal-minute-hand" style="transform: rotate(${minuteRotation}deg)"></div>
          <div class="minimal-center"></div>
        </div>
        <div class="minimal-time">${timeData.time}</div>
        ${config.show_date || config.show_weekday ? `
          <div class="minimal-info">
            ${config.show_date ? `<div class="minimal-date">${timeData.dateDigital}</div>` : ''}
            ${config.show_weekday ? `<div class="minimal-weekday">${timeData.weekdayEn}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '液态金属': 'liquid',
      '霓虹赛博': 'cyber', 
      '机械齿轮': 'mechanical',
      '水墨书法': 'ink',
      '全息投影': 'hologram',
      '极简线条': 'minimal'
    };
    return styleMap[styleName] || 'liquid';
  }

  getStyles(config) {
    const clockStyle = config.clock_style || '液态金属';
    const styleClass = this._getStyleClass(clockStyle);
    
    // 使用增强的基类样式
    const baseStyles = this.getEnhancedBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .clock-card {
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      /* ===== 液态金属样式 ===== */
      .style-liquid {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
        color: #e0e0e0;
      }

      .liquid-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
        position: relative;
      }

      .liquid-container {
        position: relative;
        display: inline-block;
      }

      .liquid-time {
        font-size: 3.5em;
        font-weight: 700;
        background: linear-gradient(45deg, #b8b8b8, #ffffff, #b8b8b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-family: 'Arial', sans-serif;
        letter-spacing: 2px;
      }

      .liquid-reflect {
        position: absolute;
        bottom: -5px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
        border-radius: 50%;
        filter: blur(1px);
      }

      .liquid-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 0.9em;
        opacity: 0.8;
      }

      /* ===== 霓虹赛博样式 ===== */
      .style-cyber {
        background: #0a0a0a;
        color: #00ff88;
        font-family: 'Courier New', monospace;
      }

      .cyber-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
        position: relative;
      }

      .cyber-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        animation: gridMove 20s linear infinite;
        opacity: 0.3;
      }

      .cyber-time {
        font-size: 3.2em;
        font-weight: 700;
        color: #00ff88;
        text-shadow: 
          0 0 10px #00ff88,
          0 0 20px #00ff88,
          0 0 30px #00ff88;
        letter-spacing: 3px;
        position: relative;
        z-index: 2;
      }

      .cyber-scanline {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: #00ff88;
        box-shadow: 0 0 10px #00ff88;
        animation: scanline 2s linear infinite;
        z-index: 1;
      }

      .cyber-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 0.9em;
        color: #00ff88;
        text-shadow: 0 0 5px #00ff88;
        position: relative;
        z-index: 2;
      }

      .cyber-glitch {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 48%, rgba(0, 255, 136, 0.1) 50%, transparent 52%);
        background-size: 10px 10px;
        animation: glitch 0.1s infinite;
        opacity: 0.1;
        pointer-events: none;
      }

      /* ===== 机械齿轮样式 ===== */
      .style-mechanical {
        background: linear-gradient(135deg, #3e2723 0%, #5d4037 100%);
        color: #d7ccc8;
      }

      .mechanical-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
      }

      .clock-face {
        position: relative;
        width: 120px;
        height: 120px;
        border: 3px solid #8d6e63;
        border-radius: 50%;
        background: #4e342e;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
      }

      .gear {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: center;
        transition: transform 0.5s ease-in-out;
      }

      .large-gear {
        width: 100px;
        height: 100px;
        margin: -50px 0 0 -50px;
      }

      .small-gear {
        width: 80px;
        height: 80px;
        margin: -40px 0 0 -40px;
      }

      .gear-teeth {
        width: 100%;
        height: 100%;
        background: conic-gradient(#8d6e63 0deg 30deg, transparent 30deg 60deg);
        border-radius: 50%;
        animation: rotateGear 60s linear infinite;
      }

      .hour-hand, .minute-hand {
        position: absolute;
        background: #d7ccc8;
        transform-origin: bottom center;
      }

      .hour-hand {
        width: 4px;
        height: 30px;
        top: 20px;
        left: 58px;
        border-radius: 2px;
      }

      .minute-hand {
        width: 3px;
        height: 40px;
        top: 10px;
        left: 58.5px;
        border-radius: 1.5px;
      }

      .center-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background: #d7ccc8;
        border-radius: 50%;
        margin: -4px 0 0 -4px;
        z-index: 3;
      }

      .mechanical-time {
        font-size: 1.5em;
        font-weight: 600;
        color: #d7ccc8;
        font-family: 'Courier New', monospace;
      }

      .mechanical-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        font-size: 0.9em;
        opacity: 0.8;
        text-align: center;
      }

      /* ===== 水墨书法样式 ===== */
      .style-ink {
        background: linear-gradient(135deg, #f5f5dc 0%, #e8e4d9 100%);
        color: #2c1810;
        font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
      }

      .ink-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
        position: relative;
      }

      .ink-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(44, 24, 16, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(44, 24, 16, 0.05) 0%, transparent 50%);
      }

      .ink-time {
        font-size: 4em;
        font-weight: 900;
        position: relative;
        z-index: 2;
      }

      .ink-hour, .ink-minute {
        display: inline-block;
        text-shadow: 2px 2px 4px rgba(44, 24, 16, 0.3);
      }

      .ink-colon {
        animation: blink 2s infinite;
        opacity: 0.8;
      }

      .ink-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 1em;
        opacity: 0.7;
        position: relative;
        z-index: 2;
      }

      .ink-splash {
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 60px;
        height: 40px;
        background: radial-gradient(ellipse, rgba(44, 24, 16, 0.2) 0%, transparent 70%);
        filter: blur(2px);
        z-index: 1;
      }

      /* ===== 全息投影样式 ===== */
      .style-hologram {
        background: #000;
        color: #00ffff;
      }

      .hologram-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
        position: relative;
      }

      .hologram-beam {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 20px;
        background: linear-gradient(0deg, #00ffff, transparent);
        filter: blur(10px);
        opacity: 0.5;
      }

      .hologram-time {
        font-size: 3.5em;
        font-weight: 700;
        color: #00ffff;
        text-shadow: 
          0 0 10px #00ffff,
          0 0 20px #00ffff;
        font-family: 'Arial', sans-serif;
        letter-spacing: 2px;
        position: relative;
        z-index: 2;
      }

      .hologram-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
        background-size: 30px 30px;
        opacity: 0.2;
      }

      .hologram-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 0.9em;
        color: #00ffff;
        text-shadow: 0 0 5px #00ffff;
        position: relative;
        z-index: 2;
      }

      .hologram-particles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.05) 0%, transparent 50%);
        animation: float 6s ease-in-out infinite;
      }

      /* ===== 极简线条样式 ===== */
      .style-minimal {
        background: #ffffff;
        color: #333;
      }

      .minimal-layout {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-lg);
        height: 100%;
      }

      .minimal-face {
        position: relative;
        width: 100px;
        height: 100px;
        border: 2px solid #333;
        border-radius: 50%;
      }

      .minimal-hour-hand, .minimal-minute-hand {
        position: absolute;
        background: #333;
        transform-origin: bottom center;
        transition: transform 0.5s cubic-bezier(0.4, 2.3, 0.8, 1);
      }

      .minimal-hour-hand {
        width: 3px;
        height: 30px;
        top: 20px;
        left: 48.5px;
      }

      .minimal-minute-hand {
        width: 2px;
        height: 40px;
        top: 10px;
        left: 49px;
      }

      .minimal-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: #333;
        border-radius: 50%;
        margin: -3px 0 0 -3px;
      }

      .minimal-time {
        font-size: 1.4em;
        font-weight: 300;
        letter-spacing: 1px;
        font-family: 'Arial', sans-serif;
      }

      .minimal-info {
        display: flex;
        gap: var(--cf-spacing-lg);
        font-size: 0.8em;
        opacity: 0.6;
        letter-spacing: 1px;
      }

      /* 动画定义 */
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(20px, 20px); }
      }

      @keyframes scanline {
        0% { top: 0; }
        100% { top: 100%; }
      }

      @keyframes glitch {
        0% { background-position: 0 0; }
        100% { background-position: 10px 10px; }
      }

      @keyframes rotateGear {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .liquid-time, .cyber-time, .hologram-time {
          font-size: 2.8em;
        }
        
        .ink-time {
          font-size: 3.2em;
        }
        
        .clock-face, .minimal-face {
          width: 80px;
          height: 80px;
        }
        
        .large-gear {
          width: 70px;
          height: 70px;
          margin: -35px 0 0 -35px;
        }
        
        .small-gear {
          width: 56px;
          height: 56px;
          margin: -28px 0 0 -28px;
        }
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;