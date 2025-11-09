// src/core/plugin-registry.js
// 注意：这里使用相对路径导入，确保构建时能正确解析
import SimpleClock from '../plugins/simple-clock.js';
import TimeCard from '../plugins/time-card.js';
import WelcomeCard from '../plugins/welcome-card.js';

// 插件类映射
export const PLUGIN_REGISTRY = {
  'simple-clock': SimpleClock,
  'time-card': TimeCard, 
  'welcome-card': WelcomeCard
};

// 插件信息列表（用于编辑器显示）
export const PLUGIN_INFO = [
  {
    id: 'simple-clock',
    name: '简约时钟',
    description: '基于系统时间的简约时钟',
    icon: '⏰',
    category: 'time'
  },
  {
    id: 'time-card',
    name: '时间卡片', 
    description: '水平布局的时间日期卡片',
    icon: '🕒',
    category: 'time',
    entityRequirements: [
      { key: 'time', description: '时间实体' },
      { key: 'date', description: '日期实体' },
      { key: 'week', description: '星期实体' }
    ]
  },
  {
    id: 'welcome-card',
    name: '欢迎卡片',
    description: '个性化欢迎信息', 
    icon: '👋',
    category: 'info'
  }
];