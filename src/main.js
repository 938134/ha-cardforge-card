// ha-cardforge-card/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

// 注册内置插件到全局对象
window.builtinPlugins = {};

// 动态加载内置插件
const loadBuiltinPlugins = async () => {
  try {
    console.log('🔧 加载内置插件...');
    
    // 时间星期插件
    window.builtinPlugins['time-week'] = {
      getTemplate: (config, entities) => {
        const time = entities.time?.state || '00:00';
        const date = entities.date?.state || '2000-01-01';
        const week = entities.week?.state || '星期一';
        const [hour, minute] = time.split(':');
        const [, month, day] = date.split('-');

        return `
          <div class="cardforge-card time-week">
            <div class="hour">${hour}</div>
            <div class="minute">${minute}</div>
            <div class="date">${month}/${day}日</div>
            <div class="week">${week}</div>
          </div>
        `;
      },
      getStyles: (config) => `
        .time-week {
          padding: 20px;
          text-align: center;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .time-week .hour,
        .time-week .minute {
          font-size: 3em;
          font-weight: bold;
          line-height: 1;
        }
        .time-week .date {
          margin-top: 10px;
          font-size: 1.1em;
          color: var(--primary-color);
        }
        .time-week .week {
          background: var(--primary-color);
          color: white;
          border-radius: 10px;
          padding: 4px 12px;
          display: inline-block;
          margin-top: 8px;
          font-size: 0.9em;
        }
      `
    };

    // 时间卡片插件
    window.builtinPlugins['time-card'] = {
      getTemplate: (config, entities) => {
        const time = entities.time?.state || '00:00';
        const date = entities.date?.state || '2000-01-01';
        const week = entities.week?.state || '星期一';
        const [hour, minute] = time.split(':');
        const [, month, day] = date.split('-');

        return `
          <div class="cardforge-card time-card">
            <div class="time-section">
              <div class="label">时</div>
              <div class="value hour">${hour}</div>
            </div>
            <div class="date-section">
              <div class="month">${month}月</div>
              <div class="day">${day}</div>
              <div class="week">${week}</div>
            </div>
            <div class="time-section">
              <div class="label">分</div>
              <div class="value minute">${minute}</div>
            </div>
          </div>
        `;
      },
      getStyles: (config) => `
        .time-card {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          align-items: center;
          height: 120px;
        }
        .time-section {
          text-align: center;
        }
        .time-section .label {
          font-size: 0.8em;
          opacity: 0.7;
        }
        .time-section .value {
          font-size: 2em;
          font-weight: bold;
          color: rgba(var(--rgb-primary-text-color), 0.7);
        }
        .date-section {
          text-align: center;
        }
        .date-section .month {
          font-size: 0.8em;
          opacity: 0.7;
        }
        .date-section .day {
          font-size: 2.8em;
          font-weight: bold;
          line-height: 1;
        }
        .date-section .week {
          font-size: 0.8em;
          opacity: 0.7;
        }
      `
    };

    // 天气卡片插件
    window.builtinPlugins['weather'] = {
      getTemplate: (config, entities) => {
        const weather = entities.weather;
        const temp = weather?.attributes?.temperature || '--';
        const condition = weather?.state || '未知';
        const humidity = weather?.attributes?.humidity || '--';

        return `
          <div class="cardforge-card weather">
            <div class="icon">${getWeatherIcon(condition)}</div>
            <div class="temp">${temp}°</div>
            <div class="condition">${condition}</div>
            <div class="humidity">湿度: ${humidity}%</div>
          </div>
        `;
        
        function getWeatherIcon(condition) {
          const icons = {
            'sunny': '☀️',
            'clear': '☀️',
            'partlycloudy': '⛅',
            'cloudy': '☁️',
            'rainy': '🌧️',
            'snowy': '❄️',
            'windy': '💨',
            'fog': '🌫️'
          };
          return icons[condition] || '🌤️';
        }
      },
      getStyles: (config) => `
        .weather {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: center;
          height: 120px;
        }
        .weather .icon {
          font-size: 3em;
          text-align: center;
        }
        .weather .temp {
          font-size: 2.5em;
          font-weight: bold;
        }
        .weather .condition {
          grid-column: 1 / -1;
          text-align: center;
          opacity: 0.8;
        }
        .weather .humidity {
          grid-column: 1 / -1;
          text-align: center;
          font-size: 0.9em;
          opacity: 0.7;
        }
      `
    };

    // 时钟农历插件
    window.builtinPlugins['clock-lunar'] = {
      getTemplate: (config, entities) => {
        const time = entities.time?.state || '00:00';
        const date = entities.date?.state || '2000-01-01';
        const lunar = entities.lunar;
        
        const lunarYear = lunar?.attributes?.lunar?.年干支 || '';
        const lunarDate = lunar?.state || '';
        const lunarWeek = lunar?.attributes?.lunar?.星期 || '星期一';
        const solarTerm = lunar?.attributes?.lunar?.节气?.节气差 || '';
        
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();

        // 生成模拟时钟
        const clockSvg = generateClockSVG();

        return `
          <div class="cardforge-card clock-lunar">
            <div class="clock-section">
              ${clockSvg}
            </div>
            <div class="info-section">
              <div class="time-text">${time.split(':').slice(0, 2).join(':')}</div>
              <div class="date-text">${month}月${day}号 ${lunarWeek}</div>
              <div class="lunar-text">${lunarYear} ${lunarDate}</div>
              <div class="solar-term">${solarTerm}</div>
            </div>
          </div>
        `;
        
        function generateClockSVG() {
          const now = new Date();
          const hours = now.getHours() % 12;
          const minutes = now.getMinutes();
          const seconds = now.getSeconds();
          
          const hourAngle = (hours * 30) + (minutes * 0.5);
          const minuteAngle = minutes * 6;
          const secondAngle = seconds * 6;

          return `
            <svg class="clock" viewBox="0 0 100 100">
              <!-- 表盘 -->
              <circle cx="50" cy="50" r="45" fill="var(--card-background-color)" 
                      stroke="var(--primary-text-color)" stroke-width="2"/>
              
              <!-- 时刻度 -->
              ${Array.from({length: 12}, (_, i) => {
                const angle = i * 30;
                const rad = angle * Math.PI / 180;
                const x1 = 50 + 35 * Math.sin(rad);
                const y1 = 50 - 35 * Math.cos(rad);
                const x2 = 50 + 40 * Math.sin(rad);
                const y2 = 50 - 40 * Math.cos(rad);
                return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                             stroke="var(--primary-text-color)" stroke-width="2"/>`;
              }).join('')}
              
              <!-- 时针 -->
              <line class="hour-hand" x1="50" y1="50" 
                    x2="${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}" 
                    y2="${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}" 
                    stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round"/>
              
              <!-- 分针 -->
              <line class="minute-hand" x1="50" y1="50" 
                    x2="${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}" 
                    y2="${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}" 
                    stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
              
              <!-- 秒针 -->
              <line class="second-hand" x1="50" y1="50" 
                    x2="${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}" 
                    y2="${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}" 
                    stroke="var(--accent-color)" stroke-width="1" stroke-linecap="round"/>
              
              <!-- 中心点 -->
              <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
            </svg>
          `;
        }
      },
      getStyles: (config) => `
        .clock-lunar {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: center;
          height: 250px;
        }
        
        .clock-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .clock {
          width: 100px;
          height: 100px;
        }
        
        .hour-hand {
          transition: transform 0.3s ease;
        }
        
        .minute-hand {
          transition: transform 0.3s ease;
        }
        
        .second-hand {
          transition: transform 0.1s ease;
        }
        
        .info-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }
        
        .time-text {
          font-size: 2.5em;
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        .date-text {
          font-size: 1em;
          font-weight: bold;
          opacity: 0.9;
        }
        
        .lunar-text {
          font-size: 1em;
          font-weight: bold;
          opacity: 0.8;
        }
        
        .solar-term {
          font-size: 1em;
          font-weight: bold;
          background: coral;
          color: white;
          border-radius: 1em;
          padding: 4px 12px;
          text-align: center;
          letter-spacing: 1px;
        }
        
        @media (max-width: 480px) {
          .clock-lunar {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
            height: 300px;
          }
          
          .time-text {
            font-size: 2em;
          }
        }
      `
    };

    // 欢迎卡片插件
    window.builtinPlugins['welcome'] = {
      getTemplate: (config, entities) => {
        const userName = getUserName();
        const currentTime = getFormattedTime();
        const greeting = getGreeting();

        return `
          <div class="cardforge-card welcome">
            <div class="welcome-content">
              <div class="greeting">${greeting}，${userName}！</div>
              <div class="time">${currentTime}</div>
              <div class="message">${getMessage()}</div>
            </div>
            <div class="decoration">
              <div class="decoration-circle circle-1"></div>
              <div class="decoration-circle circle-2"></div>
              <div class="decoration-circle circle-3"></div>
            </div>
          </div>
        `;
        
        function getUserName() {
          return '家人';
        }

        function getFormattedTime() {
          const now = new Date();
          return now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }

        function getGreeting() {
          const hour = new Date().getHours();
          if (hour < 6) return '深夜好';
          if (hour < 9) return '早上好';
          if (hour < 12) return '上午好';
          if (hour < 14) return '中午好';
          if (hour < 18) return '下午好';
          if (hour < 22) return '晚上好';
          return '夜深了';
        }

        function getMessage() {
          const messages = [
            '祝您今天愉快！',
            '一切准备就绪！',
            '家，因你而温暖',
            '美好的一天开始了',
            '放松心情，享受生活'
          ];
          return messages[Math.floor(Math.random() * messages.length)];
        }
      },
      getStyles: (config) => `
        .welcome {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .welcome-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 20px;
        }
        
        .greeting {
          font-size: 1.3em;
          font-weight: 500;
          margin-bottom: 8px;
          opacity: 0.95;
        }
        
        .time {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        
        .message {
          font-size: 0.9em;
          opacity: 0.8;
          font-style: italic;
        }
        
        .decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }
        
        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .circle-1 {
          width: 80px;
          height: 80px;
          top: -20px;
          right: -20px;
        }
        
        .circle-2 {
          width: 60px;
          height: 60px;
          bottom: -10px;
          left: 20px;
        }
        
        .circle-3 {
          width: 40px;
          height: 40px;
          bottom: 30px;
          right: 40px;
        }
        
        /* 动画效果 */
        .welcome:hover .circle-1 {
          animation: float 3s ease-in-out infinite;
        }
        
        .welcome:hover .circle-2 {
          animation: float 3s ease-in-out infinite 0.5s;
        }
        
        .welcome:hover .circle-3 {
          animation: float 3s ease-in-out infinite 1s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        /* 响应式设计 */
        @media (max-width: 480px) {
          .welcome {
            height: 120px;
          }
          
          .greeting {
            font-size: 1.1em;
          }
          
          .time {
            font-size: 2em;
          }
          
          .message {
            font-size: 0.8em;
          }
        }
        
        /* 深色主题适配 */
        .cardforge-card[data-theme="dark"] .welcome {
          background: linear-gradient(135deg, #bb86fc, #03dac6);
        }
        
        /* 材质主题适配 */
        .cardforge-card[data-theme="material"] .welcome {
          background: linear-gradient(135deg, #6200ee, #03dac6);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `
    };

    console.log('✅ 内置插件加载完成');
  } catch (error) {
    console.error('❌ 加载内置插件失败:', error);
  }
};

// 注册组件
customElements.define('ha-cardforge-card', HaCardForgeCard);
customElements.define('ha-cardforge-editor', HaCardForgeEditor);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件市场的卡片系统',
    preview: true
  });
}

// 初始化内置插件
loadBuiltinPlugins();

console.log('🎉 卡片工坊插件市场初始化完成');