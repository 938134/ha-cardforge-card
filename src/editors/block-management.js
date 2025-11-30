// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';

class BlockManagement extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    _editingBlockId: { state: true },
    _hoverBlockId: { state: true },
  };

  static styles = [
    designSystem,
    css`
      .block-management{width:100%}
      
      /* 块列表 - 更紧凑的间距 */
      .block-list{
        display:flex;
        flex-direction:column;
        gap: 6px;
      }
      
      /* 块项 - 更紧凑的布局 */
      .block-item{
        display:grid;
        grid-template-columns: 36px 40px 1fr;
        gap: 8px;
        align-items:center;
        background:var(--cf-surface);
        border:1px solid var(--cf-border);
        border-radius:var(--cf-radius-md);
        padding: 8px;
        min-height: 52px;
        cursor:pointer;
        transition: all var(--cf-transition-fast);
        position: relative;
      }
      
      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
      
      .block-item:hover .block-actions {
        opacity: 1;
        visibility: visible;
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
        width: 28px;
        height: 28px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:0.8em;
        font-weight:700;
        color:white;
      }
      
      .area-letter.header{background:#2196F3}
      .area-letter.content{background:#4CAF50}
      .area-letter.footer{background:#FF9800}
      
      /* 块图标 - 更小 */
      .block-icon{
        width: 36px;
        height: 36px;
        border-radius:var(--cf-radius-md);
        background:rgba(var(--cf-rgb-primary),0.1);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:1.1em;
      }
      
      /* 块信息 - 更紧凑 */
      .block-info{
        display:flex;
        flex-direction:column;
        gap: 2px;
        min-width:0;
        flex:1;
      }
      
      .block-name{
        font-size:0.9em;
        font-weight:600;
        color:var(--cf-text-primary);
        line-height:1.2;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      
      .block-state{
        font-size:0.75em;
        color:var(--cf-text-secondary);
        line-height:1.2;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      
      /* 块操作 - 悬停显示 */
      .block-actions{
        position: absolute;
        top: 8px;
        right: 8px;
        display:flex;
        gap: 4px;
        opacity: 0;
        visibility: hidden;
        transition: all var(--cf-transition-fast);
      }
      
      .block-action{
        width: 28px;
        height: 28px;
        border-radius:var(--cf-radius-sm);
        display:flex;
        align-items:center;
        justify-content:center;
        background:var(--cf-background);
        border:1px solid var(--cf-border);
        cursor:pointer;
        color:var(--cf-text-secondary);
        transition: all var(--cf-transition-fast);
        font-size: 0.8em;
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
        padding: 12px;
        margin-top: 6px;
      }
      
      .form-grid{
        display:grid;
        grid-template-columns: 70px 1fr;
        gap: 8px;
        align-items:center;
      }
      
      .form-label{
        font-weight:500;
        font-size:0.85em;
        color:var(--cf-text-primary);
      }
      
      .form-field{
        display:flex;
        gap: 8px;
        align-items:center;
      }
      
      .radio-group{
        display:flex;
        gap: 12px;
      }
      
      .radio-option{
        display:flex;
        align-items:center;
        gap: 6px;
        cursor:pointer;
      }
      
      .form-actions{
        display:flex;
        gap: 8px;
        justify-content:flex-end;
        margin-top: 12px;
        padding-top: 8px;
        border-top:1px solid var(--cf-border);
      }
      
      .action-btn{
        padding: 6px 12px;
        border:1px solid var(--cf-border);
        border-radius:var(--cf-radius-sm);
        background:var(--cf-surface);
        color:var(--cf-text-primary);
        cursor:pointer;
        font-size:0.8em;
        font-weight:500;
        min-width: 60px;
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
      
      /* 添加块按钮 - 动态显示 */
      .add-block-btn{
        width:100%;
        padding: 10px;
        border:1px dashed var(--cf-border);
        border-radius:var(--cf-radius-md);
        background:transparent;
        color:var(--cf-text-secondary);
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        gap: 6px;
        font-size:0.9em;
        font-weight:500;
        margin-top: 8px;
        transition: all var(--cf-transition-fast);
      }
      
      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .add-block-btn.hidden {
        display: none;
      }
      
      /* 空状态 - 更紧凑 */
      .empty-state{
        text-align:center;
        padding: 16px;
        color:var(--cf-text-secondary);
        border:1px dashed var(--cf-border);
        border-radius:var(--cf-radius-md);
        background:rgba(var(--cf-rgb-primary),0.02);
      }
      
      .empty-icon {
        font-size: 1.5em;
        opacity: 0.5;
        margin-bottom: 8px;
      }
    `,
  ];

  constructor() {
    super();
    this._editingBlockId = null;
    this._hoverBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    const blockCount = blocks.length;
    
    // 根据块数量决定显示逻辑
    if (blockCount === 0) {
      return this._renderEmptyState(true); // 无块卡片
    }
    
    return html`
      <div class="block-management">
        <div class="block-list">${blocks.map(b => this._renderBlock(b))}</div>
        ${this._shouldShowAddButton() ? this._renderAddButton() : ''}
      </div>`;
  }

  _renderBlock(block) {
    const isEditing = this._editingBlockId === block.id;
    const isHovering = this._hoverBlockId === block.id;
    
    return html`
      <div class="block-item ${isEditing ? 'editing' : ''}"
           @mouseenter=${() => this._hoverBlockId = block.id}
           @mouseleave=${() => this._hoverBlockId = null}
           @click=${() => this._startEdit(block.id)}>
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
          ${this._shouldShowDeleteButton(block) ? html`
            <div class="block-action" @click=${(e) => this._deleteBlock(e, block.id)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          ` : ''}
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

  _renderAddButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>添加新块
      </button>
    `;
  }

  _renderEmptyState(showAddButton = false) {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-icon" icon="mdi:cube-outline"></ha-icon>
        <div class="cf-text-md cf-mb-sm">还没有添加任何块</div>
        ${showAddButton ? html`
          <button class="add-block-btn" @click=${this._addBlock}>
            <ha-icon icon="mdi:plus"></ha-icon>添加第一个块
          </button>
        ` : ''}
      </div>
    `;
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
    // 优先使用用户自定义的名称，然后是实体名称，最后是默认名称
    if (b.name) return b.name;
    if (b.entity && this.hass?.states[b.entity]) {
      return this.hass.states[b.entity].attributes?.friendly_name || this._getDefaultBlockName(b.type);
    }
    return this._getDefaultBlockName(b.type);
  }

  _getDefaultBlockName(blockType) {
    const nameMap = {
      'poetry_title': '诗词标题',
      'poetry_dynasty': '诗词朝代', 
      'poetry_author': '诗词作者',
      'poetry_content': '诗词内容',
      'poetry_translation': '诗词译文',
      'oil_title': '油价标题',
      'oil_89': '89号汽油',
      'oil_92': '92号汽油', 
      'oil_95': '95号汽油',
      'oil_diesel': '0号柴油',
      'oil_tip': '油价提示',
      'quote': '每日一言'
    };
    return nameMap[blockType] || '内容块';
  }

  _blockState(b) {
    // 优先显示块配置的静态内容
    if (b.content) {
      const content = String(b.content);
      return content.substring(0, 30) + (content.length > 30 ? '…' : '');
    }
    
    // 其次显示实体状态
    if (b.entity && this.hass?.states[b.entity]) {
      const st = this.hass.states[b.entity];
      const u = st.attributes?.unit_of_measurement || '';
      return `${st.state}${u ? ' ' + u : ''}`;
    }
    
    return '点击配置';
  }

  _defaultIcon(b) {
    if (b.icon) return b.icon; // 优先使用用户设置的图标
    if (!b.entity) return 'mdi:text-box';
    const domain = b.entity.split('.')[0];
    const map = { light: 'mdi:lightbulb', switch: 'mdi:power', sensor: 'mdi:gauge', binary_sensor: 'mdi:checkbox-marked-circle-outline', climate: 'mdi:thermostat' };
    return map[domain] || 'mdi:cube';
  }

  _shouldShowAddButton() {
    // 只有无预设块的卡片才显示添加按钮
    const blocks = this._getAllBlocks();
    return blocks.length === 0;
  }

  _shouldShowDeleteButton(block) {
    // 只有用户添加的块才显示删除按钮（通过块ID判断）
    return block.id && block.id.startsWith('block_');
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
    if (!entityId) return this._patchBlock(blockId, { entity: entityId });
    
    const st = this.hass.states[entityId];
    if (!st) return this._patchBlock(blockId, { entity: entityId });
    
    const patch = { entity: entityId };
    
    // 只有用户没有自定义图标时才使用实体图标
    if (!this.config.blocks[blockId]?.icon && st.attributes?.icon) {
      patch.icon = st.attributes.icon;
    }
    
    // 只有用户没有自定义名称时才使用实体名称
    if (!this.config.blocks[blockId]?.name) {
      patch.name = st.attributes?.friendly_name || this._getDefaultBlockName(this.config.blocks[blockId]?.type);
    }
    
    this._patchBlock(blockId, patch);
  }

  _addBlock() {
    const id = `block_${Date.now()}`;
    const block = { 
      area: 'content', 
      entity: '', 
      icon: 'mdi:text-box', 
      content: '请配置内容…',
      name: '新块'
    };
    this._fireConfig({ ...this.config, blocks: { ...this.config.blocks, [id]: block } });
    this._editingBlockId = id;
  }

  _deleteBlock(e, blockId) {
    e.stopPropagation(); // 阻止事件冒泡
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