// src/editors/theme-selector.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { themeManager } from '../themes/index.js';

export class ThemeSelector extends LitElement {
  static properties = {
    selectedTheme: { type: String },
    _themes: { state: true }
  };

  static styles = css`
    .theme-selector {
      width: 100%;
    }
    
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 8px;
    }
    
    .theme-card {
      padding: 16px 12px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    
    .theme-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .theme-card.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    
    .theme-preview {
      width: 100%;
      height: 60px;
      border-radius: 6px;
      margin-bottom: 8px;
      border: 1px solid var(--divider-color);
      transition: all 0.3s ease;
    }
    
    .theme-card.selected .theme-preview {
      transform: scale(1.05);
    }
    
    .theme-name {
      font-size: 0.85em;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .theme-description {
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    
    .theme-auto .theme-preview {
      background: var(--card-background-color);
    }
    
    .theme-glass .theme-preview {
      background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .theme-gradient .theme-preview {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .theme-neon .theme-preview {
      background: #1a1a1a;
      border: 1px solid #00ff88;
      box-shadow: 0 0 8px #00ff88;
    }
  `;

  constructor() {
    super();
    this._themes = [];
  }

  firstUpdated() {
    this._themes = themeManager.getAllThemes();
  }

  render() {
    return html`
      <div class="theme-selector">
        <div class="theme-grid">
          ${this._themes.map(theme => html`
            <div 
              class="theme-card ${this.selectedTheme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
            >
              <div class="theme-preview ${this._getPreviewClass(theme.id)}"></div>
              <div class="theme-name">${theme.name}</div>
              <div class="theme-description">${theme.description}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _getPreviewClass(themeId) {
    return `theme-${themeId}`;
  }

  _selectTheme(themeId) {
    this.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: themeId }
    }));
  }
}

if (!customElements.get('theme-selector')) {
  customElements.define('theme-selector', ThemeSelector);
}