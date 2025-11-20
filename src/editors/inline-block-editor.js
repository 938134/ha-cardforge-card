// src/editors/inline-block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class InlineBlockEditor extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    onSave: { type: Object },
    onDelete: { type: Object },
    onCancel: { type: Object }
  };

  static styles = [
    foundationStyles,
    css`
      .inline-editor {
        background: var(--cf-surface);
        border: 2px solid var(--cf-primary-color);
        border-radius: var(--cf-radius-lg);
        padding: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-md);
        box-shadow: var(--cf-shadow-md);
        position: relative;
      }

      .editor-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
        padding-bottom: var(--cf-spacing-md);
        border-bottom: 1px solid var(--cf-border);
      }

      .editor-icon {
        font-size: 1.5em;
        color: var(--cf-primary-color);
      }

      .editor-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .section-icon {
        font-size: 1.1em;
        opacity: 0.7;
      }

      .form-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: var(--cf-spacing-md);
        align-items: start;
      }

      .form-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        padding-top: var(--cf-spacing-sm);
      }

      .form-control {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .form-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .action-btn {
        padding: var(--cf-spacing-sm) var(--cf-spacing-lg);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        min-width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xs);
      }

      .action-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn.primary:hover:not(:disabled) {
        background: var(--cf-primary-color);
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .action-btn.delete {
        background: var(--cf-error-color);
        color: white;
        border-color: var(--cf-error-color);
        margin-right: auto;
      }

      .action-btn.delete:hover:not(:disabled) {
        background: var(--cf-error-color);
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .action-btn:hover:not(:disabled) {
        background: var(--cf-background);
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .action-btn:active:not(:disabled) {
        transform: translateY(0);
      }

      /* 颜色选择器样式 */
      .color-preview {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        border: 2px solid var(--cf-border);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .color-preview:hover {
        border-color: var(--cf-primary-color);
        transform: scale(1.1);
      }

      .color-inputs {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
      }

      /* 实体预览 */
      .entity-preview {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
      }

      .preview-title {
        font-size: 0.8em;
        font-weight: 600;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .preview-content {
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      /* 响应式设计 */
      @media (max-width: 600px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .form-label {
          padding-top: 0;
        }

        .form-actions {
          flex-direction: column;
        }

        .action-btn.delete {
          margin-right: 0;
          order: 1;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .inline-editor {
          background: var(--cf-dark-surface);
          border-color: var(--cf-primary-color);
        }

        .entity-preview {
          background: rgba(var(--cf-rgb-primary), 0.1);
          border-color: var(--cf-dark-border);
        }
      }

      .cf-dark-mode .inline-editor {
        background: var(--cf-dark-surface) !important;
        border-color: var(--cf-primary-color) !important;
      }

      .cf-dark-mode .entity-preview {
        background: rgba(var(--cf-rgb-primary), 0.1) !important;
        border-color: var(--cf-dark-border) !important;
      }
    `
  ];

  constructor() {
    super();
    this.block = {
      id: '',
      type: 'text',
      content: '',
      config: {}
    };
    this.availableEntities = [];
    this.onSave = () => {};
    this.onDelete = () => {};
    this.onCancel = () => {};
  }

  render() {
    const blockTypes = [
      { value: 'text', label: '文本块', icon: 'mdi:format-text' },
      { value: 'sensor', label: '传感器', icon: 'mdi:gauge' },
      { value: 'weather', label: '天气', icon: 'mdi:weather-cloudy' },
      { value: 'switch', label: '开关', icon: 'mdi:power' },
      { value: 'light', label: '灯光', icon: 'mdi:lightbulb' },
      { value: 'climate', label: '气候', icon: 'mdi:thermostat' }
    ];

    const currentBlockType = blockTypes.find(t => t.value === this.block.type) || blockTypes[0];

    return html`
      <div class="inline-editor">
        <div class="editor-header">
          <ha-icon class="editor-icon" .icon=${currentBlockType.icon}></ha-icon>
          <div class="editor-title">编辑 ${currentBlockType.label}</div>
        </div>

        <div class="editor-form">
          <!-- 基础设置 -->
          <div class="form-section">
            <div class="section-title">
              <ha-icon class="section-icon" icon="mdi:cog"></ha-icon>
              基础设置
            </div>
            
            <div class="form-row">
              <label class="form-label">内容类型</label>
              <div class="form-control">
                <ha-combo-box
                  .items=${blockTypes.map(t => ({ value: t.value, label: t.label }))}
                  .value=${this.block.type || 'text'}
                  @value-changed=${e => this._updateBlock('type', e.detail.value)}
                  label="选择类型"
                  fullwidth
                ></ha-combo-box>
                <div class="cf-text-xs cf-text-secondary">
                  ${this._getTypeDescription(this.block.type)}
                </div>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label">${this._getContentLabel()}</label>
              <div class="form-control">
                ${this._renderContentField()}
                ${this._renderEntityPreview()}
              </div>
            </div>
          </div>

          <!-- 样式设置 -->
          ${this._renderStyleSection()}

          <!-- 高级设置 -->
          ${this.block.type !== 'text' ? this._renderAdvancedSection() : ''}

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button class="action-btn delete" @click=${this._onDelete} title="删除此内容块">
              <ha-icon icon="mdi:delete"></ha-icon>
              删除
            </button>
            <button class="action-btn" @click=${this._onCancel} title="取消编辑">
              <ha-icon icon="mdi:close"></ha-icon>
              取消
            </button>
            <button class="action-btn primary" @click=${this._onSave} title="保存更改">
              <ha-icon icon="mdi:check"></ha-icon>
              保存
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _getTypeDescription(type) {
    const descriptions = {
      'text': '显示静态文本内容',
      'sensor': '显示传感器数值和状态',
      'weather': '显示天气信息和预报',
      'switch': '控制开关设备',
      'light': '控制灯光设备和亮度',
      'climate': '显示和控制温控设备'
    };
    return descriptions[type] || '显示内容块';
  }

  _getContentLabel() {
    const labels = {
      'text': '文本内容',
      'sensor': '传感器实体',
      'weather': '天气实体',
      'switch': '开关实体',
      'light': '灯光实体',
      'climate': '气候实体'
    };
    return labels[this.block.type] || '内容';
  }

  _renderContentField() {
    if (this.block.type === 'text') {
      return html`
        <ha-textarea
          .value=${this.block.content || ''}
          @input=${e => this._updateBlock('content', e.target.value)}
          label="输入文本内容"
          rows="3"
          placeholder="请输入要显示的文本内容..."
          auto-grow
          fullwidth
        ></ha-textarea>
      `;
    } else {
      return html`
        <ha-combo-box
          .items=${this.availableEntities}
          .value=${this.block.content || ''}
          @value-changed=${e => this._updateBlock('content', e.detail.value)}
          label="选择实体"
          placeholder="搜索或选择实体..."
          allow-custom-value
          fullwidth
        ></ha-combo-box>
      `;
    }
  }

  _renderEntityPreview() {
    if (this.block.type === 'text' || !this.block.content || !this.hass) {
      return '';
    }

    const entity = this.hass.states[this.block.content];
    if (!entity) {
      return html`
        <div class="entity-preview">
          <div class="preview-title">实体状态</div>
          <div class="preview-content cf-error">实体未找到或不可用</div>
        </div>
      `;
    }

    return html`
      <div class="entity-preview">
        <div class="preview-title">实体状态</div>
        <div class="preview-content">
          <strong>状态:</strong> ${entity.state}<br>
          ${entity.attributes?.friendly_name ? 
            html`<strong>名称:</strong> ${entity.attributes.friendly_name}<br>` : ''}
          ${entity.attributes?.unit_of_measurement ? 
            html`<strong>单位:</strong> ${entity.attributes.unit_of_measurement}` : ''}
        </div>
      </div>
    `;
  }

  _renderStyleSection() {
    return html`
      <div class="form-section">
        <div class="section-title">
          <ha-icon class="section-icon" icon="mdi:palette"></ha-icon>
          样式设置
        </div>

        <div class="form-row">
          <label class="form-label">背景颜色</label>
          <div class="form-control">
            <div class="color-inputs">
              <ha-textfield
                .value=${this.block.config?.background || ''}
                @input=${e => this._updateConfig('background', e.target.value)}
                label="背景颜色"
                placeholder="#f0f0f0 或 transparent"
                fullwidth
              ></ha-textfield>
              <div 
                class="color-preview"
                style="background: ${this.block.config?.background || 'var(--cf-surface)'}"
                @click=${this._openColorPicker('background')}
                title="选择颜色"
              ></div>
            </div>
            <div class="cf-text-xs cf-text-secondary">
              支持颜色值、渐变或 transparent
            </div>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">文字颜色</label>
          <div class="form-control">
            <div class="color-inputs">
              <ha-textfield
                .value=${this.block.config?.textColor || ''}
                @input=${e => this._updateConfig('textColor', e.target.value)}
                label="文字颜色"
                placeholder="#333333 或 inherit"
                fullwidth
              ></ha-textfield>
              <div 
                class="color-preview"
                style="background: ${this.block.config?.textColor || 'var(--cf-text-primary)'}"
                @click=${this._openColorPicker('textColor')}
                title="选择颜色"
              ></div>
            </div>
            <div class="cf-text-xs cf-text-secondary">
              支持颜色值或 inherit（继承主题）
            </div>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">文字大小</label>
          <div class="form-control">
            <ha-combo-box
              .items=${[
                { value: 'small', label: '较小' },
                { value: 'normal', label: '正常' },
                { value: 'large', label: '较大' },
                { value: 'xlarge', label: '超大' }
              ]}
              .value=${this.block.config?.fontSize || 'normal'}
              @value-changed=${e => this._updateConfig('fontSize', e.detail.value)}
              label="文字大小"
              fullwidth
            ></ha-combo-box>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">对齐方式</label>
          <div class="form-control">
            <ha-combo-box
              .items=${[
                { value: 'left', label: '左对齐' },
                { value: 'center', label: '居中' },
                { value: 'right', label: '右对齐' }
              ]}
              .value=${this.block.config?.textAlign || 'center'}
              @value-changed=${e => this._updateConfig('textAlign', e.detail.value)}
              label="对齐方式"
              fullwidth
            ></ha-combo-box>
          </div>
        </div>
      </div>
    `;
  }

  _renderAdvancedSection() {
    return html`
      <div class="form-section">
        <div class="section-title">
          <ha-icon class="section-icon" icon="mdi:chip"></ha-icon>
          高级设置
        </div>

        <div class="form-row">
          <label class="form-label">显示图标</label>
          <div class="form-control">
            <ha-textfield
              .value=${this.block.config?.icon || ''}
              @input=${e => this._updateConfig('icon', e.target.value)}
              label="图标名称"
              placeholder="mdi:home 或 表情符号"
              fullwidth
            ></ha-textfield>
            <div class="cf-text-xs cf-text-secondary">
              支持 Material Design Icons 或表情符号
            </div>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">显示单位</label>
          <div class="form-control">
            <ha-textfield
              .value=${this.block.config?.unit || ''}
              @input=${e => this._updateConfig('unit', e.target.value)}
              label="数值单位"
              placeholder="℃, %, kW 等"
              fullwidth
            ></ha-textfield>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">数值精度</label>
          <div class="form-control">
            <ha-textfield
              .value=${this.block.config?.precision ?? ''}
              @input=${e => this._updateConfig('precision', e.target.value ? parseInt(e.target.value) : null)}
              label="小数位数"
              type="number"
              min="0"
              max="6"
              placeholder="自动"
              fullwidth
            ></ha-textfield>
            <div class="cf-text-xs cf-text-secondary">
              留空则使用实体默认精度
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _updateBlock(key, value) {
    const oldBlock = { ...this.block };
    this.block = {
      ...this.block,
      [key]: value
    };
    
    // 当类型改变时智能重置配置
    if (key === 'type' && value !== oldBlock.type) {
      this.block.config = this._getDefaultConfigForType(value, oldBlock.config);
    }

    this.requestUpdate();
  }

  _updateConfig(key, value) {
    this.block.config = {
      ...this.block.config,
      [key]: value
    };
    this.requestUpdate();
  }

  _getDefaultConfigForType(newType, oldConfig) {
    const baseConfig = {
      // 保留通用的样式配置
      background: oldConfig?.background,
      textColor: oldConfig?.textColor,
      fontSize: oldConfig?.fontSize || 'normal',
      textAlign: oldConfig?.textAlign || 'center'
    };

    // 根据类型添加特定配置
    const typeSpecificConfigs = {
      sensor: {
        icon: oldConfig?.icon || 'mdi:gauge',
        unit: oldConfig?.unit || '',
        precision: oldConfig?.precision ?? null
      },
      weather: {
        icon: oldConfig?.icon || 'mdi:weather-cloudy',
        unit: oldConfig?.unit || '',
        showForecast: oldConfig?.showForecast ?? true
      },
      switch: {
        icon: oldConfig?.icon || 'mdi:power',
        showState: oldConfig?.showState ?? true
      },
      light: {
        icon: oldConfig?.icon || 'mdi:lightbulb',
        showBrightness: oldConfig?.showBrightness ?? true
      },
      climate: {
        icon: oldConfig?.icon || 'mdi:thermostat',
        showMode: oldConfig?.showMode ?? true,
        showTemperature: oldConfig?.showTemperature ?? true
      }
    };

    return {
      ...baseConfig,
      ...typeSpecificConfigs[newType]
    };
  }

  _openColorPicker(configKey) {
    return () => {
      // 这里可以集成颜色选择器
      // 暂时使用简单的提示
      alert('颜色选择器功能待实现。请手动输入颜色值，如：#ff0000、rgb(255,0,0) 或 transparent。');
    };
  }

  _onSave() {
    // 验证必要字段
    if (!this.block.type) {
      alert('请选择内容类型');
      return;
    }

    if (this.block.type === 'text' && !this.block.content.trim()) {
      alert('请输入文本内容');
      return;
    }

    if (this.block.type !== 'text' && !this.block.content) {
      alert('请选择实体');
      return;
    }

    this.onSave(this.block);
  }

  _onDelete() {
    if (confirm('确定要删除这个内容块吗？此操作不可撤销。')) {
      this.onDelete(this.block.id);
    }
  }

  _onCancel() {
    this.onCancel();
  }

  // 监听外部数据变化
  updated(changedProperties) {
    if (changedProperties.has('hass') && this.block.content && this.block.type !== 'text') {
      // 当 hass 数据更新时，重新请求更新以刷新实体预览
      this.requestUpdate();
    }
  }
}

if (!customElements.get('inline-block-editor')) {
  customElements.define('inline-block-editor', InlineBlockEditor);
}