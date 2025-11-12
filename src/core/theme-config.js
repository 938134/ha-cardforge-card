// src/core/theme-config.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './plugin-registry.js';

export class ThemeConfig {
  static render(config, plugin, onThemeChange) {
    const themes = [
      { 
        id: 'auto', 
        name: '跟随系统', 
        icon: 'mdi:theme-light-dark',
        description: '自动根据系统主题切换'
      },
      { 
        id: 'light', 
        name: '浅色主题', 
        icon: 'mdi:white-balance-sunny',
        description: '明亮的浅色风格'
      },
      { 
        id: 'dark', 
        name: '深色主题', 
        icon: 'mdi:weather-night',
        description: '舒适的深色风格'
      },
      { 
        id: 'colorful', 
        name: '多彩主题', 
        icon: 'mdi:palette',
        description: '渐变色背景风格'
      }
    ];

    // 从注册表获取完整的插件信息
    const fullPlugin = plugin ? PluginRegistry.getPlugin(plugin.id) : null;

    return html`
      <ha-card>
        <div class="theme-config-container">
          <div class="config-header">
            <ha-icon icon="mdi:palette"></ha-icon>
            <span>主题设置 ${fullPlugin ? `- ${fullPlugin.manifest.name}` : ''}</span>
          </div>
          
          <div class="theme-grid">
            ${themes.map(theme => html`
              <div 
                class="theme-card ${config.theme === theme.id ? 'selected' : ''}"
                @click=${() => this._handleThemeSelect(theme.id, onThemeChange)}
              >
                <div class="theme-preview ${theme.id}">
                  <ha-icon .icon=${theme.icon}></ha-icon>
                </div>
                <div class="theme-info">
                  <div class="theme-name">${theme.name}</div>
                  <div class="theme-description">${theme.description}</div>
                </div>
                ${config.theme === theme.id ? html`
                  <ha-icon 
                    icon="mdi:check-circle" 
                    class="theme-check"
                  ></ha-icon>
                ` : ''}
              </div>
            `)}
          </div>
          
          ${this._renderPluginThemeInfo(fullPlugin)}
          
          <div class="config-hint">
            🎨 主题更改将实时反映在预览区域
          </div>
        </div>
      </ha-card>
    `;
  }

  static _handleThemeSelect(themeId, callback) {
    console.log('选择主题:', themeId);
    if (themeId && themeId !== '') {
      callback(themeId);
    }
  }

  static _renderPluginThemeInfo(plugin) {
    if (!plugin) {
      return html`
        <div class="feature-unsupported">
          <ha-icon icon="mdi:information" style="color: var(--warning-color)"></ha-icon>
          <span>请先选择插件</span>
        </div>
      `;
    }

    const supportsGradient = plugin.manifest.gradientSupport;
    const supportsTheme = plugin.manifest.themeSupport;
    
    return html`
      <div class="plugin-theme-info">
        ${supportsTheme ? html`
          <div class="feature-supported">
            <ha-icon icon="mdi:check-circle" style="color: var(--success-color)"></ha-icon>
            <span>支持主题切换</span>
          </div>
        ` : html`
          <div class="feature-unsupported">
            <ha-icon icon="mdi:information" style="color: var(--warning-color)"></ha-icon>
            <span>主题支持有限</span>
          </div>
        `}
        
        ${supportsGradient ? html`
          <div class="feature-supported">
            <ha-icon icon="mdi:gradient" style="color: var(--success-color)"></ha-icon>
            <span>支持渐变背景</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}
