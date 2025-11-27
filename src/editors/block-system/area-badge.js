// src/editors/block-system/area-badge.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

class AreaBadge extends LitElement {
  static properties = {
    area: { type: String }
  };

  static styles = [
    designSystem,
    css`
      .area-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-weight: 600;
        color: white;
        font-size: 1.1em;
        transition: all var(--cf-transition-fast);
      }

      .area-badge.header {
        background: #2196F3;
      }

      .area-badge.content {
        background: #4CAF50;
      }

      .area-badge.footer {
        background: #FF9800;
      }

      .area-badge:hover {
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .area-badge {
          width: 36px;
          height: 36px;
          font-size: 1em;
        }
      }
    `
  ];

  render() {
    const area = this.area || 'content';
    const letter = this._getAreaLetter(area);
    
    return html`
      <div class="area-badge ${area}">
        ${letter}
      </div>
    `;
  }

  _getAreaLetter(area) {
    const letterMap = {
      'header': 'H',
      'content': 'C',
      'footer': 'F'
    };
    return letterMap[area] || 'C';
  }
}

if (!customElements.get('area-badge')) {
  customElements.define('area-badge', AreaBadge);
}

export { AreaBadge };