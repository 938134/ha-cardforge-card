// src/core/theme.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './registry.js';

export class ThemeConfig {
  static render(config, plugin, onThemeChange) {
    const themes = [
      { 
        id: 'auto', 
        name: '跟随系统', 
        icon: 'mdi:theme-light-dark',
        description: '自动跟随系统明暗主题',
        previewClass: 'auto'
      },
      { 
        id: 'glass', 
        name: '毛玻璃', 
        icon: 'mdi:blur',
        description: '半透明毛玻璃效果',
        previewClass: 'glass'
      },
      { 
        id: 'gradient', 
        name: '随机渐变', 
        icon: 'mdi:gradient',
        description: '动态随机渐变色彩',
        previewClass: 'gradient'
      },
      { 
        id: 'neon', 
        name: '霓虹光影', 
        icon: 'mdi:led-outline',
        description: '霓虹灯发光效果',
        previewClass: 'neon'
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
                <div class="theme-preview ${theme.previewClass}">
                  <ha-icon .icon=${theme.icon}></ha-icon>
                </div>
                <div class="theme-info">
                  <div class="theme-name">${theme.name}</div>
                  <div class="theme-description">${theme.description}</div>
                </div>
                ${config.theme === theme.id ? html`
                  <ha-icon 
                    icon="mdi:check-circle" 
                    class="selected-icon"
                  ></ha-icon>
                ` : ''}
              </div>
            `)}
          </div>
          
          ${this._renderCurrentThemePreview(config.theme)}
          
          ${this._renderPluginThemeInfo(fullPlugin)}
          
          <div class="config-hint">
            🎨 主题更改将实时反映在预览区域
          </div>
        </div>
      </ha-card>
    `;
  }

  static _renderCurrentThemePreview(themeId) {
    const previews = {
      'auto': html`<div class="current-preview auto">跟随系统主题变化</div>`,
      'glass': html`<div class="current-preview glass">半透明模糊背景效果</div>`,
      'gradient': html`<div class="current-preview gradient">动态渐变色彩效果</div>`,
      'neon': html`<div class="current-preview neon">霓虹发光边框效果</div>`
    };
    
    return html`
      <div class="current-theme-preview">
        <div class="preview-header">当前主题预览</div>
        ${previews[themeId] || previews.auto}
      </div>
    `;
  }

  static _handleThemeSelect(themeId, callback) {
    console.log('选择主题:', themeId);
    callback(themeId);
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