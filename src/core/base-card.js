import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';

/**
 * 卡片基类 - 所有自定义卡片必须继承此类
 * 提供统一的属性管理、样式注入、生命周期
 */
export class BaseCard extends LitElement {
  // 公共属性
  @property({ type: Object }) config = {};
  @property({ type: Object }) hass = null;
  
  // 内部状态
  @state() loading = false;
  @state() error = null;
  @state() renderData = null;

  // 静态样式 - 由子类扩展
  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
      }
      
      .card-content {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-text-secondary);
      }
      
      .error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-error-color);
        text-align: center;
        padding: var(--cf-spacing-lg);
      }
      
      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 120px;
        color: var(--cf-text-tertiary);
        text-align: center;
        padding: var(--cf-spacing-lg);
      }
    `;
  }

  constructor() {
    super();
    this._updateTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startAutoUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoUpdate();
  }

  willUpdate(changedProperties) {
    // 配置变化时重新处理数据
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._processData();
    }
  }

  /**
   * 处理卡片数据 - 子类可重写
   */
  async _processData() {
    try {
      this.loading = true;
      this.error = null;
      
      // 子类应该重写此方法
      const data = await this.processCardData();
      this.renderData = data;
      
    } catch (err) {
      console.error('卡片数据处理错误:', err);
      this.error = err.message || '数据处理失败';
    } finally {
      this.loading = false;
    }
  }

  /**
   * 处理卡片数据 - 子类必须实现
   */
  async processCardData() {
    throw new Error('子类必须实现 processCardData 方法');
  }

  /**
   * 渲染卡片内容 - 子类必须实现
   */
  renderCardContent() {
    throw new Error('子类必须实现 renderCardContent 方法');
  }

  /**
   * 开始自动更新（如果需要）
   */
  _startAutoUpdate() {
    const updateInterval = this.config?.update_interval || 60000; // 默认1分钟
    if (updateInterval > 0 && !this._updateTimer) {
      this._updateTimer = setInterval(() => {
        this._processData();
      }, updateInterval);
    }
  }

  /**
   * 停止自动更新
   */
  _stopAutoUpdate() {
    if (this._updateTimer) {
      clearInterval(this._updateTimer);
      this._updateTimer = null;
    }
  }

  render() {
    if (this.error) {
      return html`
        <div class="error-state">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span style="margin-left: 8px;">${this.error}</span>
        </div>
      `;
    }

    if (this.loading) {
      return html`
        <div class="loading-state">
          <ha-circular-progress indeterminate size="small"></ha-circular-progress>
          <span style="margin-left: 8px;">加载中...</span>
        </div>
      `;
    }

    if (!this.renderData) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span style="margin-left: 8px;">暂无数据</span>
        </div>
      `;
    }

    return html`
      <div class="card-content">
        ${this.renderCardContent()}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸（用于Home Assistant布局）
   */
  getCardSize() {
    return this.config?.card_size || 1;
  }
}
