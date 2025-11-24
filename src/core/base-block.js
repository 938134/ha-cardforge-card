// src/core/base-block.js
import { themeManager } from './theme-manager.js';

export class BaseBlock {
  constructor() {
    if (new.target === BaseBlock) {
      throw new Error('BaseBlock 是抽象类，必须被继承');
    }
  }

  getTemplate(config, hass) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  render(config, hass) {
    const safeConfig = this._getSafeConfig(config);
    return this.getTemplate(safeConfig, hass);
  }

  _getSafeConfig(config) {
    const manifest = this.getManifest();
    const schema = manifest?.config_schema || {};
    const safeConfig = { ...config };
    
    Object.entries(schema).forEach(([key, field]) => {
      if (safeConfig[key] === undefined) {
        safeConfig[key] = field.default !== undefined ? field.default : '';
      }
    });
    
    return safeConfig;
  }

  _renderBlockContainer(content, className = '') {
    return `
      <div class="block-container ${className}">
        <div class="block-content">
          ${content}
        </div>
      </div>
    `;
  }

  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      .block-container {
        ${themeStyles}
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .block-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    `;
  }

  getManifest() {
    if (!this.constructor.manifest) {
      throw new Error(`块 ${this.constructor.name} 必须定义 manifest`);
    }
    return this.constructor.manifest;
  }
}