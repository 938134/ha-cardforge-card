// src/editors/editor-utils.js
import { isValidEntityId, isJinjaTemplate } from '../core/utils.js';

/**
 * 验证编辑器配置
 */
export function validateEditorConfig(config) {
  if (!config) {
    throw new Error('编辑器配置不能为空');
  }
  
  const errors = [];
  
  if (!config.plugin) {
    errors.push('必须选择卡片类型');
  }
  
  // 验证实体配置
  if (config.entities) {
    Object.entries(config.entities).forEach(([key, value]) => {
      if (value && !isValidEntityValue(value)) {
        errors.push(`实体配置 "${key}" 格式不正确`);
      }
    });
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return true;
}

/**
 * 检查实体值是否有效
 */
export function isValidEntityValue(value) {
  if (typeof value !== 'string') return false;
  
  // 空值有效
  if (!value.trim()) return true;
  
  // 实体ID格式
  if (isValidEntityId(value)) {
    return true;
  }
  
  // Jinja2模板
  if (isJinjaTemplate(value)) {
    return true;
  }
  
  // 普通文本
  return true;
}

/**
 * 获取配置预览
 */
export function getConfigPreview(config) {
  if (!config.plugin) return '未配置';
  
  const pluginInfo = `插件: ${config.plugin}`;
  const themeInfo = config.theme ? `主题: ${config.theme}` : '';
  const entityCount = config.entities ? Object.keys(config.entities).length : 0;
  const entityInfo = entityCount > 0 ? `实体: ${entityCount}个` : '';
  
  return [pluginInfo, themeInfo, entityInfo].filter(Boolean).join(' | ');
}

/**
 * 生成默认配置
 */
export function generateDefaultConfig(pluginId) {
  return {
    plugin: pluginId,
    entities: {},
    theme: 'auto'
  };
}

/**
 * 获取实体值的类型
 */
export function getValueType(value, hass = null) {
  if (!value) return 'empty';
  
  if (isValidEntityId(value)) {
    if (hass && hass.states[value]) {
      return 'entity';
    }
    return 'entity';
  }
  
  if (isJinjaTemplate(value)) {
    return 'jinja';
  }
  
  return 'text';
}

/**
 * 获取实体值的预览
 */
export function getValuePreview(value, hass = null) {
  const type = getValueType(value, hass);
  
  switch (type) {
    case 'entity':
      if (hass && hass.states[value]) {
        const state = hass.states[value];
        const unit = state.attributes?.unit_of_measurement || '';
        return `${state.state}${unit ? ' ' + unit : ''}`;
      }
      return '实体未找到';
      
    case 'jinja':
      return 'Jinja2模板';
      
    case 'text':
      return value.length > 50 ? value.substring(0, 50) + '...' : value;
      
    default:
      return '未设置';
  }
}