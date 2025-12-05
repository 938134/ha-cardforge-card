// 卡片工坊核心工具库
// 所有函数都是纯函数，无副作用，便于测试和维护

/**
 * 时间日期工具模块
 */

/**
 * 格式化时间为字符串
 * @param {Date} date - 日期对象
 * @param {boolean} use24Hour - 是否使用24小时制
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date, use24Hour = true) {
  if (!(date instanceof Date)) return '';
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (use24Hour) {
    return hours.toString().padStart(2, '0') + ':' + minutes;
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + ampm;
  }
}

/**
 * 格式化日期为字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  if (!(date instanceof Date)) return '';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日`;
}

/**
 * 获取星期几
 * @param {Date} date - 日期对象
 * @returns {string} 星期字符串（星期日、星期一...）
 */
export function getWeekday(date) {
  if (!(date instanceof Date)) return '';
  
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[date.getDay()];
}

/**
 * 获取年份进度百分比
 * @param {Date} date - 日期对象
 * @returns {number} 0-100之间的进度百分比
 */
export function getYearProgress(date) {
  if (!(date instanceof Date)) return 0;
  
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  const elapsed = date - start;
  const total = end - start;
  
  return (elapsed / total) * 100;
}

/**
 * 获取周数（ISO周数）
 * @param {Date} date - 日期对象
 * @returns {number} 周数
 */
export function getWeekNumber(date) {
  if (!(date instanceof Date)) return 1;
  
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}

/**
 * 根据小时获取问候语
 * @param {Date} date - 日期对象
 * @returns {string} 问候语（早上好、中午好...）
 */
export function getGreetingByHour(date) {
  if (!(date instanceof Date)) return '你好';
  
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 22) return '晚上好';
  return '夜深了';
}

/**
 * 获取日期时间完整信息
 * @param {Date} date - 日期对象
 * @param {boolean} use24Hour - 是否使用24小时制
 * @returns {Object} 包含所有日期时间信息的对象
 */
export function getDateTimeInfo(date, use24Hour = true) {
  return {
    time: formatTime(date, use24Hour),
    date: formatDate(date),
    weekday: getWeekday(date),
    yearProgress: getYearProgress(date),
    weekNumber: getWeekNumber(date),
    greeting: getGreetingByHour(date),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  };
}

/**
 * 用户信息工具模块
 */

/**
 * 安全获取用户名
 * @param {Object} hass - Home Assistant对象
 * @param {string} defaultValue - 默认用户名
 * @returns {string} 用户名
 */
export function getUserName(hass, defaultValue = '朋友') {
  return hass?.user?.name || defaultValue;
}

/**
 * 获取显示名称（优先使用配置的名称）
 * @param {Object} hass - Home Assistant对象
 * @param {string} configName - 卡片配置中的名称
 * @param {string} defaultValue - 默认名称
 * @returns {string} 最终显示的名称
 */
export function getDisplayName(hass, configName = '', defaultValue = '朋友') {
  if (configName && configName.trim()) {
    return configName.trim();
  }
  return getUserName(hass, defaultValue);
}

/**
 * 检查是否有用户信息
 * @param {Object} hass - Home Assistant对象
 * @returns {boolean} 是否有用户信息
 */
export function hasUser(hass) {
  return !!hass?.user?.name;
}

/**
 * 文本处理工具模块
 */

/**
 * HTML安全转义
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * 获取默认名言（按日期轮换）
 * @param {Date} date - 日期对象
 * @returns {string} 名言内容
 */
export function getDefaultQuote(date) {
  if (!(date instanceof Date)) return '';
  
  const quotes = [
    "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
    "成功的秘诀在于对目标的坚持。",
    "时间就像海绵里的水，只要愿挤，总还是有的。",
    "不忘初心，方得始终。",
    "学习如逆水行舟，不进则退。"
  ];
  
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return quotes[dayOfYear % quotes.length];
}

/**
 * 格式化诗词内容（添加换行）
 * @param {string} content - 原始诗词内容
 * @returns {string} 格式化后的HTML
 */
export function formatPoetryContent(content) {
  if (!content || typeof content !== 'string') return '';
  
  const sentences = content.split(/([。！？])/);
  let result = '';
  let currentSentence = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const segment = sentences[i];
    if (segment) {
      currentSentence += segment;
      if (/[。！？]/.test(segment)) {
        result += `<div class="poetry-line">${escapeHtml(currentSentence)}</div>`;
        currentSentence = '';
      }
    }
  }
  
  if (currentSentence) {
    result += `<div class="poetry-line">${escapeHtml(currentSentence)}</div>`;
  }
  
  return result;
}

/**
 * 截断文本并添加省略号
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength = 50) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * 实体工具模块
 */

/**
 * 安全获取实体状态
 * @param {Object} hass - Home Assistant对象
 * @param {string} entityId - 实体ID
 * @param {string} defaultValue - 默认值
 * @returns {string} 实体状态值
 */
export function getEntityState(hass, entityId, defaultValue = '') {
  if (!hass?.states || !entityId) return defaultValue;
  return hass.states[entityId]?.state || defaultValue;
}

/**
 * 获取实体友好名称
 * @param {Object} hass - Home Assistant对象
 * @param {string} entityId - 实体ID
 * @param {string} defaultValue - 默认值
 * @returns {string} 友好名称
 */
export function getEntityFriendlyName(hass, entityId, defaultValue = '') {
  if (!hass?.states || !entityId) return defaultValue;
  
  const entity = hass.states[entityId];
  if (!entity) return defaultValue;
  
  return entity.attributes?.friendly_name || entityId;
}

/**
 * 获取实体图标
 * @param {Object} hass - Home Assistant对象
 * @param {string} entityId - 实体ID
 * @param {string} defaultIcon - 默认图标
 * @returns {string} 图标字符串
 */
export function getEntityIcon(hass, entityId, defaultIcon = 'mdi:cube') {
  if (!hass?.states || !entityId) return defaultIcon;
  
  const entity = hass.states[entityId];
  if (!entity) return defaultIcon;
  
  // 优先使用实体自定义图标
  if (entity.attributes?.icon) {
    return entity.attributes.icon;
  }
  
  return defaultIcon;
}

/**
 * 初始化工具库（如果需要）
 */
export function initializeUtilities() {
  // 目前没有需要初始化的内容
  // 为未来扩展预留
  console.debug('CardForge Utilities initialized');
}
