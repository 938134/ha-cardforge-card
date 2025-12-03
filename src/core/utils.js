// src/core/utils.js
/**
 * HTML 安全编码
 */
export const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };
  
  /**
   * 渲染图标（支持 MDI 和 Emoji）
   */
  export const renderIcon = (icon) => {
    if (!icon) return '';
    if (icon.startsWith('mdi:')) {
      return `<ha-icon icon="${icon}"></ha-icon>`;
    }
    return `<span class="emoji-icon">${icon}</span>`;
  };
  
  /**
   * 截断文本
   */
  export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  };
  
  /**
   * 格式化时间显示
   */
  export const formatTime = (date, use24Hour = true) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (use24Hour) {
      return hours.toString().padStart(2, '0') + ':' + minutes;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return displayHours + ':' + minutes + ' ' + ampm;
    }
  };
  
  /**
   * 获取问候语
   */
  export const getGreeting = (hour, name = '朋友') => {
    let greeting = '';
    if (hour >= 5 && hour < 12) greeting = '早上好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '你好';
    
    return `${greeting}，${name}！`;
  };