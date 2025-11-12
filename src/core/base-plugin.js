// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 必需实现的接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 可选覆盖的接口 ===
  getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  // === 系统数据工具 ===
  getSystemData(hass, config) {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      user: hass?.user?.name || '家人',
      greeting: this._getGreeting(now.getHours()),
      randomMessage: this._getRandomMessage()
    };
  }

  // === 控制方法 ===
  callService(hass, domain, service, data = {}) {
    if (!hass || !hass.callService) {
      console.error('Home Assistant 服务不可用');
      return false;
    }
    
    hass.callService(domain, service, data)
      .then(() => console.log(`服务调用成功: ${domain}.${service}`))
      .catch(error => console.error(`服务调用失败: ${domain}.${service}`, error));
    
    return true;
  }

  toggleEntity(hass, entityId) {
    const entity = hass.states[entityId];
    if (!entity) return false;
    
    const domain = entityId.split('.')[0];
    const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
    
    return this.callService(hass, domain, service, {
      entity_id: entityId
    });
  }

  // === 工具方法 ===
  _isEntityOn(entity) { return entity.state === 'on'; }
  _isEntityOff(entity) { return entity.state === 'off'; }
  _isEntityUnavailable(entity) { return entity.state === 'unavailable' || entity.state === 'unknown'; }
  _getEntityState(entities, key, defaultValue = '') { return entities[key]?.state || defaultValue; }
  _getEntityAttribute(entities, key, attribute, defaultValue = '') { return entities[key]?.attributes?.[attribute] || defaultValue; }
  
  _responsiveValue(desktop, mobile) { return `${desktop}; @media (max-width: 480px) { ${mobile}; }`; }
  _responsiveFontSize(desktopSize, mobileSize = desktopSize) { return this._responsiveValue(`font-size: ${desktopSize}`, `font-size: ${mobileSize}`); }
  _responsiveHeight(desktopHeight, mobileHeight = desktopHeight) { return this._responsiveValue(`height: ${desktopHeight}`, `height: ${mobileHeight}`); }
  _responsivePadding(desktopPadding, mobilePadding = desktopPadding) { return this._responsiveValue(`padding: ${desktopPadding}`, `padding: ${mobilePadding}`); }
  
  _flexCenter() { return 'display: flex; align-items: center; justify-content: center;'; }
  _textCenter() { return 'text-align: center;'; }
  _flexColumn() { return 'display: flex; flex-direction: column;'; }
  
  _getGreeting(hour) {
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }
  
  _getRandomMessage() {
    return ''; // 返回空字符串，不显示随机消息
  }

  // === 样式系统 ===
  getBaseStyles(config) {
    const themeConfig = { ...this.getThemeConfig(), ...config.themeConfig };
    return `
      :host {
        --rgb-primary-background-color: var(--card-background-color, 255, 255, 255);
        --rgb-primary-text-color: var(--primary-text-color, 0, 0, 0);
      }
      
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        border-radius: var(--ha-card-border-radius, 12px);
        ${this._getThemeStyles(themeConfig, config.theme)}
        cursor: default;
        overflow: hidden;
      }
      ${this._getResponsiveStyles()}
      ${this._getAnimationStyles()}
      
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all 0.2s ease; 
      }
      .cardforge-interactive:hover { opacity: 0.8; }
      .cardforge-interactive:active { transform: scale(0.98); }
      
      .cardforge-status-on { color: var(--success-color); }
      .cardforge-status-off { color: var(--disabled-color); }
      .cardforge-status-unavailable { color: var(--error-color); opacity: 0.5; }
    `;
  }
  
  _getThemeStyles(themeConfig, themeId = 'auto') {
    // 根据 themeId 和 themeConfig 生成样式
    if (!themeConfig.useGradient) {
      return this._getSolidTheme(themeId);
    }
    
    return this._getGradientTheme(themeConfig, themeId);
  }
  
  _getSolidTheme(themeId) {
    const themes = {
      'auto': `
        background: var(--card-background-color); 
        color: var(--primary-text-color);
      `,
      'glass': `
        position: relative;
        background: linear-gradient(135deg, 
          rgba(var(--rgb-primary-background-color), 0.25) 0%, 
          rgba(var(--rgb-primary-background-color), 0.15) 50%,
          rgba(var(--rgb-primary-background-color), 0.1) 100%);
        backdrop-filter: blur(25px) saturate(180%);
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        border: 1px solid rgba(var(--rgb-primary-text-color), 0.15);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        color: var(--primary-text-color);
      `,
      'gradient': this._getRandomGradient(),
      'neon': `
        background: #1a1a1a;
        color: #00ff88;
        border: 1px solid #00ff88;
        box-shadow: 
          0 0 15px rgba(0, 255, 136, 0.4),
          inset 0 0 20px rgba(0, 255, 136, 0.1);
      `
    };
    
    return themes[themeId] || themes.auto;
  }
  
  _getRandomGradient() {
    // 预定义一些漂亮的渐变组合
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
    ];
    
    // 基于时间选择渐变，确保同一卡片每次渲染使用相同的渐变
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes(); // 每分钟变化一次
    const gradientIndex = seed % gradients.length;
    
    return `
      background: ${gradients[gradientIndex]};
      background-size: 200% 200%;
      animation: gradientShift 8s ease infinite;
      color: white;
    `;
  }
  
  _getGradientTheme(themeConfig, themeId) {
    const gradientColors = {
      'auto': ['var(--primary-color)', 'var(--accent-color)'],
      'glass': this._getGlassGradientColors(),
      'gradient': this._getRandomGradientColors(),
      'neon': ['#00ff88', '#00cc66']
    };
    
    const colors = gradientColors[themeId] || gradientColors.auto;
    
    const gradientMap = {
      'diagonal': `linear-gradient(135deg, ${colors.join(', ')})`,
      'horizontal': `linear-gradient(90deg, ${colors.join(', ')})`,
      'vertical': `linear-gradient(180deg, ${colors.join(', ')})`,
      'radial': `radial-gradient(circle, ${colors.join(', ')})`
    };
    
    const gradient = gradientMap[themeConfig.gradientType] || gradientMap.diagonal;
    
    if (themeId === 'gradient') {
      return `
        background: ${gradient};
        background-size: 200% 200%;
        animation: gradientShift 6s ease infinite;
        color: white;
      `;
    }
    
    if (themeId === 'glass') {
      return `
        ${this._getSolidTheme('glass')}
        background: ${gradient}, ${this._getSolidTheme('glass').split('background:')[1].split(';')[0]};
        background-blend-mode: overlay, normal;
      `;
    }
    
    return `background: ${gradient}; color: white;`;
  }
  
  _getGlassGradientColors() {
    return [
      'rgba(var(--rgb-primary-background-color), 0.25)',
      'rgba(var(--rgb-primary-background-color), 0.15)'
    ];
  }
  
  _getRandomGradientColors() {
    const colorPairs = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140']
    ];
    
    const now = new Date();
    const seed = now.getHours() * 60 + now.getMinutes();
    const colorIndex = seed % colorPairs.length;
    
    return colorPairs[colorIndex];
  }

  _getAnimationStyles() {
    return `
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
    `;
  }
  
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card { border-radius: var(--ha-card-border-radius, 8px); }
      }
    `;
  }
}