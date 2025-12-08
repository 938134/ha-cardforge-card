/**
 * 卡片工具库 - 纯数据处理函数
 * 移除所有HTML字符串处理，专注数据转换
 */

// ===== 时间日期工具 =====

/**
 * 格式化时间为字符串
 */
export function formatTime(date, use24Hour = true) {
  if (!(date instanceof Date)) {
    console.warn('formatTime: 参数不是Date对象');
    return '';
  }
  
  try {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  } catch (error) {
    console.error('formatTime错误:', error);
    return '';
  }
}

/**
 * 格式化日期为字符串
 */
export function formatDate(date, format = 'long') {
  if (!(date instanceof Date)) return '';
  
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (format === 'short') {
      return `${month}/${day}`;
    } else if (format === 'numeric') {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
      return `${year}年${month}月${day}日`;
    }
  } catch (error) {
    console.error('formatDate错误:', error);
    return '';
  }
}

/**
 * 获取星期几
 */
export function getWeekday(date, format = 'long') {
  if (!(date instanceof Date)) return '';
  
  try {
    const day = date.getDay();
    const weekdaysLong = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekdaysShort = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    return format === 'short' ? weekdaysShort[day] : weekdaysLong[day];
  } catch (error) {
    console.error('getWeekday错误:', error);
    return '';
  }
}

/**
 * 获取年份进度百分比
 */
export function getYearProgress(date) {
  if (!(date instanceof Date)) return 0;
  
  try {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  } catch (error) {
    console.error('getYearProgress错误:', error);
    return 0;
  }
}

/**
 * 获取周数（ISO周数）
 */
export function getWeekNumber(date) {
  if (!(date instanceof Date)) return 1;
  
  try {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  } catch (error) {
    console.error('getWeekNumber错误:', error);
    return 1;
  }
}

/**
 * 根据小时获取问候语
 */
export function getGreetingByHour(date) {
  if (!(date instanceof Date)) return '你好';
  
  try {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 9) return '早上好';
    if (hour >= 9 && hour < 12) return '上午好';
    if (hour >= 12 && hour < 14) return '中午好';
    if (hour >= 14 && hour < 18) return '下午好';
    if (hour >= 18 && hour < 22) return '晚上好';
    if (hour >= 22 || hour < 5) return '夜深了';
    
    return '你好';
  } catch (error) {
    console.error('getGreetingByHour错误:', error);
    return '你好';
  }
}

// ===== 用户信息工具 =====

/**
 * 安全获取用户名
 */
export function getUserName(hass, defaultValue = '朋友') {
  if (!hass || typeof hass !== 'object') {
    console.warn('getUserName: hass参数无效');
    return defaultValue;
  }
  
  try {
    return hass.user?.name || defaultValue;
  } catch (error) {
    console.error('getUserName错误:', error);
    return defaultValue;
  }
}

/**
 * 获取显示名称（优先使用配置的名称）
 */
export function getDisplayName(hass, configName = '', defaultValue = '朋友') {
  try {
    if (configName && typeof configName === 'string' && configName.trim()) {
      return configName.trim();
    }
    
    return getUserName(hass, defaultValue);
  } catch (error) {
    console.error('getDisplayName错误:', error);
    return defaultValue;
  }
}

// ===== 实体工具 =====

/**
 * 安全获取实体状态
 */
export function getEntityState(hass, entityId, defaultValue = '') {
  if (!hass?.states || !entityId || typeof entityId !== 'string') {
    return defaultValue;
  }
  
  try {
    const entity = hass.states[entityId];
    if (!entity) {
      console.warn(`实体不存在: ${entityId}`);
      return defaultValue;
    }
    
    return entity.state || defaultValue;
  } catch (error) {
    console.error('getEntityState错误:', error);
    return defaultValue;
  }
}

/**
 * 获取实体友好名称
 */
export function getEntityFriendlyName(hass, entityId, defaultValue = '') {
  if (!hass?.states || !entityId) return defaultValue;
  
  try {
    const entity = hass.states[entityId];
    if (!entity) return defaultValue;
    
    return entity.attributes?.friendly_name || entityId;
  } catch (error) {
    console.error('getEntityFriendlyName错误:', error);
    return defaultValue;
  }
}

/**
 * 获取实体图标
 */
export function getEntityIcon(hass, entityId, defaultIcon = 'mdi:cube') {
  if (!hass?.states || !entityId) return defaultIcon;
  
  try {
    const entity = hass.states[entityId];
    if (!entity) return defaultIcon;
    
    // 优先使用实体自定义图标
    if (entity.attributes?.icon) {
      return entity.attributes.icon;
    }
    
    // 根据实体域返回默认图标
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
      camera: 'mdi:camera',
      person: 'mdi:account',
      device_tracker: 'mdi:account',
      sun: 'mdi:white-balance-sunny',
      weather: 'mdi:weather-partly-cloudy',
      script: 'mdi:script-text',
      automation: 'mdi:robot',
      input_boolean: 'mdi:toggle-switch-outline',
      input_number: 'mdi:ray-vertex',
      input_select: 'mdi:format-list-bulleted',
      input_text: 'mdi:form-textbox',
      timer: 'mdi:timer',
      scene: 'mdi:palette'
    };
    
    return iconMap[domain] || defaultIcon;
  } catch (error) {
    console.error('getEntityIcon错误:', error);
    return defaultIcon;
  }
}

/**
 * 获取实体单位
 */
export function getEntityUnit(hass, entityId, defaultUnit = '') {
  if (!hass?.states || !entityId) return defaultUnit;
  
  try {
    const entity = hass.states[entityId];
    if (!entity) return defaultUnit;
    
    return entity.attributes?.unit_of_measurement || defaultUnit;
  } catch (error) {
    console.error('getEntityUnit错误:', error);
    return defaultUnit;
  }
}

// ===== 数据处理工具 =====

/**
 * 截断文本
 */
export function truncateText(text, maxLength = 50, ellipsis = '...') {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + ellipsis;
}

/**
 * 格式化数字
 */
export function formatNumber(value, options = {}) {
  if (value == null) return '';
  
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    
    const {
      decimals = 1,
      minDecimals = 0,
      maxDecimals = 3,
      thousandsSeparator = true
    } = options;
    
    let formatted = num.toLocaleString('zh-CN', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals
    });
    
    if (!thousandsSeparator) {
      formatted = formatted.replace(/,/g, '');
    }
    
    return formatted;
  } catch (error) {
    console.error('formatNumber错误:', error);
    return String(value);
  }
}

/**
 * 格式化百分比
 */
export function formatPercent(value, decimals = 1) {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    
    return `${num.toFixed(decimals)}%`;
  } catch (error) {
    console.error('formatPercent错误:', error);
    return '';
  }
}

/**
 * 获取默认名言（按日期轮换）
 */
export function getDefaultQuote(date) {
  if (!(date instanceof Date)) return '';
  
  try {
    const quotes = [
      "千里之行，始于足下。",
      "学而不思则罔，思而不学则殆。",
      "天行健，君子以自强不息。",
      "不积跬步，无以至千里；不积小流，无以成江海。",
      "知之者不如好之者，好之者不如乐之者。"
    ];
    
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return quotes[dayOfYear % quotes.length];
  } catch (error) {
    console.error('getDefaultQuote错误:', error);
    return '';
  }
}

/**
 * 格式化诗词内容为数组
 */
export function splitPoetryContent(content) {
  if (!content || typeof content !== 'string') return [];
  
  try {
    // 按标点符号分割，保留标点
    const segments = content.split(/([。！？；])/).filter(segment => segment.trim());
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentLine += segments[i];
      
      // 如果遇到结束标点，完成一行
      if (/[。！？；]$/.test(segments[i])) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
    }
    
    // 处理最后一行（如果没有结束标点）
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  } catch (error) {
    console.error('splitPoetryContent错误:', error);
    return [content];
  }
}

/**
 * 初始化工具库
 */
export function initializeCardTools() {
  console.log('CardForge工具库初始化完成');
  
  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
  });
}
