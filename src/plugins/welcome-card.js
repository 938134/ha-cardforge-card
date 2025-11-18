// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '个性化欢迎卡片，多种风格可选',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['简约现代', '温馨家居', '商务办公', '创意艺术', '科技未来', '自然清新'],
        default: '简约现代'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放', '弹跳'],
        default: '淡入'
      },
      text_alignment: {
        type: 'select',
        label: '文本对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      show_decoration: {
        type: 'boolean',
        label: '显示装饰元素',
        default: true
      }
    },
    
    entity_requirements: {
      welcome_message: {
        name: '欢迎消息',
        description: '自定义欢迎消息，可输入文本或实体ID',
        type: 'text', 
        required: false,
        default: '',
        example: 'sensor.daily_quote 或 直接输入文本'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const userName = this._getUserName(hass);
    const welcomeMessage = this._getWelcomeMessage(hass, entities);
    const cardStyle = config.card_style || '简约现代';
    const alignment = config.text_alignment || '居中';
    
    return `
      <div class="cardforge-responsive-container welcome-card style-${this._getStyleClass(cardStyle)} animation-${config.animation_style || '淡入'} alignment-${this._getAlignmentClass(alignment)} ${config.show_decoration ? 'with-decoration' : ''}">
        <div class="welcome-content">
          ${config.show_decoration ? this._renderDecoration(cardStyle) : ''}
          <div class="welcome-text">
            <h2 class="greeting">${this._getTimeBasedGreeting()}，${userName}</h2>
            <p class="message">${welcomeMessage}</p>
          </div>
        </div>
      </div>
    `;
  }

  _getWelcomeMessage(hass, entities) {
    const welcomeMessage = this._getCardValue(hass, entities, 'welcome_message', '');
    
    // 如果配置了实体，尝试获取实体状态
    if (welcomeMessage.includes('.') && hass?.states?.[welcomeMessage]) {
      const entity = hass.states[welcomeMessage];
      return entity.state || this._getDefaultWelcomeMessage();
    }
    
    // 如果为空，使用默认问候语
    if (!welcomeMessage) {
      return this._getDefaultWelcomeMessage();
    }
    
    return welcomeMessage;
  }

  _getDefaultWelcomeMessage() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '今天也是充满活力的一天！';
    } else if (hour >= 12 && hour < 14) {
      return '午餐时间到，记得按时吃饭';
    } else if (hour >= 14 && hour < 18) {
      return '下午工作加油！';
    } else if (hour >= 18 && hour < 22) {
      return '晚上放松一下';
    } else {
      return '夜深了，注意休息';
    }
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '简约现代': 'modern',
      '温馨家居': 'cozy', 
      '商务办公': 'business',
      '创意艺术': 'creative',
      '科技未来': 'tech',
      '自然清新': 'nature'
    };
    return styleMap[styleName] || 'modern';
  }

  _getAlignmentClass(alignment) {
    const alignmentMap = {
      '左对齐': 'left',
      '居中': 'center', 
      '右对齐': 'right'
    };
    return alignmentMap[alignment] || 'center';
  }

  _renderDecoration(style) {
    const decorations = {
      'modern': `
        <div class="decoration modern-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
        </div>
      `,
      'cozy': `
        <div class="decoration cozy-hearts">
          <div class="heart heart-1">❤</div>
          <div class="heart heart-2">💛</div>
          <div class="heart heart-3">💙</div>
        </div>
      `,
      'business': `
        <div class="decoration business-lines">
          <div class="line line-1"></div>
          <div class="line line-2"></div>
          <div class="line line-3"></div>
        </div>
      `,
      'creative': `
        <div class="decoration creative-shapes">
          <div class="shape shape-1">✦</div>
          <div class="shape shape-2">❖</div>
          <div class="shape shape-3">◈</div>
        </div>
      `,
      'tech': `
        <div class="decoration tech-grid">
          <div class="grid-line"></div>
          <div class="grid-dot grid-dot-1"></div>
          <div class="grid-dot grid-dot-2"></div>
        </div>
      `,
      'nature': `
        <div class="decoration nature-leaves">
          <div class="leaf leaf-1">🍃</div>
          <div class="leaf leaf-2">🌿</div>
          <div class="leaf leaf-3">🍀</div>
        </div>
      `
    };
    
    return decorations[this._getStyleClass(style)] || '';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '简约现代';
    const alignment = config.text_alignment || '居中';
    
    return `
      ${this.getBaseStyles(config)}
      .welcome-card {
        padding: var(--cf-spacing-xl);
        min-height: 180px;
        position: relative;
        overflow: hidden;
      }
      
      .welcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        position: relative;
        z-index: 2;
      }
      
      .alignment-left .welcome-content {
        align-items: flex-start;
        text-align: left;
      }
      
      .alignment-right .welcome-content {
        align-items: flex-end;
        text-align: right;
      }
      
      .greeting {
        margin: 0;
        color: var(--cf-text-primary);
        font-size: 1.8em;
        font-weight: 600;
        line-height: 1.2;
      }
      
      .message {
        margin: var(--cf-spacing-md) 0 0 0;
        color: var(--cf-text-secondary);
        font-size: 1.2em;
        line-height: 1.4;
        max-width: 400px;
      }
      
      /* 装饰元素 */
      .decoration {
        position: absolute;
        z-index: 1;
        pointer-events: none;
      }
      
      /* 简约现代风格 */
      .style-modern {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .style-modern .greeting {
        color: white;
      }
      .style-modern .message {
        color: rgba(255, 255, 255, 0.9);
      }
      .modern-dots {
        top: 20px;
        right: 20px;
      }
      .modern-dots .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        margin-bottom: 6px;
      }
      
      /* 温馨家居风格 */
      .style-cozy {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        border: 2px solid #ffb7c5;
      }
      .cozy-hearts {
        top: 15px;
        left: 15px;
      }
      .cozy-hearts .heart {
        font-size: 1.2em;
        margin-bottom: 4px;
        opacity: 0.6;
        animation: float 3s ease-in-out infinite;
      }
      .cozy-hearts .heart-2 { animation-delay: 1s; }
      .cozy-hearts .heart-3 { animation-delay: 2s; }
      
      /* 商务办公风格 */
      .style-business {
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        color: white;
        border-left: 4px solid #e74c3c;
      }
      .style-business .greeting {
        color: white;
      }
      .style-business .message {
        color: rgba(255, 255, 255, 0.9);
      }
      .business-lines {
        bottom: 0;
        left: 0;
        right: 0;
      }
      .business-lines .line {
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
        margin-bottom: 8px;
      }
      
      /* 创意艺术风格 */
      .style-creative {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
        color: white;
      }
      .style-creative .greeting {
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      .style-creative .message {
        color: rgba(255, 255, 255, 0.95);
      }
      .creative-shapes {
        bottom: 15px;
        right: 15px;
      }
      .creative-shapes .shape {
        font-size: 1.5em;
        opacity: 0.4;
        margin-bottom: 5px;
      }
      
      /* 科技未来风格 */
      .style-tech {
        background: #0a0a0a;
        color: #00ff88;
        border: 1px solid #00ff88;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
      }
      .style-tech .greeting {
        color: #00ff88;
        text-shadow: 0 0 10px #00ff88;
      }
      .style-tech .message {
        color: #00ff88;
        opacity: 0.8;
      }
      .tech-grid {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }
      .tech-grid .grid-dot {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
      }
      .grid-dot-1 { top: 30px; left: 30px; }
      .grid-dot-2 { bottom: 30px; right: 30px; }
      
      /* 自然清新风格 */
      .style-nature {
        background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
        border: 2px solid #81c784;
      }
      .nature-leaves {
        top: 10px;
        right: 10px;
      }
      .nature-leaves .leaf {
        font-size: 1.3em;
        opacity: 0.5;
        margin-bottom: 3px;
        animation: sway 4s ease-in-out infinite;
      }
      .nature-leaves .leaf-2 { animation-delay: 1s; }
      .nature-leaves .leaf-3 { animation-delay: 2s; }
      
      /* 动画效果 */
      .animation-淡入 .welcome-content {
        animation: fadeIn 0.8s ease-in;
      }
      .animation-滑动 .welcome-content {
        animation: slideIn 0.6s ease-out;
      }
      .animation-缩放 .welcome-content {
        animation: scaleIn 0.5s ease-out;
      }
      .animation-弹跳 .welcome-content {
        animation: bounceIn 0.8s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.3); }
        50% { opacity: 1; transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes sway {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
      }

      /* 响应式设计 */
      @media (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          min-height: 160px;
        }
        .greeting {
          font-size: 1.5em;
        }
        .message {
          font-size: 1em;
          margin-top: var(--cf-spacing-sm);
        }
        .decoration {
          display: ${config.show_decoration ? 'block' : 'none'};
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;