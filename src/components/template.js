// ha-cardforge-card/components/template.js
class TemplateEngine {
  static _cache = new Map();
  static _maxCacheSize = 50;

  static render(template, data, options = {}) {
    if (typeof template === 'function') {
      return template(data.config, data.hass, data.entities);
    }

    if (typeof template === 'string') {
      return this._renderStringTemplate(template, data, options);
    }

    return String(template);
  }

  static _renderStringTemplate(template, data, options) {
    const cacheKey = options.cache !== false ? this._generateCacheKey(template, data) : null;
    
    if (cacheKey && this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    try {
      let result = template;
      
      // 替换 {{variable}} 语法
      result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return this._getNestedValue(data, key) || '';
      });

      // 替换 [[[code]]] 语法
      result = result.replace(/\[\[\[(.*?)\]\]\]/gs, (match, code) => {
        try {
          return this._evaluateExpression(code, data) || '';
        } catch (error) {
          console.warn('表达式执行失败:', error);
          return '';
        }
      });

      if (cacheKey) {
        this._setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('模板渲染错误:', error);
      return this._renderErrorFallback(error, template);
    }
  }

  static _evaluateExpression(code, data) {
    const context = {
      config: data.config,
      hass: data.hass,
      entities: data.entities,
      now: new Date(),
      Math: Math,
      Date: Date,
      String: String,
      Number: Number
    };

    try {
      const func = new Function(...Object.keys(context), `return (${code})`);
      return func(...Object.values(context));
    } catch (error) {
      console.warn('表达式求值失败:', error);
      return null;
    }
  }

  static _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  static _generateCacheKey(template, data) {
    const dataStr = JSON.stringify(data);
    return `template:${btoa(template)}:${btoa(dataStr)}`;
  }

  static _setCache(key, value) {
    if (this._cache.size >= this._maxCacheSize) {
      const firstKey = this._cache.keys().next().value;
      this._cache.delete(firstKey);
    }
    this._cache.set(key, value);
  }

  static _renderErrorFallback(error, template) {
    return `
      <div style="
        padding: 16px;
        background: #ffebee;
        color: #c62828;
        border-radius: 8px;
        font-size: 12px;
      ">
        <div style="font-weight: bold;">🚨 模板错误</div>
        <div>${error.message}</div>
      </div>
    `;
  }

  // 工具方法
  static escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static clearCache() {
    this._cache.clear();
  }
}

window.TemplateEngine = TemplateEngine;
export { TemplateEngine };