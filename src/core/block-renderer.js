// src/core/block-renderer.js

// 根据实体域获取默认图标
const getDefaultIcon = (entityId) => {
  if (!entityId) return 'mdi:cube';
  const domain = entityId.split('.')[0];
  const iconMap = {
    light: 'mdi:lightbulb',
    switch: 'mdi:power',
    sensor: 'mdi:gauge',
    binary_sensor: 'mdi:toggle-switch',
    climate: 'mdi:thermostat',
    cover: 'mdi:blinds',
    media_player: 'mdi:speaker',
    vacuum: 'mdi:robot-vacuum',
    person: 'mdi:account',
    device_tracker: 'mdi:account',
    sun: 'mdi:white-balance-sunny',
    weather: 'mdi:weather-partly-cloudy'
  };
  return iconMap[domain] || 'mdi:cube';
};

// 安全HTML编码
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// 获取块的显示名称
const getBlockName = (block, hass) => {
  // 优先使用自定义名称
  if (block.name) return block.name;
  
  // 如果有实体，使用实体的友好名称
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    return entity.attributes?.friendly_name || block.entity;
  }
  
  // 默认名称
  return block.entity ? '实体块' : '自定义块';
};

// 获取块的显示值
const getBlockValue = (block, hass) => {
  // 优先使用自定义值
  if (block.value !== undefined) return block.value;
  
  // 如果有实体，使用实体的状态值
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    return unit ? `${state} ${unit}` : state;
  }
  
  // 默认值
  return block.content || '';
};

// 获取块的图标
const getBlockIcon = (block, hass) => {
  // 优先使用自定义图标
  if (block.icon) return block.icon;
  
  // 如果有实体，使用实体的图标
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    return entity.attributes?.icon || getDefaultIcon(block.entity);
  }
  
  // 默认图标
  return getDefaultIcon(block.entity);
};

// 渲染单个块
export const renderBlock = (block, hass) => {
  const icon = getBlockIcon(block, hass);
  const name = getBlockName(block, hass);
  const value = getBlockValue(block, hass);
  
  // 构建样式字符串
  const style = block.style ? Object.entries(block.style)
    .map(([key, val]) => `${key}: ${val}`)
    .join(';') : '';
  
  return `
    <div class="cardforge-block"${style ? ` style="${style}"` : ''}>
      ${icon ? `<div class="block-icon"><ha-icon icon="${icon}"></ha-icon></div>` : ''}
      <div class="block-content">
        <div class="block-name">${escapeHtml(name)}</div>
        <div class="block-value">${escapeHtml(value)}</div>
      </div>
    </div>
  `;
};

// 批量渲染多个块
export const renderBlocks = (blocks, hass) => {
  if (!blocks || Object.keys(blocks).length === 0) return '';
  
  return Object.entries(blocks)
    .map(([id, block]) => renderBlock(block, hass))
    .join('');
};