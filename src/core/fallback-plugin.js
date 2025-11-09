// src/core/fallback-plugin.js
export class FallbackPlugin {
    constructor(pluginId, errorMessage = '未知错误') {
      this.name = pluginId;
      this.displayName = '加载失败';
      this.icon = '❌';
      this.category = 'system';
      this.pluginInfo = {
        id: pluginId,
        name: '加载失败',
        description: '插件加载异常',
        icon: '❌',
        category: 'system'
      };
      this.errorMessage = errorMessage;
    }
  
    getTemplate(config, entities) {
      return `
        <div class="cardforge-card fallback">
          <div class="error-icon">⚠️</div>
          <div class="error-title">插件加载失败</div>
          <div class="error-plugin">${this.name}</div>
          <div class="error-message">${this.errorMessage}</div>
          <div class="error-help">请检查插件配置或网络连接</div>
        </div>
      `;
    }
  
    getStyles(config) {
      return `
        .fallback {
          padding: 24px;
          text-align: center;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border-radius: 12px;
          border: 2px dashed var(--error-color);
        }
        .fallback .error-icon {
          font-size: 3em;
          margin-bottom: 16px;
          color: var(--warning-color);
        }
        .fallback .error-title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--error-color);
        }
        .fallback .error-plugin {
          font-size: 1em;
          margin-bottom: 8px;
          opacity: 0.8;
          font-family: monospace;
        }
        .fallback .error-message {
          font-size: 0.9em;
          margin-bottom: 12px;
          opacity: 0.7;
        }
        .fallback .error-help {
          font-size: 0.8em;
          opacity: 0.6;
        }
      `;
    }
  
    getEntityRequirements() {
      return { required: [], optional: [] };
    }
  
    validateConfig(config) {
      return { valid: false, errors: ['插件加载失败，无法验证配置'] };
    }
  }