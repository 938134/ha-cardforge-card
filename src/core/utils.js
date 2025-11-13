// src/core/utils.js

/**
 * 验证配置对象
 */
export function validateConfig(config, requiredFields = []) {
  if (!config) {
    throw new Error('配置不能为空');
  }
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`缺少必需的配置字段: ${field}`);
    }
  }
  
  return config;
}

/**
 * 深度合并对象
 */
export function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 安全获取嵌套属性
 */
export function getSafe(obj, path, defaultValue = null) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

/**
 * 格式化数字
 */
export function formatNumber(value, decimals = 2) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(decimals);
}

/**
 * 检查是否是有效的实体ID
 */
export function isValidEntityId(entityId) {
  return typeof entityId === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(entityId);
}

/**
 * 检查是否是Jinja2模板
 */
export function isJinjaTemplate(value) {
  return typeof value === 'string' && (value.includes('{{') || value.includes('{%'));
}

/**
 * 获取友好的时间格式
 */
export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
}

/**
 * 获取友好的日期格式
 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('zh-CN');
}

/**
 * 获取星期几
 */
export function getWeekday(date = new Date()) {
  return '星期' + '日一二三四五六'[date.getDay()];
}