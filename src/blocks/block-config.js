// 块配置定义
export const AREAS = {
  header: { id: 'header', label: '标题区域', maxBlocks: 5 },
  content: { id: 'content', label: '内容区域', maxBlocks: 20 },
  footer: { id: 'footer', label: '页脚区域', maxBlocks: 5 }
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
