// src/core/config-schema.js
export const CARD_CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    layout: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          enum: ['vertical', 'horizontal', 'grid', 'card-grid'] 
        },
        sections: { 
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['type', 'sections']
    },
    theme: {
      type: 'string',
      default: 'auto'
    },
    sections: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          type: 'object',
          properties: {
            blocks: { 
              type: 'array',
              items: { $ref: '#/definitions/block' }
            }
          }
        }
      }
    }
  },
  definitions: {
    block: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        config: { type: 'object' },
        children: { 
          type: 'array',
          items: { $ref: '#/definitions/block' }
        }
      },
      required: ['id', 'type']
    }
  }
};

export const DEFAULT_CONFIG = {
  type: 'custom:ha-cardforge-card',
  layout: { 
    type: 'vertical', 
    sections: ['main'] 
  },
  theme: 'auto',
  sections: {
    main: { blocks: [] }
  }
};
