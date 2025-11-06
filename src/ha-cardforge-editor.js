import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static styles = css`
    .editor-container {
      padding: 16px;
      max-width: 600px;
    }
    
    .form-section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    
    input[type="text"], input[type="number"], select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .checkbox-group label {
      margin: 0;
      font-weight: normal;
    }
    
    .form-row {
      display: flex;
      gap: 12px;
    }
    
    .form-row .form-group {
      flex: 1;
    }
    
    .entities-preview {
      margin-top: 8px;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .entity-tag {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: 2px 8px;
      margin: 2px;
      border-radius: 12px;
      font-size: 0.8em;
    }
    
    .button {
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
    }
    
    .button.secondary {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
    }
    
    .button.full-width {
      width: 100%;
    }
  `;

  setConfig(config) {
    this.config = config || this._getDefaultConfig();
  }

  _getDefaultConfig() {
    return {
      layout: {
        header: {
          title: '卡片工坊',
          icon: 'mdi:widgets',
          visible: true,
          show_edit_button: true
        },
        content: {
          entities: []
        },
        footer: {
          visible: true,
          show_timestamp: true,
          show_entity_count: true
        }
      }
    };
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;

    const path = ev.target.dataset.path;
    const target = ev.target;
    let value;

    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = parseFloat(target.value) || 0;
    } else {
      value = target.value;
    }

    this._setNestedProperty(this.config, path, value);
    this._fireConfigChanged();
  }

  _setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => {
      if (!o[k]) o[k] = {};
      return o[k];
    }, obj);
    target[lastKey] = value;
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _pickEntities() {
    if (window.EntityPicker) {
      const currentEntities = this.config.layout?.content?.entities || [];
      window.EntityPicker.open(currentEntities, (selectedEntities) => {
        this.config.layout.content.entities = selectedEntities;
        this._fireConfigChanged();
        this.requestUpdate();
      });
    } else {
      alert('实体选择器未加载，请刷新页面重试');
    }
  }

  render() {
    if (!this.config) return html`<div>Loading...</div>`;

    const header = this.config.layout?.header || {};
    const content = this.config.layout?.content || {};
    const footer = this.config.layout?.footer || {};

    return html`
      <div class="editor-container">
        <!-- 标题设置 -->
        <div class="form-section">
          <h3 class="section-title">🏷️ 标题设置</h3>
          
          <div class="form-group">
            <label>标题文本</label>
            <input 
              type="text" 
              .value=${header.title || ''}
              data-path="layout.header.title"
              @input=${this._valueChanged}
              placeholder="输入卡片标题"
            >
          </div>
          
          <div class="form-group">
            <label>图标</label>
            <input 
              type="text" 
              .value=${header.icon || ''}
              data-path="layout.header.icon"
              @input=${this._valueChanged}
              placeholder="mdi:home"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${header.visible !== false}
                  data-path="layout.header.visible"
                  @change=${this._valueChanged}
                >
                <label>显示标题栏</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${header.show_edit_button !== false}
                  data-path="layout.header.show_edit_button"
                  @change=${this._valueChanged}
                >
                <label>显示编辑按钮</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容设置 -->
        <div class="form-section">
          <h3 class="section-title">📊 内容设置</h3>
          
          <div class="form-group">
            <label>实体列表</label>
            <button class="button full-width secondary" @click=${this._pickEntities}>
              📋 选择实体
            </button>
            <div class="entities-preview">
              ${this._renderEntitiesPreview(content.entities)}
            </div>
          </div>
        </div>

        <!-- 页脚设置 -->
        <div class="form-section">
          <h3 class="section-title">📄 页脚设置</h3>
          
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.visible !== false}
                  data-path="layout.footer.visible"
                  @change=${this._valueChanged}
                >
                <label>显示页脚</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.show_timestamp || false}
                  data-path="layout.footer.show_timestamp"
                  @change=${this._valueChanged}
                >
                <label>显示时间戳</label>
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  .checked=${footer.show_entity_count !== false}
                  data-path="layout.footer.show_entity_count"
                  @change=${this._valueChanged}
                >
                <label>显示实体数量</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="form-section">
          <h3 class="section-title">⚡ 高级设置</h3>
          
          <div class="form-group">
            <label>刷新间隔 (秒)</label>
            <input 
              type="number" 
              .value=${this.config.refresh_interval || 30}
              data-path="refresh_interval"
              @input=${this._valueChanged}
              min="5"
              max="3600"
            >
          </div>
        </div>
      </div>
    `;
  }

  _renderEntitiesPreview(entities) {
    if (!entities || entities.length === 0) {
      return html`<div style="color: var(--disabled-text-color);">未选择实体</div>`;
    }

    return html`
      <div>已选择 ${entities.length} 个实体：</div>
      <div style="margin-top: 4px;">
        ${entities.slice(0, 3).map(entity => 
          html`<span class="entity-tag">${this._getEntityName(entity)}</span>`
        )}
        ${entities.length > 3 ? html`<span class="entity-tag">+${entities.length - 3}更多</span>` : ''}
      </div>
    `;
  }

  _getEntityName(entityId) {
    if (!this.hass) return entityId;
    const entity = this.hass.states[entityId];
    return entity?.attributes?.friendly_name || entityId;
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);