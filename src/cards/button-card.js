import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export class ButtonCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _buttonCard: { state: true }
  };

  constructor() {
    super();
    this._buttonCard = null;
  }

  setConfig(config) {
    this.config = config;
  }

  async firstUpdated() {
    await this._loadButtonCard();
    this._createButtonCard();
  }

  async _loadButtonCard() {
    if (customElements.get('button-card')) return;
    
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = '/local/button-card.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  _createButtonCard() {
    if (this._buttonCard) {
      this.shadowRoot.removeChild(this._buttonCard);
    }

    this._buttonCard = document.createElement('button-card');
    this._updateButtonCardConfig();
    this.shadowRoot.appendChild(this._buttonCard);
  }

  _updateButtonCardConfig() {
    if (!this._buttonCard) return;

    const buttonConfig = {
      type: 'custom:button-card',
      ...this.config.button_config
    };

    if (this.config.entity) {
      buttonConfig.entity = this.config.entity;
    }

    this._buttonCard.config = buttonConfig;
    this._buttonCard.hass = this.hass;
  }

  updated(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._updateButtonCardConfig();
    }
  }

  render() {
    return html`<div id="button-card-container"></div>`;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('button-card', ButtonCard);