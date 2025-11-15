// src/editors/smart-input.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardForgeStyles } from '../styles/index.js';

export class SmartInput extends LitElement {
  static properties = {
    hass: { type: Object },
    value: { type: String },
    placeholder: { type: String },
    _showEntityPicker: { state: true },
    _searchQuery: { state: true },
    _dropdownDirection: { state: true },
    _inputType: { state: true }, // 新增：输入类型
    _previewValue: { state: true } // 新增：预览值
  };

  static styles = cardForgeStyles;

  constructor() {
    super();
    this._showEntityPicker = false;
    this._searchQuery = '';
    this._clickOutsideHandler = null;
    this._dropdownDirection = 'down';
    this._inputType = 'text'; // text, entity, jinja
    this._previewValue = '';
  }

  firstUpdated() {
    // 初始分析输入类型
    this._analyzeInputType(this.value);
  }

  render() {
    const typeBadge = this._getTypeBadge();
    const preview = this._getPreview();
    
    return html`
      <div class="smart-input-container">
        <div class="smart-input-wrapper">
          <div class="smart-input-field-container ${this._inputType}">
            <ha-textfield
              class="smart-input-field"
              .value=${this.value}
              @input=${this._onInputChange}
              placeholder=${this.placeholder}
              outlined
              fullwidth
            ></ha-textfield>
            <div class="input-type-badge">${typeBadge}</div>
          </div>
          
          <button class="smart-input-entity-button" @click=${this._toggleEntityPicker} title="选择实体">
            🏷️
          </button>
          <button class="smart-input-template-button" @click=${this._insertTemplate} title="插入模板">
            { }
          </button>
        </div>
        
        ${preview}
        
        ${this._showEntityPicker ? this._renderEntityPicker() : ''}
      </div>
    `;
  }

  _getTypeBadge() {
    const badges = {
      'text': '📝',
      'entity': '🏷️', 
      'jinja': '🔧'
    };
    return badges[this._inputType] || '📝';
  }

  _getPreview() {
    if (!this._previewValue || this._inputType === 'text') {
      return '';
    }

    return html`
      <div class="value-preview">
        <span class="preview-label">预览:</span>
        <span class="preview-value">${this._previewValue}</span>
      </div>
    `;
  }

  _renderEntityPicker() {
    const entities = this._getFilteredEntities();
    
    return html`
      <div class="smart-input-dropdown ${this._dropdownDirection === 'up' ? 'dropdown-up' : 'dropdown-down'}">
        <div class="smart-input-picker-header">
          <span>选择实体</span>
          <small>或直接输入实体ID、Jinja2模板</small>
        </div>
        
        <div class="smart-input-search-box">
          <ha-textfield
            .label=${"搜索实体..."}
            .value=${this._searchQuery}
            @input=${e => this._onSearchChange(e.target.value)}
            @click=${this._stopPropagation}
            dense
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="smart-input-entity-list">
          ${entities.map(entity => html`
            <div class="smart-input-entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
              <div class="smart-input-entity-name">${entity.friendly_name}</div>
              <div class="smart-input-entity-id">${entity.entity_id}</div>
              <div class="smart-input-entity-state">${entity.state}</div>
            </div>
          `)}
          
          ${entities.length === 0 ? html`
            <div class="cf-flex cf-flex-center cf-p-md">
              <div class="cf-text-sm cf-text-secondary">未找到匹配的实体</div>
            </div>
          ` : ''}
        </div>

        <div class="smart-input-templates">
          <div class="templates-header">常用模板</div>
          <div class="templates-list">
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ states('sensor.temperature') }}")}>
              <code>{{ states('entity_id') }}</code>
              <span>获取实体状态</span>
            </div>
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ states.sensor.temperature.attributes.unit_of_measurement }}")}>
              <code>{{ states.entity_id.attributes.attr }}</code>
              <span>获取实体属性</span>
            </div>
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ now().strftime('%H:%M') }}")}>
              <code>{{ now().strftime('%H:%M') }}</code>
              <span>当前时间</span>
            </div>
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ (states('sensor.temp1') | float + states('sensor.temp2') | float) / 2 }}")}>
              <code>{{ (a + b) / 2 }}</code>
              <span>数学计算</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _analyzeInputType(value) {
    if (!value) {
      this._inputType = 'text';
      this._previewValue = '';
      return;
    }

    // 检查是否是实体ID格式
    if (value.includes('.') && this.hass?.states[value]) {
      this._inputType = 'entity';
      const entity = this.hass.states[value];
      this._previewValue = `${entity.state}${entity.attributes?.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}`;
      return;
    }

    // 检查是否是Jinja2模板
    if (value.includes('{{') || value.includes('{%')) {
      this._inputType = 'jinja';
      this._previewValue = this._evaluateJinjaTemplate(value);
      return;
    }

    // 默认文本类型
    this._inputType = 'text';
    this._previewValue = '';
  }

  _evaluateJinjaTemplate(template) {
    try {
      let result = template;
      
      // 处理实体状态 {{ states('sensor.temperature') }}
      const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
      if (stateMatches) {
        stateMatches.forEach(match => {
          const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
            result = result.replace(match, this.hass.states[entityMatch[1]].state);
          }
        });
      }
      
      // 处理实体属性 {{ states.sensor.temperature.attributes.unit }}
      const attrMatches = template.match(/{{\s*states\.([^ ]+)\.attributes\.([^ }]+)\s*}}/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^ ]+)\.attributes\.([^ }]+)/);
          if (attrMatch && this.hass?.states?.[attrMatch[1]]?.attributes?.[attrMatch[2]]) {
            result = result.replace(match, this.hass.states[attrMatch[1]].attributes[attrMatch[2]]);
          }
        });
      }
      
      // 处理数学运算
      const mathMatches = template.match(/{{\s*([\d\.\s\+\-\*\/\(\)]+)\s*}}/g);
      if (mathMatches) {
        mathMatches.forEach(match => {
          const mathExpr = match.replace(/[{}]/g, '').trim();
          try {
            if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(mathExpr)) {
              const calcResult = eval(mathExpr);
              result = result.replace(match, calcResult);
            }
          } catch (e) {
            console.warn('数学表达式计算失败:', mathExpr);
          }
        });
      }
      
      // 处理时间函数
      if (template.includes('now()')) {
        const now = new Date();
        const timeFormats = {
          "strftime('%H:%M')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          "strftime('%Y-%m-%d')": now.toLocaleDateString('zh-CN'),
          "strftime('%m月%d日')": `${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%Y年%m月%d日')": `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
        };
        
        Object.entries(timeFormats).forEach(([format, value]) => {
          if (template.includes(format)) {
            result = result.replace(`{{ now().${format} }}`, value);
          }
        });
      }
      
      // 清理剩余的模板标记
      result = result.replace(/{{\s*[^}]*\s*}}/g, '???');
      
      return result || '无法解析模板';
    } catch (error) {
      console.error('Jinja2模板解析错误:', error);
      return '模板解析错误';
    }
  }

  _getFilteredEntities() {
    if (!this.hass) return [];
    
    const entities = Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id,
        state: stateObj.state
      }))
      .filter(entity => {
        if (!this._searchQuery) return true;
        const query = this._searchQuery.toLowerCase();
        return entity.entity_id.toLowerCase().includes(query) || 
               entity.friendly_name.toLowerCase().includes(query);
      })
      .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));
    
    return entities.slice(0, 30);
  }

  _onInputChange(e) {
    this.value = e.target.value;
    this._analyzeInputType(this.value);
    this._notifyChange();
  }

  _toggleEntityPicker() {
    this._showEntityPicker = !this._showEntityPicker;
    this._searchQuery = '';
    
    if (this._showEntityPicker) {
      this._calculateDropdownDirection();
      this._setupClickOutsideHandler();
    } else {
      this._removeClickOutsideHandler();
    }
  }

  _insertTemplate() {
    const currentValue = this.value || '';
    const newValue = currentValue + '{{  }}';
    this.value = newValue;
    
    // 触发输入事件
    this._analyzeInputType(this.value);
    this._notifyChange();
    
    // 聚焦到输入框并将光标移到模板中间
    const input = this.shadowRoot.querySelector('.smart-input-field');
    if (input) {
      input.focus();
      // 简单的光标定位（实际实现可能需要更复杂的逻辑）
      setTimeout(() => {
        const position = currentValue.length + 3; // {{ 的位置
        input.setSelectionRange(position, position);
      }, 10);
    }
  }

  _insertTemplateExample(template) {
    this.value = template;
    this._analyzeInputType(this.value);
    this._notifyChange();
    this._showEntityPicker = false;
    this._removeClickOutsideHandler();
  }

  _calculateDropdownDirection() {
    const rect = this.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const spaceNeeded = 400; // 增加空间以容纳模板示例
    const spaceBelow = viewportHeight - rect.bottom;
    
    if (spaceBelow < spaceNeeded && rect.top > spaceNeeded) {
      this._dropdownDirection = 'up';
    } else {
      this._dropdownDirection = 'down';
    }
  }

  _selectEntity(entityId) {
    this.value = entityId;
    this._analyzeInputType(this.value);
    this._showEntityPicker = false;
    this._removeClickOutsideHandler();
    this._notifyChange();
  }

  _onSearchChange(query) {
    this._searchQuery = query;
  }

  _stopPropagation(e) {
    e.stopPropagation();
  }

  _setupClickOutsideHandler() {
    setTimeout(() => {
      this._clickOutsideHandler = (e) => {
        if (!this.contains(e.target)) {
          this._showEntityPicker = false;
          this._removeClickOutsideHandler();
          this.requestUpdate();
        }
      };
      document.addEventListener('click', this._clickOutsideHandler);
      document.addEventListener('touchstart', this._clickOutsideHandler);
    }, 0);
  }

  _removeClickOutsideHandler() {
    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      document.removeEventListener('touchstart', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: this.value }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('value')) {
      this._analyzeInputType(this.value);
    }
    if (changedProperties.has('hass') && this.value) {
      this._analyzeInputType(this.value);
    }
  }

  disconnectedCallback() {
    this._removeClickOutsideHandler();
    super.disconnectedCallback();
  }
}

if (!customElements.get('smart-input')) {
  customElements.define('smart-input', SmartInput);
}