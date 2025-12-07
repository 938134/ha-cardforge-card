// 块配置定义 - 添加布局常量
export const AREAS = {
  header: { id: 'header', label: '标题', icon: 'mdi:format-header-1', color: '#2196f3' },
  content: { id: 'content', label: '内容', icon: 'mdi:view-grid', color: '#4caf50' },
  footer: { id: 'footer', label: '页脚', icon: 'mdi:page-layout-footer', color: '#ff9800' }
};

// 实体类型图标映射
export const ENTITY_ICONS = {
  light: 'mdi:lightbulb',
  switch: 'mdi:power',
  sensor: 'mdi:gauge',
  binary_sensor: 'mdi:toggle-switch',
  climate: 'mdi:thermostat',
  cover: 'mdi:blinds',
  media_player: 'mdi:speaker',
  vacuum: 'mdi:robot-vacuum',
  text_sensor: 'mdi:text-box',
  person: 'mdi:account',
  device_tracker: 'mdi:account',
  sun: 'mdi:white-balance-sunny',
  weather: 'mdi:weather-partly-cloudy'
};

// 块布局类型定义
export const BLOCK_LAYOUTS = {
  horizontal: {
    id: 'horizontal',
    label: '水平布局',
    description: '图标 + 名称 + 状态值（水平排列）'
  },
  compact: {
    id: 'compact', 
    label: '紧凑网格',
    description: '图标在左，右上名称，右下状态值'
  },
  vertical: {
    id: 'vertical',
    label: '垂直布局',
    description: '图标在上，中间名称，底部状态值（垂直堆叠）'
  }
};