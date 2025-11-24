// src/blocks/types/text-block.js
import { BaseBlock } from '../base-block.js';

class TextBlock extends BaseBlock {
  static blockType = 'text';
  static blockName = '文本';
  static blockIcon = 'mdi:text';
  static category = 'basic';
  static description = '显示文本内容';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    
    if (!config.content) {
      return this._renderEmpty('请输入文本内容');
    }

    return this._renderContainer(`
      ${this._renderHeader(config.title)}
      <div class="text-content cf-flex cf-flex-center" style="
        text-align: ${config.alignment};
        font-size: ${config.fontSize};
        color: ${config.textColor || 'var(--cf-text-primary)'};
      ">
        ${this._escapeHtml(config.content)}
      </div>
    `, 'text-block');
  }

  getStyles(block) {
    return `
      .text-block .text-content {
        flex: 1;
        padding: var(--cf-spacing-sm);
        line-height: 1.4;
      }
      
      .text-block.empty .text-content {
        opacity: 0.5;
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="form-field">
          <label class="form-label">内容</label>
          <ha-textarea
            .value="${config.content || ''}"
            @input="${e => onConfigChange('content', e.target.value)}"
            placeholder="输入文本内容..."
            rows="3"
            fullwidth
          ></ha-textarea>
        </div>
        
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">对齐方式</label>
            <ha-select
              .value="${config.alignment}"
              @closed="${e => e.stopPropagation()}"
              naturalMenuWidth
              fixedMenuPosition
              fullwidth
            >
              <ha-list-item value="left" @click="${() => onConfigChange('alignment', 'left')}">左对齐</ha-list-item>
              <ha-list-item value="center" @click="${() => onConfigChange('alignment', 'center')}">居中</ha-list-item>
              <ha-list-item value="right" @click="${() => onConfigChange('alignment', 'right')}">右对齐</ha-list-item>
            </ha-select>
          </div>
          
          <div class="form-field">
            <label class="form-label">字体大小</label>
            <ha-select
              .value="${config.fontSize}"
              @closed="${e => e.stopPropagation()}"
              naturalMenuWidth
              fixedMenuPosition
              fullwidth
            >
              <ha-list-item value="0.9em" @click="${() => onConfigChange('fontSize', '0.9em')}">小</ha-list-item>
              <ha-list-item value="1em" @click="${() => onConfigChange('fontSize', '1em')}">中</ha-list-item>
              <ha-list-item value="1.2em" @click="${() => onConfigChange('fontSize', '1.2em')}">大</ha-list-item>
              <ha-list-item value="1.5em" @click="${() => onConfigChange('fontSize', '1.5em')}">特大</ha-list-item>
            </ha-select>
          </div>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      title: '',
      content: '',
      alignment: 'center',
      fontSize: '1em',
      textColor: ''
    };
  }

  validateConfig(config) {
    const errors = [];
    if (!config.content?.trim()) {
      errors.push('内容不能为空');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:format-text" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'text-block empty');
  }
}

export default TextBlock;