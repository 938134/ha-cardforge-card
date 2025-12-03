// src/core/block-renderer.js
import { BlockBase } from './block-base.js';

/**
 * 根据实体域获取默认图标
 */
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
    weather: 'mdi:weather-partly-cloudy',
    text_sensor: 'mdi:text-box'
  };
  return iconMap[domain] || 'mdi:cube';
};

/**
 * 安全HTML编码
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * 获取块的显示名称
 */
const getBlockName = (block, hass) => {
  if (block.name) return block.name;
  
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    return entity.attributes?.friendly_name || block.entity;
  }
  
  return block.entity ? '实体块' : '自定义块';
};

/**
 * 获取块的显示值
 */
const getBlockValue = (block, hass) => {
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    return unit ? `${state} ${unit}` : state;
  }
  
  return '';
};

/**
 * 获取块的图标
 */
const getBlockIcon = (block, hass) => {
  if (block.icon) return block.icon;
  
  if (block.entity && hass?.states?.[block.entity]) {
    const entity = hass.states[block.entity];
    return entity.attributes?.icon || getDefaultIcon(block.entity);
  }
  
  return getDefaultIcon(block.entity);
};

/**
 * 获取实体信息
 */
const getEntityInfo = (entityId, hass) => {
  if (!entityId || !hass?.states?.[entityId]) return null;
  
  const entity = hass.states[entityId];
  return {
    state: entity.state,
    unit: entity.attributes?.unit_of_measurement || '',
    friendly_name: entity.attributes?.friendly_name || entityId,
    icon: entity.attributes?.icon || getDefaultIcon(entityId)
  };
};

/**
 * 渲染单个块（使用BlockBase组件）
 */
export const renderBlock = (block, hass) => {
  // 创建BlockBase元素
  return `
    <block-base 
      .block=${JSON.stringify(block)}
      .hass=${hass ? JSON.stringify(hass) : '{}'}
      .showName=${true}
      .showValue=${true}
    ></block-base>
  `;
};

/**
 * 批量渲染多个块
 */
export const renderBlocks = (blocks, hass) => {
  if (!blocks || Object.keys(blocks).length === 0) return '';
  
  return Object.entries(blocks)
    .map(([id, block]) => renderBlock({ id, ...block }, hass))
    .join('');
};

/**
 * 按区域渲染块
 */
export const renderBlocksByArea = (blocks, hass, areas = []) => {
  if (!blocks || Object.keys(blocks).length === 0) return '';
  
  const areaIds = areas.map(area => area.id);
  if (!areaIds.includes('content')) {
    areaIds.push('content');
  }
  
  const blocksByArea = {};
  areaIds.forEach(areaId => {
    blocksByArea[areaId] = [];
  });
  
  // 按区域分组
  Object.entries(blocks).forEach(([id, block]) => {
    const area = block.area || 'content';
    if (!blocksByArea[area]) {
      blocksByArea[area] = [];
    }
    blocksByArea[area].push([id, block]);
  });
  
  // 渲染每个区域
  let html = '';
  areaIds.forEach(areaId => {
    const areaBlocks = blocksByArea[areaId];
    if (areaBlocks && areaBlocks.length > 0) {
      const areaDef = areas.find(a => a.id === areaId);
      const areaLabel = areaDef?.label || areaId;
      
      html += `<div class="card-area area-${areaId}">`;
      
      if (areaIds.length > 1 && areaLabel && areaId !== 'content') {
        html += `<div class="area-header"><span class="area-title">${escapeHtml(areaLabel)}</span></div>`;
      }
      
      html += areaBlocks.map(([id, block]) => renderBlock({ id, ...block }, hass)).join('');
      html += '</div>';
    }
  });
  
  return html;
};

export {
  getDefaultIcon,
  getBlockName,
  getBlockValue,
  getBlockIcon,
  getEntityInfo,
  escapeHtml
};
