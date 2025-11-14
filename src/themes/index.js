// src/themes/index.js
export { autoTheme } from './auto-theme.js';
export { glassTheme } from './glass-theme.js';
export { gradientTheme } from './gradient-theme.js';
export { neonTheme } from './neon-theme.js';

// 导出所有主题作为一个集合
export const allThemes = [
  autoTheme,
  glassTheme,
  gradientTheme,
  neonTheme
];

// 导出主题配置信息
export const themeConfigs = [
  {
    id: 'auto',
    name: '跟随系统',
    description: '自动跟随Home Assistant系统主题',
    icon: '⚙️'
  },
  {
    id: 'glass', 
    name: '毛玻璃',
    description: '半透明毛玻璃效果',
    icon: '🔮'
  },
  {
    id: 'gradient',
    name: '随机渐变',
    description: '动态渐变背景',
    icon: '🌈'
  },
  {
    id: 'neon',
    name: '霓虹光影', 
    description: '霓虹灯效果',
    icon: '💫'
  }
];

// 根据主题ID获取主题配置
export const getThemeConfig = (themeId) => {
  return themeConfigs.find(theme => theme.id === themeId) || themeConfigs[0];
};

// 获取所有主题ID列表
export const getAllThemeIds = () => {
  return themeConfigs.map(theme => theme.id);
};
