// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
  };

  static styles = [
    designSystem,
    css`
      .block-management{width:100%}
      
      /* 块列表 - 更紧凑的间距 */
      .block-list{
        display:flex;
        flex-direction:column;
        gap: 6px;  /* 从 var(--cf-spacing-xs) 改为 6px */
      }
      
      /* 块项 - 更紧凑的布局 */
      .block-item{
        display:grid;
        grid-template-columns: 36px 40px 1fr 70px;  /* 缩小列宽 */
        gap: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        align-items:center;
        background:var(--cf-surface);
        border:1px solid var(--cf-border);
        border-radius:var(--cf-radius-md);
        padding: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        min-height: 52px;  /* 从 60px 改为 52px */
        cursor:pointer;
        transition: all var(--cf-transition-fast);
      }
      
      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
      
      .block-item.editing{
        border-color:var(--cf-primary-color);
        background:rgba(var(--cf-rgb-primary),0.05);
      }
      
      /* 区域徽章 - 更小 */
      .area-badge{
        display:flex;
        align-items:center;
        justify-content:center;
      }
      
      .area-letter{
        width: 28px;  /* 从 32px 改为 28px */
        height: 28px;  /* 从 32px 改为 28px */
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:0.8em;  /* 从 0.9em 改为 0.8em */
        font-weight:700;
        color:white;
      }
      
      .area-letter.header{background:#2196F3}
      .area-letter.content{background:#4CAF50}
      .area-letter.footer{background:#FF9800}
      
      /* 块图标 - 更小 */
      .block-icon{
        width: 36px;  /* 从 40px 改为 36px */
        height: 36px;  /* 从 40px 改为 36px */
        border-radius:var(--cf-radius-md);
        background:rgba(var(--cf-rgb-primary),0.1);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:1.1em;  /* 从 1.3em 改为 1.1em */
      }
      
      /* 块信息 - 更紧凑 */
      .block-info{
        display:flex;
        flex-direction:column;
        gap: 2px;  /* 从 4px 改为 2px */
        min-width:0;
        flex:1;
      }
      
      .block-name{
        font-size:0.9em;  /* 保持 0.9em */
        font-weight:600;
        color:var(--cf-text-primary);
        line-height:1.2;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      
      .block-state{
        font-size:0.75em;  /* 从 0.8em 改为 0.75em */
        color:var(--cf-text-secondary);
        line-height:1.2;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      
      /* 块操作 - 更小 */
      .block-actions{
        display:flex;
        gap: 4px;  /* 从 var(--cf-spacing-xs) 改为 4px */
        justify-content:flex-end;
      }
      
      .block-action{
        width: 32px;  /* 从 36px 改为 32px */
        height: 32px;  /* 从 36px 改为 32px */
        border-radius:var(--cf-radius-sm);
        display:flex;
        align-items:center;
        justify-content:center;
        background:var(--cf-background);
        border:1px solid var(--cf-border);
        cursor:pointer;
        color:var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
      }
      
      .block-action:hover {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
        color: white;
      }
      
      /* 编辑表单 - 更紧凑 */
      .edit-form{
        grid-column:1 / -1;
        background:var(--cf-surface);
        border:1px solid var(--cf-primary-color);
        border-radius:var(--cf-radius-md);
        padding: 12px;  /* 从 var(--cf-spacing-md) 改为 12px */
        margin-top: 6px;  /* 从 var(--cf-spacing-xs) 改为 6px */
      }
      
      .form-grid{
        display:grid;
        grid-template-columns: 70px 1fr;  /* 从 80px 1fr 改为 70px 1fr */
        gap: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        align-items:center;
      }
      
      .form-label{
        font-weight:500;
        font-size:0.85em;  /* 从 0.9em 改为 0.85em */
        color:var(--cf-text-primary);
      }
      
      .form-field{
        display:flex;
        gap: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        align-items:center;
      }
      
      .radio-group{
        display:flex;
        gap: 12px;  /* 从 var(--cf-spacing-md) 改为 12px */
      }
      
      .radio-option{
        display:flex;
        align-items:center;
        gap: 6px;  /* 从 var(--cf-spacing-xs) 改为 6px */
        cursor:pointer;
      }
      
      .form-actions{
        display:flex;
        gap: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        justify-content:flex-end;
        margin-top: 12px;  /* 从 var(--cf-spacing-md) 改为 12px */
        padding-top: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        border-top:1px solid var(--cf-border);
      }
      
      .action-btn{
        padding: 6px 12px;  /* 从 var(--cf-spacing-sm) var(--cf-spacing-md) 改为 6px 12px */
        border:1px solid var(--cf-border);
        border-radius:var(--cf-radius-sm);
        background:var(--cf-surface);
        color:var(--cf-text-primary);
        cursor:pointer;
        font-size:0.8em;  /* 从 0.85em 改为 0.8em */
        font-weight:500;
        min-width: 60px;  /* 从 80px 改为 60px */
        transition: all var(--cf-transition-fast);
      }
      
      .action-btn:hover {
        background: var(--cf-background);
      }
      
      .action-btn.primary{
        background:var(--cf-primary-color);
        color:white;
        border-color:var(--cf-primary-color);
      }
      
      .action-btn.primary:hover {
        background: var(--cf-primary-color);
        opacity: 0.9;
      }
      
      /* 添加块按钮 - 更紧凑 */
      .add-block-btn{
        width:100%;
        padding: 10px;  /* 从 var(--cf-spacing-md) 改为 10px */
        border:1px dashed var(--cf-border);
        border-radius:var(--cf-radius-md);
        background:transparent;
        color:var(--cf-text-secondary);
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        gap: 6px;  /* 从 var(--cf-spacing-sm) 改为 6px */
        font-size:0.9em;  /* 从 0.95em 改为 0.9em */
        font-weight:500;
        margin-top: 8px;  /* 从 var(--cf-spacing-sm) 改为 8px */
        transition: all var(--cf-transition-fast);
      }
      
      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      /* 空状态 - 更紧凑 */
      .empty-state{
        text-align:center;
        padding: 16px;  /* 从 var(--cf-spacing-lg) 改为 16px */
        color:var(--cf-text-secondary);
        border:1px dashed var(--cf-border);
        border-radius:var(--cf-radius-md);
        background:rgba(var(--cf-rgb-primary),0.02);
      }
      
      .empty-icon {
        font-size: 1.5em;  /* 从 2em 改为 1.5em */
        opacity: 0.5;
        margin-bottom: 8px;  /* 从 var(--cf-spacing-md) 改为 8px */
      }
    `,
  ];

  constructor() {
    super();
    this._editingBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    return blocks.length
      ? html`
          <div class="block-management">
            <div class="block-list">${blocks.map(b => this._renderBlock(b))}</div>
            <button class="add-block-btn" @click=${this._addBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>添加新块
            </button>
          </div>`
      : html`
          <div class="empty-state">
            <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
            <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
            <button class="add-block-btn" @click=${this._addBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>添加第一个块
            </button>
          </div>`;
  }

  _renderBlock(block) {
    const isEditing = this._editingBlockId === block.id;
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}">
        <div class="area-badge">
          <div class="area-letter ${block.area || 'content'}">
            ${block.area === 'header' ? 'H' : block.area === 'footer' ? 'F' : 'C'}
          </div>
        </div>
        <div class="block-icon">
          <ha-icon .icon=${block.icon || this._defaultIcon(block)}></ha-icon>
        </div>
        <div class="block-info">
          <div class="block-name">${this._blockName(block)}</div>
          <div class="block-state">${this._blockState(block)}</div>
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${() => this._startEdit(block.id)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action" @click=${() => this._deleteBlock(block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
        ${isEditing ? this._editForm(block) : ''}
      </div>`;
  }

  _editForm(block) {
    return html`
      <div class="edit-form">
        <div class="form-grid">
          <div class="form-label">区域</div>
          <div class="radio-group">
            ${['header', 'content', 'footer'].map(a => html`
              <label class="radio-option">
                <input type="radio" name="area" value=${a}
                  ?checked=${(block.area || 'content') === a}
                  @change=${e => this._patchBlock(block.id, { area: e.target.value })}>
                ${a === 'header' ? '标题' : a === 'footer' ? '页脚' : '内容'}
              </label>`)}
          </div>

          <div class="form-label">实体</div>
          <ha-combo-box
            .items=${this._entities}
            .value=${block.entity || ''}
            @value-changed=${e => this._handleEntityPick(block.id, e.detail.value)}
            allow-custom-value
            label="选择实体">
          </ha-combo-box>

          <div class="form-label">图标</div>
          <ha-icon-picker
            .value=${block.icon || ''}
            @value-changed=${e => this._patchBlock(block.id, { icon: e.detail.value })}
            label="选择图标">
          </ha-icon-picker>

          <div class="form-label">内容</div>
          <ha-textfield
            .value=${block.content || ''}
            @input=${e => this._patchBlock(block.id, { content: e.target.value })}
            placeholder="输入显示内容"
            fullwidth>
          </ha-textfield>
        </div>

        <div class="form-actions">
          <button class="action-btn" @click=${this._cancelEdit}>取消</button>
          <button class="action-btn primary" @click=${this._finishEdit}>保存</button>
        </div>
      </div>`;
  }

  _getAllBlocks() {
    return this.config.blocks
      ? Object.entries(this.config.blocks).map(([id, c]) => ({ id, ...c }))
      : [];
  }

  get _entities() {
    if (!this.hass?.states) return [];
    return Object.entries(this.hass.states)
      .map(([id, st]) => ({
        value: id,
        label: `${st.attributes?.friendly_name || id} (${id})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _blockName(b) {
    if (b.entity && this.hass?.states[b.entity])
      return this.hass.states[b.entity].attributes?.friendly_name || '实体块';
    if (b.content) return String(b.content).substring(0, 15) + (String(b.content).length > 15 ? '…' : '');
    return '内容块';
  }

  _blockState(b) {
    if (b.entity && this.hass?.states[b.entity]) {
      const st = this.hass.states[b.entity];
      const u = st.attributes?.unit_of_measurement || '';
      return `${st.state}${u ? ' ' + u : ''}`;
    }
    if (b.content) return String(b.content).substring(0, 30) + (String(b.content).length > 30 ? '…' : '');
    return '点击配置';
  }

  _defaultIcon(b) {
    if (!b.entity) return 'mdi:text-box';
    const domain = b.entity.split('.')[0];
    const map = { light: 'mdi:lightbulb', switch: 'mdi:power', sensor: 'mdi:gauge', binary_sensor: 'mdi:checkbox-marked-circle-outline', climate: 'mdi:thermostat' };
    return map[domain] || 'mdi:cube';
  }

  _startEdit(blockId) {
    this._editingBlockId = blockId;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _finishEdit() {
    this._editingBlockId = null;
  }

  _patchBlock(blockId, delta) {
    const newBlocks = { ...this.config.blocks, [blockId]: { ...this.config.blocks[blockId], ...delta } };
    this._fireConfig({ ...this.config, blocks: newBlocks });
  }

  _handleEntityPick(blockId, entityId) {
    if (!entityId || !this.hass?.states[entityId]) return this._patchBlock(blockId, { entity: entityId });
    const st = this.hass.states[entityId];
    const patch = { entity: entityId };
    if (st.attributes?.icon) patch.icon = st.attributes.icon;
    const u = st.attributes?.unit_of_measurement || '';
    patch.content = `${st.state}${u ? ' ' + u : ''}`;
    this._patchBlock(blockId, patch);
  }

  _addBlock() {
    const id = `block_${Date.now()}`;
    const block = { area: 'content', entity: '', icon: 'mdi:text-box', content: '请配置内容…' };
    this._fireConfig({ ...this.config, blocks: { ...this.config.blocks, [id]: block } });
    this._editingBlockId = id;
  }

  _deleteBlock(blockId) {
    if (!confirm('确定要删除这个块吗？')) return;
    const { [blockId]: _, ...rest } = this.config.blocks;
    this._fireConfig({ ...this.config, blocks: rest });
    if (this._editingBlockId === blockId) this._editingBlockId = null;
  }

  _fireConfig(newConfig) {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig } }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}
export { BlockManagement };