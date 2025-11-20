// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    description: '每日经典诗词欣赏',
    icon: '📜',
    category: '文化',
    version: '1.0.0',
    author: 'CardForge',
    config_schema: {
      show_author: {
        type: 'boolean',
        label: '显示作者',
        default: true
      },
      show_dynasty: {
        type: 'boolean',
        label: '显示朝代',
        default: true
      },
      auto_refresh: {
        type: 'boolean',
        label: '自动刷新',
        default: false
      }
    },
    capabilities: {
      supportsTitle: true,
      supportsFooter: true
    }
  };

  getTemplate(config, hass, entities) {
    const poetry = this._getDailyPoetry();
    
    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-md">
        <div class="cardforge-text-large cf-text-center" style="line-height: 1.6;">
          ${poetry.content.split('，').join('，<br>').split('。').join('。<br>')}
        </div>
        
        <div class="cf-mt-lg">
          ${config.show_author ? `<div class="cardforge-text-medium cf-text-center">${poetry.author}</div>` : ''}
          ${config.show_dynasty && poetry.dynasty ? `<div class="cardforge-text-small cf-text-center cf-text-secondary">${poetry.dynasty}</div>` : ''}
        </div>
        
        ${poetry.title ? `<div class="cardforge-text-small cf-text-center cf-text-secondary cf-mt-sm">《${poetry.title}》</div>` : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'poetry-card', config);
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .poetry-card {
        font-family: "楷体", "STKaiti", serif;
      }
      
      .poetry-content {
        line-height: 2;
        text-align: center;
      }
    `;
  }

  _getDailyPoetry() {
    const poetries = [
      {
        content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
        title: "静夜思",
        author: "李白",
        dynasty: "唐"
      },
      {
        content: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
        title: "春晓", 
        author: "孟浩然",
        dynasty: "唐"
      },
      {
        content: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。",
        title: "登鹳雀楼",
        author: "王之涣",
        dynasty: "唐"
      },
      {
        content: "锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。",
        title: "悯农",
        author: "李绅", 
        dynasty: "唐"
      },
      {
        content: "远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。",
        title: "山行",
        author: "杜牧",
        dynasty: "唐"
      }
    ];
    
    // 根据日期选择诗词，确保每天显示相同的诗词
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % poetries.length;
    
    return poetries[index];
  }
}