// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
  };

  static styles = [designSystem, css`
    .block-management{width:100%}
    .block-list{display:flex;flex-direction:column;gap:var(--cf-spacing-sm)}
    .block-item{display:grid;grid-template-columns:40px 50px 1fr 80px;gap:var(--cf-spacing-md);align-items:center;background:var(--cf-surface);border:2px solid transparent;border-radius:var(--cf-radius-md);padding:var(--cf-spacing-md);min-height:70px;cursor:pointer}
    .block-item.editing{border-color:var(--cf-primary-color);background:rgba(var(--cf-rgb-primary),0.05)}
    .area-badge{display:flex;align-items:center;justify-content:center}
    .area-letter{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.9em;font-weight:700;color:white}
    .area-letter.header{background:#2196F3}.area-letter.content{background:#4CAF50}.area-letter.footer{background:#FF9800}
    .block-icon{width:40px;height:40px;border-radius:var(--cf-radius-md);background:rgba(var(--cf-rgb-primary),0.1);display:flex;align-items:center;justify-content:center;font-size:1.3em}
    .block-info{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}
    .block-name{font-size:.95em;font-weight:600;color:var(--cf-text-primary);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .block-state{font-size:.8em;color:var(--cf-text-secondary);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .block-actions{display:flex;gap:var(--cf-spacing-xs);justify-content:flex-end}
    .block-action{width:36px;height:36px;border-radius:var(--cf-radius-sm);display:flex;align-items:center;justify-content:center;background:var(--cf-background);border:1px solid var(--cf-border);cursor:pointer;color:var(--cf-text-secondary)}
    .edit-form{grid-column:1 / -1;background:var(--cf-surface);border:2px solid var(--cf-primary-color);border-radius:var(--cf-radius-md);padding:var(--cf-spacing-lg);margin-top:var(--cf-spacing-md)}
    .form-grid{display:grid;grid-template-columns:80px 1fr;gap:var(--cf-spacing-md);align-items:center}
    .form-label{font-weight:500;font-size:.9em;color:var(--cf-text-primary)}
    .form-field{display:flex;gap:var(--cf-spacing-sm);align-items:center}
    .radio-group{display:flex;gap:var(--cf-spacing-md)}
    .radio-option{display:flex;align-items:center;gap:var(--cf-spacing-xs);cursor:pointer}
    .form-actions{display:flex;gap:var(--cf-spacing-sm);justify-content:flex-end;margin-top:var(--cf-spacing-lg);padding-top:var(--cf-spacing-md);border-top:1px solid var(--cf-border)}
    .action-btn{padding:var(--cf-spacing-sm) var(--cf-spacing-lg);border:1px solid var(--cf-border);border-radius:var(--cf-radius-sm);background:var(--cf-surface);color:var(--cf-text-primary);cursor:pointer;font-size:.85em;font-weight:500;min-width:80px}
    .action-btn.primary{background:var(--cf-primary-color);color:white;border-color:var(--cf-primary-color)}
    .add-block-btn{width:100%;padding:var(--cf-spacing-lg);border:2px dashed var(--cf-border);border-radius:var(--cf-radius-md);background:transparent;color:var(--cf-text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:var(--cf-spacing-sm);font-size:.95em;font-weight:500;margin-top:var(--cf-spacing-md)}
    .empty-state{text-align:center;padding:var(--cf-spacing-xl);color:var(--cf-text-secondary);border:2px dashed var(--cf-border);border-radius:var(--cf-radius-md);background:rgba(var(--cf-rgb-primary),0.02)}
  `];

  constructor() {
    super();
    this._editingBlockId = null;
    this.__entityItems = [];          // 缓存实体列表
    this.__lastStates = null;         // 缓存引用，用于比对
  }

  /* ---------- 渲染 ---------- */
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
            .items=${this._entities}               // 缓存数组，引用稳定
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

  /* ---------- 数据 ---------- */
  _getAllBlocks() {
    return this.config.blocks
      ? Object.entries(this.config.blocks).map(([id, c]) => ({ id, ...c }))
      : [];
  }

  get _entities() {
    if (this.__lastStates !== this.hass?.states) {
      this.__lastStates = this.hass.states;
      this.__entityItems = Object.keys(this.__lastStates)
        .map(id => ({
          value: id,
          label: `${this.__lastStates[id].attributes?.friendly_name || id} (${id})`
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return this.__entityItems;
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

  /* ---------- 交互 ---------- */
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