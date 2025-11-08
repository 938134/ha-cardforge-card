import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export default {
  name: 'welcome',
  displayName: '欢迎卡片',
  icon: '👋',
  description: '简洁的欢迎信息卡片',
  category: 'info',
  version: '1.0.0',
  
  requiresEntities: false,
  
  cardSize: 2,
  
  render: function(config, hass) {
    const userName = hass?.user?.name || '用户';
    const currentTime = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return html`
      <div class="welcome-card" style="
        padding: 24px;
        text-align: center;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        border-radius: 16px;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      ">
        <div style="font-size: 1.2em; margin-bottom: 8px; opacity: 0.9;">
          你好，${userName}！
        </div>
        <div style="font-size: 2em; font-weight: bold; margin-bottom: 8px;">
          ${currentTime}
        </div>
        <div style="font-size: 0.9em; opacity: 0.8;">
          祝你今天愉快
        </div>
      </div>
    `;
  },
  
  preview: function() {
    return html`
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, #2196F3, #E91E63);
        color: white;
        border-radius: 12px;
        text-align: center;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div style="font-size: 1.5em; margin-bottom: 8px;">👋</div>
        <div style="font-weight: bold;">欢迎卡片</div>
        <div style="font-size: 0.8em; opacity: 0.9;">个性化欢迎信息</div>
      </div>
    `;
  }
};