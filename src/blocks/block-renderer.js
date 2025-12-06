// 块渲染器 - 支持15种组合
import { AREAS, ENTITY_ICONS } from './block-config.js';

// HTML安全编码
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// 获取默认图标
const getDefaultIcon = (entityId) => {
  if (!entityId) return 'mdi:cube';
  const domain = entityId.split('.')[0];
  return ENTITY_ICONS[domain] || 'mdi:cube';
};

// 渲染单个块（支持15种组合）
export const renderBlock = (block, hass, options = {}) => {
  const area = block.area || 'content';
  const layout = options.layout || 'horizontal'; // 紧凑、水平、垂直三种样式
  
  // 获取块数据
  const name = block.name || (block.entity && hass?.states?.[block.entity]?.attributes?.friendly_name) || '';
  const entity = block.entity ? hass?.states?.[block.entity] : null;
  const value = entity ? entity.state : '';
  const unit = entity?.attributes?.unit_of_measurement || '';
  const icon = block.icon || (block.entity ? getDefaultIcon(block.entity) : 'mdi:cube-outline');
  
  // 根据不同布局生成不同HTML
  let blockHtml = '';
  
  switch (layout) {
    case 'compact':
      // 紧凑样式：图标在左，名称在上，值在下
      blockHtml = `
        <div class="cardforge-block layout-compact area-${area}">
          <div class="block-icon">
            <ha-icon icon="${icon}"></ha-icon>
          </div>
          <div class="block-content">
            <div class="block-name">${escapeHtml(name)}</div>
            <div class="block-value">${escapeHtml(value)}${unit ? ' ' + unit : ''}</div>
          </div>
        </div>
      `;
      break;
      
    case 'vertical':
      // 垂直样式：图标在上，名称在中，值在下
      blockHtml = `
        <div class="cardforge-block layout-vertical area-${area}">
          <div class="block-icon">
            <ha-icon icon="${icon}"></ha-icon>
          </div>
          <div class="block-content">
            <div class="block-name">${escapeHtml(name)}</div>
            <div class="block-value">${escapeHtml(value)}${unit ? ' ' + unit : ''}</div>
          </div>
        </div>
      `;
      break;
      
    case 'horizontal':
    default:
      // 水平样式：图标在左，名称:值在右（标题/页脚用）
      const displayValue = value ? `: ${value}${unit ? unit : ''}` : '';
      blockHtml = `
        <div class="cardforge-block layout-horizontal area-${area}">
          <div class="block-icon">
            <ha-icon icon="${icon}"></ha-icon>
          </div>
          <div class="block-content">
            <div class="block-name">${escapeHtml(name)}${displayValue}</div>
          </div>
        </div>
      `;
  }
  
  return blockHtml;
};

// 批量渲染多个块
export const renderBlocks = (blocks, hass, options = {}) => {
  if (!blocks || Object.keys(blocks).length === 0) return '';
  
  return Object.entries(blocks)
    .map(([id, block]) => renderBlock({ ...block, id }, hass, options))
    .join('');
};