// cardforge.js - 主入口文件
import './core/base-card.js';
import './core/card-system.js';
import './core/theme-system.js';
import './components/ha-cardforge-card.js';
import './components/card-editor.js';

// 自动注册卡片类
import './cards/clock-card.js';
import './cards/week-card.js';
import './cards/welcome-card.js';
import './cards/poetry-card.js';
import './cards/dashboard-card.js';

console.log('CardForge 初始化完成');
