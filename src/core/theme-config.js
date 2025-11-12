// src/core/theme-config.js
import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class ThemeConfig {
  static render(config, plugin, onThemeChange) {
    const themes = [
      { id: 'default', name: '默认主题', icon: 'mdi:palette-outline' },
      { id: 'dark', name: '深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', icon: 'mdi:material-design' },
      { id: 'minimal', name: '极简风格', icon: 'mdi:image-filter-center-focus' },
      { id: 'colorful', name: '多彩主题', icon: 'mdi:palette' }
    ];

    return html`
      <ha-card>
        <div class="theme-config-container">
          <div class="config-header">
            <ha-icon icon="mdi:palette"></ha-icon>
            <span>主题设置 ${plugin ? `- ${plugin.manifest.name}` : ''}</span>
          </div>
          
          <ha-select
            label="选择主题风格"
            .value=${config.theme || 'default'}
            @selected=${e => this._handleThemeChange(e, onThemeChange)}
            @closed=${e => e.stopPropagation()}
            style="width: 100%; margin-bottom: 20px;"
            fixedMenuPosition
          >
            ${themes.map(theme => html`
              <mwc-list-item value=${theme.id} graphic="icon">
                <ha-icon .icon=${theme.icon} slot="graphic"></ha-icon>
                ${theme.name}
              </mwc-list-item>
            `)}
          </ha-select>
          
          ${this._renderPluginThemeInfo(plugin)}
          
          <div class="config-hint">
            🎨 主题更改将实时反映在预览区域
          </div>
        </div>
      </ha-card>
    `;
  }

  static _handleThemeChange(event, callback) {
    const theme = event.target.value;
    if (theme && theme !== '') {
      callback(theme);
    }
  }

  static _renderPluginThemeInfo(plugin) {
    if (!plugin) return '';

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
