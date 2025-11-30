// src/editors/block-management.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { cardRegistry } from '../core/card-registry.js';

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
        gap: 6px;
      }
      
      /* 块项 - 更紧凑的布局 */
      .block-item{
        display:grid;
        grid-template-columns: 36px 40px 1fr auto;
        gap: 8px;
        align-items:center;
        background:var(--cf-surface);
        border:1px solid var(--cf-border);
        border-radius:var(--cf-radius-md);
        padding: 8px;
        min-height: 52px;
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
      
      /* 块操作 - 固定显示 */
      .block-actions{
        display:flex;
        gap: 4px;
        align-items:center;
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
      
      .block-action.hidden {
        display: none;
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
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .form-field{
        display:flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .form-label{
        font-weight:500;
        font-size:0.85em;
        color:var(--cf-text-primary);
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

      /* 下拉菜单样式优化 */
      ha-select {
        --ha-select-background: var(--cf-surface);
        --ha-select-border-color: var(--cf-border);
        --ha-select-color: var(--cf-text-primary);
      }

      ha-list-item {
        --mdc-list-item-graphic-margin: 8px;
      }

      .area-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
      }

      .area-badge-small {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .area-badge-small.header { background: #2196F3; }
      .area-badge-small.content { background: #4CAF50; }
      .area-badge-small.footer { background: #FF9800; }
    `,
  ];

  constructor() {
    super();
    this._editingBlockId = null;
  }

  render() {
    const blocks = this._getAllBlocks();
    const blockMode = this._getCardBlockMode();
    
    // 无块模式不显示任何内容
    if (blockMode === 'none') {
      return this._renderEmptyState();
    }
    
    // 根据块数量决定显示逻辑
    if (blocks.length === 0) {
      return this._renderEmptyState();
    }
    
    return html`
      <div class="block-management">
        <div class="block-list">${blocks.map(b => this._renderBlock(b))}</div>
        ${this._shouldShowAddButton() ? this._renderAddButton() : ''}
      </div>`;
  }

  _renderBlock(block) {
    const isEditing = this._editingBlockId === block.id;
    const showDelete = this._shouldShowDeleteButton(block);
    
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
          <div class="block-action ${showDelete ? '' : 'hidden'}" 
               @click=${(e) => this._deleteBlock(e, block.id)}>
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
          <ha-select
            .value=${block.area || 'content'}
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
            @closed=${this._preventClose}
            @change=${e => this._patchBlock(block.id, { area: e.target.value })}
            label="区域"
          >
            ${this._renderAreaOptions()}
          </ha-select>

          ${this._renderEntityField(block)}

          <ha-icon-picker
            .value=${block.icon || ''}
            @value-changed=${e => this._patchBlock(block.id, { icon: e.detail.value })}
            label="图标"
            fullwidth
          ></ha-icon-picker>

          <ha-textfield
            .value=${block.name || ''}
            @input=${e => this._patchBlock(block.id, { name: e.target.value })}
            placeholder="输入块名称"
            label="块名称"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-actions">
          <button class="action-btn" @click=${this._cancelEdit}>取消</button>
          <button class="action-btn primary" @click=${this._saveEdit}>保存</button>
        </div>
      </div>
    `;
  }

  _renderAreaOptions() {
    const areas = [
      { value: 'header', label: '标题区域', badge: 'H', color: 'header' },
      { value: 'content', label: '内容区域', badge: 'C', color: 'content' },
      { value: 'footer', label: '页脚区域', badge: 'F', color: 'footer' }
    ];

    return areas.map(area => html`
      <ha-list-item .value=${area.value}>
        <div class="area-option">
          <div class="area-badge-small ${area.color}">${area.badge}</div>
          <span>${area.label}</span>
        </div>
      </ha-list-item>
    `);
  }

  _renderEntityField(block) {
    return html`
      ${this._entities.length > 0 ? html`
        <ha-combo-box
          .items=${this._entities}
          .value=${block.entity || ''}
          @value-changed=${e => this._handleEntityPick(block.id, e.detail.value)}
          allow-custom-value
          label="实体"
          fullwidth
        ></ha-combo-box>
      ` : html`
        <ha-textfield
          .value=${block.entity || ''}
          @input=${e => this._patchBlock(block.id, { entity: e.target.value })}
          placeholder="输入实体ID"
          label="实体"
          fullwidth
        ></ha-textfield>
      `}
    `;
  }

  _renderAddButton() {
    return html`
      <button class="add-block-btn" @click=${this._addBlock}>
        <ha-icon icon="mdi:plus"></ha-icon>添加新块
      </button>
    `;
  }

  _renderEmptyState() {
    const blockMode = this._getCardBlockMode();
    
    if (blockMode === 'none') {
      return html`
        <div class="empty-state">
          <ha-icon class="empty-icon" icon="mdi:block-helper"></ha-icon>
          <div class="cf-text-md cf-mb-sm">此卡片无需配置块</div>
        </div>
      `;
    }
    
    const showAddButton = blockMode === 'custom';
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
        label: `${st.attributes?.friendly_name || id} (${st.state})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getCardBlockMode() {
    if (!this.config.card_type) return 'custom';
    
    try {
      const card = cardRegistry.getCard(this.config.card_type);
      return card?.manifest?.block_mode || 'custom';
    } catch (error) {
      console.warn('获取卡片块模式失败:', error);
      return 'custom';
    }
  }

  _blockName(b) {
    // 优先使用用户自定义的名称
    if (b.name) return b.name;
    
    // 其次使用实体友好名称
    if (b.entity && this.hass?.states[b.entity]) {
      return this.hass.states[b.entity].attributes?.friendly_name || this._getDefaultBlockName(b);
    }
    
    // 最后使用默认名称
    return this._getDefaultBlockName(b);
  }

  _getDefaultBlockName(block) {
    // 优先使用块配置中的 name 属性
    if (block.name) return block.name;
    
    // 其次使用实体友好名称
    if (block.entity && this.hass?.states[block.entity]) {
      return this.hass.states[block.entity].attributes?.friendly_name || '实体块';
    }
    
    // 最后使用通用名称
    return '内容块';
  }

  _blockState(b) {
    // 优先显示实体状态
    if (b.entity && this.hass?.states[b.entity]) {
      const st = this.hass.states[b.entity];
      const u = st.attributes?.unit_of_measurement || '';
      return `${st.state}${u ? ' ' + u : ''}`;
    }
    
    // 其次显示块配置的静态内容
    if (b.content) {
      const content = String(b.content);
      return content.substring(0, 30) + (content.length > 30 ? '…' : '');
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
    const blockMode = this._getCardBlockMode();
    return blockMode === 'custom';
  }

  _shouldShowDeleteButton(block) {
    const blockMode = this._getCardBlockMode();
    
    if (blockMode === 'custom') {
      // 自定义模式：所有块都可以删除
      return true;
    } else if (blockMode === 'preset') {
      // 预设模式：只有用户添加的块可以删除
      return block.id && block.id.startsWith('block_');
    } else {
      // 无块模式：不能删除任何块
      return false;
    }
  }

  _startEdit(blockId) {
    this._editingBlockId = blockId;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _saveEdit() {
    this._editingBlockId = null;
  }

  _patchBlock(blockId, delta) {
    const newBlocks = { ...this.config.blocks, [blockId]: { ...this.config.blocks[blockId], ...delta } };
    this._fireConfig({ ...this.config, blocks: newBlocks });
  }

  _handleEntityPick(blockId, entityId) {
    if (!entityId) {
      // 清空实体时，保留用户自定义的图标和名称
      return this._patchBlock(blockId, { entity: '' });
    }
    
    const st = this.hass.states[entityId];
    if (!st) {
      return this._patchBlock(blockId, { entity: entityId });
    }
    
    // 选择实体时自动填充图标和友好名称
    const patch = { 
      entity: entityId,
      // 自动填充图标（总是使用实体图标）
      icon: st.attributes?.icon || this._defaultIcon({ entity: entityId }),
      // 自动填充块名称（使用友好名称）
      name: st.attributes?.friendly_name || this._formatEntityId(entityId)
    };
    
    this._patchBlock(blockId, patch);
  }

  _formatEntityId(entityId) {
    // 将 entity_id 格式化为友好名称
    return entityId
      .split('.')[1]
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) || entityId;
  }

  _addBlock() {
    const id = `block_${Date.now()}`;
    const block = { 
      area: 'content', 
      entity: '', 
      icon: 'mdi:text-box', 
      name: '新块',
      content: ''
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

  _preventClose(e) {
    e.stopPropagation();
  }

  _fireConfig(newConfig) {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig } }));
  }
}

if (!customElements.get('block-management')) {
  customElements.define('block-management', BlockManagement);
}
export { BlockManagement };