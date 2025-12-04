// 块渲染器
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

// 渲染单个块
export const renderBlock = (block, hass) => {
  const area = block.area || 'content';
  const areaInfo = AREAS[area] || AREAS.content;
  
  // 获取块数据
  const name = block.name || (block.entity && hass?.states?.[block.entity]?.attributes?.friendly_name) || '';
  const entity = block.entity ? hass?.states?.[block.entity] : null;
  const value = entity ? entity.state : '';
  const unit = entity?.attributes?.unit_of_measurement || '';
  const icon = block.icon || (block.entity ? getDefaultIcon(block.entity) : 'mdi:cube-outline');
  
  return `
    <div class="area-${area}">
      <div class="cardforge-block">
        <div class="block-icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="block-content">
          <div class="block-name">${escapeHtml(name)}</div>
          <div class="block-value">${escapeHtml(value)}${unit ? ' ' + unit : ''}</div>
        </div>
      </div>
    </div>
  `;
};

// 批量渲染多个块
export const renderBlocks = (blocks, hass) => {
  if (!blocks || Object.keys(blocks).length === 0) return '';
  
  return Object.entries(blocks)
    .map(([id, block]) => renderBlock({ ...block, id }, hass))
    .join('');
};
