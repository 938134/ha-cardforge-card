// src/cards/oil-price-card.js
import { BaseCard } from '../core/base-card.js';

class OilPriceCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'oil-price-card',
      theme: 'auto',
      areas: {
        header: {
          layout: 'single',
          blocks: ['title']
        },
        content: {
          layout: 'grid-1x4',
          blocks: ['gas_89', 'gas_92', 'gas_95', 'gas_diesel']
        },
        footer: {
          layout: 'single',
          blocks: ['update_info']
        }
      },
      blocks: {
        title: {
          type: 'text',
          title: '',
          content: '今日油价',
          style: 'text-align: center; font-size: 1.3em; font-weight: 600;'
        },
        gas_89: {
          type: 'text',
          title: '89号',
          content: '7.50元/L',
          style: 'text-align: center; background: rgba(76, 175, 80, 0.1); padding: 1em; border-radius: var(--cf-radius-md);'
        },
        gas_92: {
          type: 'text',
          title: '92号',
          content: '7.85元/L',
          style: 'text-align: center; background: rgba(33, 150, 243, 0.1); padding: 1em; border-radius: var(--cf-radius-md);'
        },
        gas_95: {
          type: 'text',
          title: '95号',
          content: '8.35元/L',
          style: 'text-align: center; background: rgba(255, 152, 0, 0.1); padding: 1em; border-radius: var(--cf-radius-md);'
        },
        gas_diesel: {
          type: 'text',
          title: '0号柴油',
          content: '7.45元/L',
          style: 'text-align: center; background: rgba(158, 158, 158, 0.1); padding: 1em; border-radius: var(--cf-radius-md);'
        },
        update_info: {
          type: 'text',
          title: '',
          content: '更新于：今日 08:00',
          style: 'text-align: center; font-size: 0.8em; color: var(--cf-text-secondary);'
        }
      }
    };
  }

  getManifest() {
    return OilPriceCard.manifest;
  }

  static styles(config) {
    return `
      .oil-price-card .area-header {
        margin-bottom: var(--cf-spacing-md);
      }
      
      .oil-price-card .area-footer {
        margin-top: var(--cf-spacing-md);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }
      
      .oil-price-card .block-title {
        font-size: 0.9em;
        font-weight: 500;
        margin-bottom: 0.5em;
        color: var(--cf-text-secondary);
      }
      
      .oil-price-card .block-content {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
      }
      
      @container cardforge-container (max-width: 400px) {
        .oil-price-card .layout-grid.grid-1x4 {
          grid-template: 1fr / repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .oil-price-card .layout-grid.grid-1x4 {
          grid-template: 1fr / 1fr;
        }
      }
    `;
  }
}

OilPriceCard.manifest = {
  id: 'oil-price-card',
  name: '油价卡片',
  description: '显示当前油价信息，支持多种油品类型',
  icon: '⛽',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    province: {
      type: 'select',
      label: '省份',
      options: ['北京', '上海', '广东', '江苏', '浙江', '山东'],
      default: '广东'
    },
    auto_update: {
      type: 'boolean',
      label: '自动更新',
      default: true
    },
    show_trend: {
      type: 'boolean',
      label: '显示涨跌趋势',
      default: true
    }
  },
  styles: OilPriceCard.styles
};

export { OilPriceCard as default, OilPriceCard };
export const manifest = OilPriceCard.manifest;