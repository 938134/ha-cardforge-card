// src/blocks/types/chart-block.js
import { BaseBlock } from '../base-block.js';

class ChartBlock extends BaseBlock {
  static blockType = 'chart';
  static blockName = '图表';
  static blockIcon = 'mdi:chart-line';
  static category = 'information';
  static description = '数据图表显示';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    
    if (!config.entity && !config.entities?.length) {
      return this._renderEmpty('请配置图表数据');
    }

    const entities = config.entities || [config.entity].filter(Boolean);
    const chartData = this._getChartData(entities, hass, config);

    return this._renderContainer(`
      ${this._renderHeader(config.title)}
      <div class="chart-container">
        <div class="chart-canvas" id="chart-${block.id}">
          ${this._renderChartSVG(chartData, config)}
        </div>
        ${config.showLegend ? this._renderLegend(chartData, config) : ''}
      </div>
    `, 'chart-block');
  }

  getStyles(block) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    
    return `
      .chart-block .chart-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .chart-block .chart-canvas {
        flex: 1;
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chart-svg {
        width: 100%;
        height: 100%;
        max-height: 200px;
      }

      .chart-line {
        fill: none;
        stroke: var(--cf-primary-color);
        stroke-width: 2;
        stroke-linecap: round;
      }

      .chart-area {
        fill: rgba(var(--cf-rgb-primary), 0.1);
        stroke: none;
      }

      .chart-bar {
        fill: var(--cf-primary-color);
        transition: all var(--cf-transition-fast);
      }

      .chart-bar:hover {
        opacity: 0.8;
        transform: scaleY(1.05);
      }

      .chart-legend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-sm);
        justify-content: center;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      .chart-axis {
        stroke: var(--cf-border);
        stroke-width: 1;
      }

      .chart-grid {
        stroke: var(--cf-border);
        stroke-width: 0.5;
        stroke-dasharray: 2,2;
      }

      .chart-label {
        font-size: 0.7em;
        fill: var(--cf-text-secondary);
      }

      .chart-value {
        font-size: 0.75em;
        fill: var(--cf-text-primary);
        font-weight: 500;
      }

      @container (max-width: 300px) {
        .chart-legend {
          flex-direction: column;
          align-items: center;
        }
        
        .chart-svg {
          max-height: 150px;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entities = this._getAvailableEntities(hass);

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
          <label class="form-label">图表类型</label>
          <ha-select
            .value="${config.chartType || 'line'}"
            @closed="${e => e.stopPropagation()}"
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
          >
            <ha-list-item value="line" @click="${() => onConfigChange('chartType', 'line')}">折线图</ha-list-item>
            <ha-list-item value="bar" @click="${() => onConfigChange('chartType', 'bar')}">柱状图</ha-list-item>
            <ha-list-item value="area" @click="${() => onConfigChange('chartType', 'area')}">面积图</ha-list-item>
          </ha-select>
        </div>

        <div class="form-field">
          <label class="form-label">数据实体</label>
          <ha-combo-box
            .items="${JSON.stringify(entities)}"
            .value="${config.entity || ''}"
            @value-changed="${e => onConfigChange('entity', e.detail.value)}"
            allow-custom-value
            fullwidth
          ></ha-combo-box>
        </div>

        <div class="form-field">
          <label class="form-label">时间段（小时）</label>
          <ha-textfield
            .value="${config.hours || 24}"
            @input="${e => onConfigChange('hours', parseInt(e.target.value) || 24)}"
            type="number"
            min="1"
            max="168"
            fullwidth
          ></ha-textfield>
        </div>

        <div class="form-row">
          <div class="switch-item">
            <span class="switch-label">显示图例</span>
            <ha-switch
              .checked="${config.showLegend}"
              @change="${e => onConfigChange('showLegend', e.target.checked)}"
            ></ha-switch>
          </div>

          <div class="switch-item">
            <span class="switch-label">显示数值</span>
            <ha-switch
              .checked="${config.showValues}"
              @change="${e => onConfigChange('showValues', e.target.checked)}"
            ></ha-switch>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">颜色</label>
          <ha-textfield
            .value="${config.color || ''}"
            @input="${e => onConfigChange('color', e.target.value)}"
            placeholder="使用主题颜色"
            fullwidth
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      title: '数据图表',
      chartType: 'line',
      entity: '',
      entities: [],
      hours: 24,
      showLegend: true,
      showValues: false,
      color: ''
    };
  }

  _getAvailableEntities(hass) {
    if (!hass?.states) return [];
    
    return Object.entries(hass.states)
      .filter(([entityId, entity]) => 
        entityId.startsWith('sensor.') &&
        !isNaN(parseFloat(entity.state))
      )
      .map(([entityId, entity]) => ({
        value: entityId,
        label: entity.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getChartData(entities, hass, config) {
    // 模拟图表数据（实际项目中应该从历史数据API获取）
    const now = new Date();
    const dataPoints = 12;
    
    return entities.map((entityId, index) => {
      const entity = hass?.states?.[entityId];
      const currentValue = parseFloat(entity?.state) || 0;
      
      const data = [];
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2 * 60 * 60 * 1000); // 每2小时一个点
        const value = currentValue * (0.8 + Math.random() * 0.4); // 模拟波动
        
        data.push({
          time,
          value: Math.round(value * 100) / 100,
          label: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      return {
        entityId,
        label: entity?.attributes?.friendly_name || entityId,
        color: this._getChartColor(index),
        data
      };
    });
  }

  _getChartColor(index) {
    const colors = [
      'var(--cf-primary-color)',
      'var(--cf-accent-color)',
      'var(--cf-success-color)',
      'var(--cf-warning-color)',
      'var(--cf-error-color)'
    ];
    return colors[index % colors.length];
  }

  _renderChartSVG(chartData, config) {
    if (chartData.length === 0) {
      return this._renderEmptyChart();
    }

    const width = 280;
    const height = 160;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    switch (config.chartType) {
      case 'line':
        return this._renderLineChart(chartData, width, height, padding, config);
      case 'bar':
        return this._renderBarChart(chartData, width, height, padding, config);
      case 'area':
        return this._renderAreaChart(chartData, width, height, padding, config);
      default:
        return this._renderLineChart(chartData, width, height, padding, config);
    }
  }

  _renderLineChart(chartData, width, height, padding, config) {
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = chartData.flatMap(series => series.data.map(d => d.value));
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);

    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        ${this._renderGrid(chartWidth, chartHeight, padding, maxValue, minValue)}
        
        ${chartData.map(series => {
          const points = series.data.map((point, index) => {
            const x = padding.left + (index / (series.data.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
            return `${x},${y}`;
          }).join(' ');
          
          return `
            <polyline class="chart-line" points="${points}" style="stroke: ${series.color}" />
          `;
        }).join('')}
        
        ${config.showValues ? this._renderDataLabels(chartData, chartWidth, chartHeight, padding, maxValue, minValue) : ''}
        ${this._renderAxes(chartWidth, chartHeight, padding)}
      </svg>
    `;
  }

  _renderBarChart(chartData, width, height, padding, config) {
    // 简化的柱状图实现
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">
          柱状图预览
        </text>
      </svg>
    `;
  }

  _renderAreaChart(chartData, width, height, padding, config) {
    // 简化的面积图实现
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">
          面积图预览
        </text>
      </svg>
    `;
  }

  _renderGrid(chartWidth, chartHeight, padding, maxValue, minValue) {
    const gridLines = 5;
    let grid = '';
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartHeight;
      grid += `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" />`;
    }
    
    return grid;
  }

  _renderAxes(chartWidth, chartHeight, padding) {
    return `
      <line class="chart-axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" />
      <line class="chart-axis" x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" />
    `;
  }

  _renderDataLabels(chartData, chartWidth, chartHeight, padding, maxValue, minValue) {
    return chartData.map(series => {
      const lastPoint = series.data[series.data.length - 1];
      const x = padding.left + chartWidth;
      const y = padding.top + chartHeight - ((lastPoint.value - minValue) / (maxValue - minValue)) * chartHeight;
      
      return `
        <text x="${x + 5}" y="${y}" class="chart-value" style="fill: ${series.color}">
          ${lastPoint.value}
        </text>
      `;
    }).join('');
  }

  _renderLegend(chartData, config) {
    if (chartData.length === 0) return '';

    return `
      <div class="chart-legend">
        ${chartData.map(series => `
          <div class="legend-item">
            <div class="legend-color" style="background: ${series.color}"></div>
            <span>${series.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  _renderEmptyChart() {
    return `
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:chart-line" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">暂无数据</div>
      </div>
    `;
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:chart-line" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'chart-block empty');
  }
}

export { ChartBlock as default };