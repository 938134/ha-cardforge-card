/**
 * 卡片工坊 - 统一工具组件
 * 集中管理所有卡片共享的工具函数
 */

// ==================== 日期时间工具 ====================
export class DateTimeUtils {
  /**
   * 获取智能时间问候语
   * @param {number|Date} hourOrDate - 小时数或Date对象
   * @param {string} userName - 用户名称
   * @returns {string} 问候语
   */
  static getGreeting(hourOrDate, userName = '') {
    const hour = hourOrDate instanceof Date ? hourOrDate.getHours() : hourOrDate;
    
    const timeSlots = [
      { start: 5, end: 12, text: '早上好' },
      { start: 12, end: 14, text: '中午好' },
      { start: 14, end: 18, text: '下午好' },
      { start: 18, end: 22, text: '晚上好' },
      { start: 22, end: 5, text: '夜深了' }
    ];
    
    let greetingText = '你好';
    
    for (const slot of timeSlots) {
      if (slot.start <= slot.end) {
        if (hour >= slot.start && hour < slot.end) {
          greetingText = slot.text;
          break;
        }
      } else {
        if (hour >= slot.start || hour < slot.end) {
          greetingText = slot.text;
          break;
        }
      }
    }
    
    return userName ? `${greetingText}，${userName}！` : `${greetingText}！`;
  }

  /**
   * 格式化时间
   * @param {Date} date - 日期对象
   * @param {boolean} use24Hour - 是否使用24小时制
   * @param {boolean} showSeconds - 是否显示秒数
   * @returns {string} 格式化后的时间
   */
  static formatTime(date, use24Hour = true, showSeconds = false) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = '';
    
    if (showSeconds) {
      seconds = ':' + date.getSeconds().toString().padStart(2, '0');
    }
    
    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}${seconds}`;
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}${seconds} ${ampm}`;
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式类型
   * @returns {string} 格式化后的日期
   */
  static formatDate(date, format = 'zh-CN') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const formats = {
      'zh-CN': `${year}年${month}月${day}日`,
      'zh-CN-short': `${month}月${day}日`,
      'numeric': `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      'slash': `${month}/${day}/${year}`,
      'dot': `${day}.${month}.${year}`
    };
    
    return formats[format] || formats['zh-CN'];
  }

  /**
   * 获取星期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式类型
   * @returns {string} 星期文本
   */
  static getWeekday(date, format = 'full') {
    const weekdays = {
      full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      single: ['日', '一', '二', '三', '四', '五', '六'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    
    const dayIndex = date.getDay();
    return (weekdays[format] || weekdays.full)[dayIndex];
  }

  /**
   * 计算年进度百分比
   * @param {Date} date - 日期对象
   * @returns {number} 年进度百分比 (0-100)
   */
  static getYearProgress(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
  }

  /**
   * 获取一年中的第几周
   * @param {Date} date - 日期对象
   * @returns {number} 周数
   */
  static getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }

  /**
   * 获取当前季度
   * @param {Date} date - 日期对象
   * @returns {number} 季度 (1-4)
   */
  static getQuarter(date) {
    return Math.floor(date.getMonth() / 3) + 1;
  }
}

// ==================== 用户工具 ====================
export class UserUtils {
  /**
   * 获取用户显示名称
   * @param {Object} config - 卡片配置
   * @param {Object} hass - Home Assistant对象
   * @returns {string} 用户名称
   */
  static getDisplayName(config, hass) {
    // 优先级：卡片配置 > HA用户名称 > 默认值
    return config.greetingName || hass?.user?.name || '朋友';
  }

  /**
   * 获取用户基本信息
   * @param {Object} hass - Home Assistant对象
   * @returns {Object} 用户信息
   */
  static getUserInfo(hass) {
    if (!hass?.user) return null;
    
    return {
      id: hass.user.id,
      name: hass.user.name,
      isAdmin: hass.user.is_admin || false,
      isOwner: hass.user.is_owner || false,
      // 可根据需要扩展更多属性
    };
  }
}

// ==================== 文本处理工具 ====================
export class TextUtils {
  /**
   * HTML安全编码
   * @param {string} text - 原始文本
   * @returns {string} 安全编码后的文本
   */
  static escapeHtml(text) {
    if (!text) return '';
    
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * 截断文本并添加省略号
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀（默认...）
   * @returns {string} 截断后的文本
   */
  static truncate(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 格式化单位显示
   * @param {number|string} value - 数值
   * @param {string} unit - 单位
   * @returns {string} 带单位的字符串
   */
  static formatWithUnit(value, unit) {
    if (unit === undefined || unit === null) return String(value);
    
    // 常见单位的友好显示
    const unitMap = {
      '°C': '°C',
      '°F': '°F',
      '%': '%',
      'kW': 'kW',
      'kWh': 'kWh',
      'W': 'W',
      'V': 'V',
      'A': 'A',
      'hPa': 'hPa',
      'lux': 'lx',
      'dB': 'dB'
    };
    
    const displayUnit = unitMap[unit] || unit;
    return `${value} ${displayUnit}`;
  }

  /**
   * 生成随机名言（默认备用）
   * @param {Date} date - 用于生成确定性随机数的日期
   * @returns {string} 随机名言
   */
  static getRandomQuote(date = new Date()) {
    const quotes = [
      "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
      "成功的秘诀在于对目标的坚持。",
      "时间就像海绵里的水，只要愿挤，总还是有的。",
      "不忘初心，方得始终。",
      "学习如逆水行舟，不进则退。",
      "世上无难事，只怕有心人。",
      "行动是治愈恐惧的良药。",
      "每天进步一点点。"
    ];
    
    // 使用日期生成确定性随机数（同一天显示同一句）
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  }
}

// ==================== 实体工具 ====================
export class EntityUtils {
  /**
   * 从块配置中提取指定预设块的内容
   * @param {Object} blocks - 块配置对象
   * @param {string} presetKey - 预设块键名
   * @param {Object} hass - Home Assistant对象
   * @param {string} defaultValue - 默认值
   * @returns {Object} 包含内容和图标的对象
   */
  static getPresetBlockContent(blocks, presetKey, hass, defaultValue = '') {
    if (!blocks) return { content: defaultValue, icon: null, hasEntity: false };
    
    for (const [id, block] of Object.entries(blocks)) {
      if (block.presetKey === presetKey) {
        const hasEntity = block.entity && hass?.states?.[block.entity];
        
        if (hasEntity) {
          const entity = hass.states[block.entity];
          return {
            content: entity.state || defaultValue,
            icon: entity.attributes?.icon || block.icon || null,
            hasEntity: true,
            entityId: block.entity
          };
        }
        
        return {
          content: defaultValue,
          icon: block.icon || null,
          hasEntity: false
        };
      }
    }
    
    return { content: defaultValue, icon: null, hasEntity: false };
  }

  /**
   * 获取实体友好名称
   * @param {Object} entityState - 实体状态对象
   * @param {string} entityId - 实体ID
   * @returns {string} 友好名称
   */
  static getEntityFriendlyName(entityState, entityId) {
    return entityState?.attributes?.friendly_name || entityId || '未知实体';
  }
}

// ==================== 导出简化版别名 ====================
// 为了方便使用，提供简化版的导出

/** 获取问候语 */
export const getGreeting = DateTimeUtils.getGreeting;

/** 格式化时间 */
export const formatTime = DateTimeUtils.formatTime;

/** 格式化日期 */
export const formatDate = DateTimeUtils.formatDate;

/** 获取星期 */
export const getWeekday = DateTimeUtils.getWeekday;

/** 获取年进度 */
export const getYearProgress = DateTimeUtils.getYearProgress;

/** 获取周数 */
export const getWeekNumber = DateTimeUtils.getWeekNumber;

/** 获取用户显示名称 */
export const getDisplayName = UserUtils.getDisplayName;

/** HTML安全编码 */
export const escapeHtml = TextUtils.escapeHtml;

/** 截断文本 */
export const truncate = TextUtils.truncate;

/** 格式化单位 */
export const formatWithUnit = TextUtils.formatWithUnit;

/** 获取随机名言 */
export const getRandomQuote = TextUtils.getRandomQuote;

/** 获取预设块内容 */
export const getPresetBlockContent = EntityUtils.getPresetBlockContent;
