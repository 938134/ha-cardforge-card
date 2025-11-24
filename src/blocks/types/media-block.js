// src/blocks/types/media-block.js
import { BaseBlock } from '../base-block.js';

class MediaBlock extends BaseBlock {
  static blockType = 'media';
  static blockName = '媒体';
  static blockIcon = 'mdi:music-box';
  static category = 'media';
  static description = '媒体播放器控制';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entityId = config.entity;
    
    if (!entityId) {
      return this._renderEmpty('请选择媒体播放器');
    }

    const entity = hass?.states?.[entityId];
    if (!entity) {
      return this._renderEmpty('媒体播放器未找到');
    }

    const state = entity.state;
    const attributes = entity.attributes || {};
    const mediaTitle = attributes.media_title || '无媒体';
    const mediaArtist = attributes.media_artist || '';
    const volume = attributes.volume_level * 100 || 0;

    return this._renderContainer(`
      ${this._renderHeader(config.title || attributes.friendly_name || '媒体')}
      
      <div class="media-content">
        <div class="media-info">
          <div class="media-title">${this._escapeHtml(mediaTitle)}</div>
          ${mediaArtist ? `<div class="media-artist">${this._escapeHtml(mediaArtist)}</div>` : ''}
        </div>
        
        <div class="media-controls">
          ${this._renderMediaControls(state, entityId)}
        </div>
        
        ${config.showVolume ? this._renderVolumeControl(volume, entityId) : ''}
      </div>
    `, 'media-block');
  }

  getStyles(block) {
    return `
      .media-block .media-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .media-info {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .media-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 4px;
        line-height: 1.2;
      }

      .media-artist {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }

      .media-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .media-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--cf-primary-color);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--cf-transition-fast);
      }

      .media-button:hover {
        transform: scale(1.1);
        box-shadow: var(--cf-shadow-md);
      }

      .media-button:disabled {
        background: var(--cf-border);
        cursor: not-allowed;
        transform: none;
      }

      .media-button.secondary {
        background: var(--cf-surface);
        color: var(--cf-primary-color);
        border: 1px solid var(--cf-border);
      }

      .volume-control {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .volume-icon {
        color: var(--cf-text-secondary);
        flex-shrink: 0;
      }

      .volume-slider {
        flex: 1;
      }

      @container (max-width: 300px) {
        .media-controls {
          gap: var(--cf-spacing-xs);
        }
        
        .media-button {
          width: 36px;
          height: 36px;
        }
        
        .media-title {
          font-size: 0.9em;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entities = this._getMediaEntities(hass);

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">媒体播放器</label>
          <ha-combo-box
            .items="${JSON.stringify(entities)}"
            .value="${config.entity || ''}"
            @value-changed="${e => onConfigChange('entity', e.detail.value)}"
            allow-custom-value
            fullwidth
          ></ha-combo-box>
        </div>
        
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            placeholder="使用实体名称"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="switch-item">
          <span class="switch-label">显示音量控制</span>
          <ha-switch
            .checked="${config.showVolume}"
            @change="${e => onConfigChange('showVolume', e.target.checked)}"
          ></ha-switch>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      entity: '',
      title: '',
      showVolume: true
    };
  }

  _getMediaEntities(hass) {
    if (!hass?.states) return [];
    
    return Object.entries(hass.states)
      .filter(([entityId, entity]) => 
        entityId.startsWith('media_player.')
      )
      .map(([entityId, entity]) => ({
        value: entityId,
        label: entity.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _renderMediaControls(state, entityId) {
    const isPlaying = state === 'playing';
    const isPaused = state === 'paused';
    const isIdle = state === 'idle' || state === 'off';

    return `
      <button class="media-button secondary" onclick="this.dispatchEvent(new CustomEvent('hass-call-service', {
        bubbles: true,
        composed: true,
        detail: { domain: 'media_player', service: 'media_previous_track', serviceData: { entity_id: '${entityId}' } }
      }))" ${isIdle ? 'disabled' : ''}>
        <ha-icon icon="mdi:skip-previous"></ha-icon>
      </button>
      
      ${isPlaying ? `
        <button class="media-button" onclick="this.dispatchEvent(new CustomEvent('hass-call-service', {
          bubbles: true,
          composed: true,
          detail: { domain: 'media_player', service: 'media_pause', serviceData: { entity_id: '${entityId}' } }
        }))">
          <ha-icon icon="mdi:pause"></ha-icon>
        </button>
      ` : `
        <button class="media-button" onclick="this.dispatchEvent(new CustomEvent('hass-call-service', {
          bubbles: true,
          composed: true,
          detail: { domain: 'media_player', service: 'media_play', serviceData: { entity_id: '${entityId}' } }
        }))" ${isIdle ? 'disabled' : ''}>
          <ha-icon icon="mdi:play"></ha-icon>
        </button>
      `}
      
      <button class="media-button secondary" onclick="this.dispatchEvent(new CustomEvent('hass-call-service', {
        bubbles: true,
        composed: true,
        detail: { domain: 'media_player', service: 'media_next_track', serviceData: { entity_id: '${entityId}' } }
      }))" ${isIdle ? 'disabled' : ''}>
        <ha-icon icon="mdi:skip-next"></ha-icon>
      </button>
    `;
  }

  _renderVolumeControl(volume, entityId) {
    return `
      <div class="volume-control">
        <ha-icon class="volume-icon" icon="mdi:volume-medium"></ha-icon>
        <div class="volume-slider">
          <ha-slider
            min="0"
            max="100"
            step="1"
            .value="${volume}"
            @change="${e => {
              const event = new CustomEvent('hass-call-service', {
                bubbles: true,
                composed: true,
                detail: {
                  domain: 'media_player',
                  service: 'volume_set',
                  serviceData: {
                    entity_id: entityId,
                    volume_level: e.target.value / 100
                  }
                }
              });
              this.dispatchEvent(event);
            }}"
            pin
          ></ha-slider>
        </div>
      </div>
    `;
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:music-box-outline" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'media-block empty');
  }
}

export { MediaBlock as default };