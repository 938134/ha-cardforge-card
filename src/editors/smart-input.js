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
    _inputType: { state: true },
    _previewValue: { state: true },
    _previewError: { state: true }
  };

  static styles = cardForgeStyles;

  constructor() {
    super();
    this._showEntityPicker = false;
    this._searchQuery = '';
    this._clickOutsideHandler = null;
    this._dropdownDirection = 'down';
    this._inputType = 'text';
    this._previewValue = '';
    this._previewError = false;
  }

  firstUpdated() {
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
    if (!this._previewValue && !this._previewError) {
      return '';
    }

    const previewClass = this._previewError ? 'cf-error' : 'cf-success';
    const previewIcon = this._previewError ? '❌' : '✅';

    return html`
      <div class="value-preview ${previewClass}">
        <span class="preview-label">${previewIcon} 预览:</span>
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
          <div class="templates-header">常用模板示例</div>
          <div class="templates-list">
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ states('sensor.temperature') }}")}>
              <code>{{ states('entity_id') }}</code>
              <span>获取实体状态</span>
            </div>
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ state_attr('sensor.entity_id', 'attribute_name') }}")}>
              <code>{{ state_attr('entity_id', 'attr') }}</code>
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
            <div class="template-item" @click=${() => this._insertTemplateExample("{{ is_state('sensor.motion', 'on') }}")}>
              <code>{{ is_state('entity_id', 'state') }}</code>
              <span>检查状态</span>
            </div>
            <div class="template-item" @click=${() => this._insertTemplateExample("{% if states('sensor.motion') == 'on' %}有人活动{% else %}无人{% endif %}")}>
              <code>{% if ... %}...{% else %}...{% endif %}</code>
              <span>条件判断</span>
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
      this._previewError = false;
      return;
    }

    // 检查是否是实体ID格式
    if (value.includes('.') && this.hass?.states[value] && 
        !value.includes('{{') && !value.includes('{%')) {
      this._inputType = 'entity';
      const entity = this.hass.states[value];
      this._previewValue = `${entity.state}${entity.attributes?.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}`;
      this._previewError = false;
      return;
    }

    // 检查是否是Jinja2模板
    if (value.includes('{{') || value.includes('{%')) {
      this._inputType = 'jinja';
      this._evaluateJinjaTemplate(value);
      return;
    }

    // 默认文本类型
    this._inputType = 'text';
    this._previewValue = value || '文本内容';
    this._previewError = false;
  }

  _evaluateJinjaTemplate(template) {
    try {
      let result = template;
      let hasError = false;
      
      // 1. 处理 state_attr() 函数 - 新增支持
      const stateAttrMatches = template.match(/{{\s*state_attr\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)\s*}}/g);
      if (stateAttrMatches) {
        stateAttrMatches.forEach(match => {
          const attrMatch = match.match(/state_attr\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
          if (attrMatch) {
            const entityId = attrMatch[1];
            const attribute = attrMatch[2];
            if (this.hass?.states?.[entityId]?.attributes?.[attribute]) {
              const attrValue = this.hass.states[entityId].attributes[attribute];
              result = result.replace(match, attrValue);
            } else {
              hasError = true;
              result = result.replace(match, `[属性未找到: ${entityId}.${attribute}]`);
            }
          }
        });
      }

      // 2. 处理 states() 函数
      const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
      if (stateMatches) {
        stateMatches.forEach(match => {
          const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
            const entity = this.hass.states[entityMatch[1]];
            result = result.replace(match, entity.state);
          } else {
            hasError = true;
            result = result.replace(match, `[实体未找到: ${entityMatch?.[1]}]`);
          }
        });
      }

      // 3. 处理 is_state() 函数 - 新增支持
      const isStateMatches = template.match(/{{\s*is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)\s*}}/g);
      if (isStateMatches) {
        isStateMatches.forEach(match => {
          const stateMatch = match.match(/is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
          if (stateMatch) {
            const entityId = stateMatch[1];
            const expectedState = stateMatch[2];
            if (this.hass?.states?.[entityId]) {
              const isMatch = this.hass.states[entityId].state === expectedState;
              result = result.replace(match, isMatch ? 'true' : 'false');
            } else {
              hasError = true;
              result = result.replace(match, `[实体未找到: ${entityId}]`);
            }
          }
        });
      }
      
      // 4. 处理实体属性语法 {{ states.sensor.temperature.attributes.unit_of_measurement }}
      const attrMatches = template.match(/{{\s*states\.([^.\s]+)\.([^.\s]+)\.attributes\.([^ }]+)\s*}}/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^.\s]+)\.([^.\s]+)\.attributes\.([^ }]+)/);
          if (attrMatch) {
            const entityId = `${attrMatch[1]}.${attrMatch[2]}`;
            const attribute = attrMatch[3];
            if (this.hass?.states?.[entityId]?.attributes?.[attribute]) {
              result = result.replace(match, this.hass.states[entityId].attributes[attribute]);
            } else {
              hasError = true;
              result = result.replace(match, `[属性未找到: ${entityId}.${attribute}]`);
            }
          }
        });
      }

      // 5. 处理简化的属性语法 {{ states.sensor.temperature.unit_of_measurement }}
      const simpleAttrMatches = template.match(/{{\s*states\.([^.\s]+)\.([^.\s]+)\.([^ }]+)\s*}}/g);
      if (simpleAttrMatches) {
        simpleAttrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^.\s]+)\.([^.\s]+)\.([^ }]+)/);
          if (attrMatch && attrMatch[3] !== 'attributes') {
            const entityId = `${attrMatch[1]}.${attrMatch[2]}`;
            const attribute = attrMatch[3];
            if (this.hass?.states?.[entityId]?.attributes?.[attribute]) {
              result = result.replace(match, this.hass.states[entityId].attributes[attribute]);
            } else if (this.hass?.states?.[entityId]?.state && attribute === 'state') {
              result = result.replace(match, this.hass.states[entityId].state);
            } else {
              hasError = true;
              result = result.replace(match, `[属性未找到: ${entityId}.${attribute}]`);
            }
          }
        });
      }
      
      // 6. 处理数学运算
      const mathMatches = template.match(/{{\s*([^{}]*[\d\.\s\+\-\*\/\(\)\|][^{}]*)\s*}}/g);
      if (mathMatches) {
        mathMatches.forEach(match => {
          const mathExpr = match.replace(/[{}]/g, '').trim();
          
          // 跳过已经处理过的函数调用
          if (mathExpr.includes('states(') || mathExpr.includes('state_attr(') || 
              mathExpr.includes('is_state(') || mathExpr.includes('states.')) {
            return;
          }

          try {
            // 处理过滤器
            let evalExpr = mathExpr;
            
            // 处理 round 过滤器
            const roundMatch = evalExpr.match(/(.+)\|\s*round\s*\(\s*(\d+)\s*\)/);
            if (roundMatch) {
              const baseExpr = roundMatch[1].trim();
              const decimals = parseInt(roundMatch[2]);
              const baseValue = this._safeEval(baseExpr);
              if (baseValue !== null) {
                const rounded = Math.round(baseValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                result = result.replace(match, rounded.toString());
                return;
              }
            }

            // 处理 float 过滤器
            if (evalExpr.includes('| float')) {
              evalExpr = evalExpr.replace(/\|\s*float/g, '');
            }

            // 处理 int 过滤器
            if (evalExpr.includes('| int')) {
              evalExpr = evalExpr.replace(/\|\s*int/g, '');
            }

            evalExpr = evalExpr.trim();

            // 安全评估数学表达式
            if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(evalExpr)) {
              const calcResult = this._safeEval(evalExpr);
              if (calcResult !== null) {
                result = result.replace(match, calcResult.toString());
              } else {
                hasError = true;
              }
            }
          } catch (e) {
            hasError = true;
            console.warn('数学表达式计算失败:', mathExpr, e);
          }
        });
      }
      
      // 7. 处理时间函数
      if (template.includes('now()')) {
        const now = new Date();
        const timeFormats = {
          "strftime('%H:%M')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          "strftime('%Y-%m-%d')": now.toLocaleDateString('zh-CN'),
          "strftime('%m月%d日')": `${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%Y年%m月%d日')": `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%A')": '星期' + '日一二三四五六'[now.getDay()],
          "strftime('%H:%M:%S')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        };
        
        Object.entries(timeFormats).forEach(([format, value]) => {
          if (template.includes(format)) {
            result = result.replace(`{{ now().${format} }}`, value);
          }
        });
      }

      // 8. 处理条件语句
      const ifMatches = template.match(/{%.*?%}/g);
      if (ifMatches) {
        ifMatches.forEach(match => {
          try {
            // 简单的条件判断处理
            if (match.includes("if") && match.includes("else")) {
              const conditionMatch = match.match(/if\s+([^%]+)\s*%}([^%]*){%\s*else\s*%}([^%]*){%\s*endif\s*%}/);
              if (conditionMatch) {
                const condition = conditionMatch[1].trim();
                const truePart = conditionMatch[2].trim();
                const falsePart = conditionMatch[3].trim();
                
                // 评估条件
                let conditionResult = this._evaluateCondition(condition);
                
                result = result.replace(match, conditionResult ? truePart : falsePart);
              }
            }
          } catch (e) {
            hasError = true;
            console.warn('条件语句处理失败:', match, e);
          }
        });
      }
      
      // 9. 清理剩余的模板标记
      const remainingTemplate = result.match(/{{\s*[^}]*\s*}}/g);
      if (remainingTemplate) {
        hasError = true;
        remainingTemplate.forEach(tpl => {
          result = result.replace(tpl, '[无法解析]');
        });
      }

      const remainingBlocks = result.match(/{%.*?%}/g);
      if (remainingBlocks) {
        hasError = true;
        remainingBlocks.forEach(block => {
          result = result.replace(block, '[无法解析]');
        });
      }

      this._previewValue = result || '模板解析为空';
      this._previewError = hasError;
      
    } catch (error) {
      console.error('Jinja2模板解析错误:', error);
      this._previewValue = `模板解析错误: ${error.message}`;
      this._previewError = true;
    }
  }

  _evaluateCondition(condition) {
    try {
      // 处理 == 操作符
      if (condition.includes("==")) {
        const [left, right] = condition.split("==").map(s => s.trim().replace(/'/g, "").replace(/"/g, ""));
        
        // 检查是否是实体状态比较
        if (left.includes("states(")) {
          const entityMatch = left.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
            return this.hass.states[entityMatch[1]].state === right;
          }
        }
        
        return left === right;
      }
      
      // 处理 != 操作符
      if (condition.includes("!=")) {
        const [left, right] = condition.split("!=").map(s => s.trim().replace(/'/g, "").replace(/"/g, ""));
        
        if (left.includes("states(")) {
          const entityMatch = left.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
            return this.hass.states[entityMatch[1]].state !== right;
          }
        }
        
        return left !== right;
      }
      
      // 处理 is_state() 函数
      if (condition.includes("is_state(")) {
        const stateMatch = condition.match(/is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
        if (stateMatch && this.hass?.states?.[stateMatch[1]]) {
          return this.hass.states[stateMatch[1]].state === stateMatch[2];
        }
      }
      
      return false;
    } catch (e) {
      console.warn('条件评估失败:', condition, e);
      return false;
    }
  }

  _safeEval(expr) {
    try {
      return Function(`"use strict"; return (${expr})`)();
    } catch (e) {
      console.warn('表达式计算失败:', expr, e);
      return null;
    }
  }

  _getFilteredEntities() {
    if (!this.hass) return [];
    
    const entities = Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id,
        state: stateObj.state,
        domain: entity_id.split('.')[0]
      }))
      .filter(entity => {
        if (!this._searchQuery) return true;
        const query = this._searchQuery.toLowerCase();
        return entity.entity_id.toLowerCase().includes(query) || 
               entity.friendly_name.toLowerCase().includes(query) ||
               entity.domain.toLowerCase().includes(query);
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
    
    this._analyzeInputType(this.value);
    this._notifyChange();
    
    const input = this.shadowRoot.querySelector('.smart-input-field');
    if (input) {
      input.focus();
      setTimeout(() => {
        const position = currentValue.length + 3;
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
    
    const spaceNeeded = 450;
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