// blocks/block-config.js - 扩展布局常量定义
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

// =========== 新增布局相关常量 ===========
// 布局模式
export const LAYOUT_MODES = ['flow', 'stack', 'grid-2', 'grid-3', 'grid-4'];

// 布局模式标签映射
export const LAYOUT_MODE_LABELS = {
  'flow': '横向流式',
  'stack': '纵向堆叠',
  'grid-2': '网格2列',
  'grid-3': '网格3列',
  'grid-4': '网格4列'
};

// 块样式
export const BLOCK_STYLES = ['compact', 'horizontal', 'vertical'];

// 块样式标签映射
export const BLOCK_STYLE_LABELS = {
  'compact': '紧凑样式',
  'horizontal': '水平样式',
  'vertical': '垂直样式'
};

// 对齐方式
export const ALIGN_MODES = ['left', 'center', 'right'];

// 对齐方式标签映射
export const ALIGN_MODE_LABELS = {
  'left': '左对齐',
  'center': '居中对齐',
  'right': '右对齐'
};

// 原始布局定义（保持向后兼容）
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