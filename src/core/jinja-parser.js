// src/core/jinja-parser.js
export class JinjaParser {
  constructor(hass) {
    this.hass = hass;
  }

  parse(template, defaultValue = '') {
    if (!template || typeof template !== 'string') {
      return defaultValue;
    }

    try {
      let result = template;
      
      // 按优先级解析不同类型的模板
      result = this._parseEntityReferences(result);
      result = this._parseStateFunction(result);
      result = this._parseStateAttrFunction(result);
      result = this._parseStateDotNotation(result);
      result = this._parseMathExpressions(result);
      result = this._parseTimeFunctions(result);
      result = this._parseRemainingTemplates(result);
      
      return result || defaultValue;
    } catch (error) {
      console.error('Jinja2模板解析错误:', error);
      return defaultValue;
    }
  }

  // === 实体引用解析 ===
  
  _parseEntityReferences(template) {
    // 解析 {{ states.entity_id }} 格式
    const entityRefMatches = template.match(/{{\s*states\.([^ }\.]+)(?:\s*\|[^}]*)?\s*}}/g);
    if (!entityRefMatches) return template;

    return entityRefMatches.reduce((result, match) => {
      const entityMatch = match.match(/states\.([^ }\.|]+)/);
      if (entityMatch) {
        const entityId = entityMatch[1];
        if (this.hass?.states?.[entityId]) {
          const entity = this.hass.states[entityId];
          // 处理可能的过滤器，如 {{ states.entity_id | upper }}
          const filterMatch = match.match(/\|\s*([^}]+)/);
          let value = entity.state;
          
          if (filterMatch) {
            value = this._applyFilter(value, filterMatch[1]);
          }
          
          return result.replace(match, value);
        }
      }
      return result;
    }, template);
  }

  // === 函数式语法解析 ===

  _parseStateFunction(template) {
    const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"](?:\s*\|[^}]*)?\)\s*}}/g);
    if (!stateMatches) return template;

    return stateMatches.reduce((result, match) => {
      const entityMatch = match.match(/states\(['"]([^'"]+)['"]/);
      if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
        const entity = this.hass.states[entityMatch[1]];
        const filterMatch = match.match(/\|\s*([^}]+)/);
        let value = entity.state;
        
        if (filterMatch) {
          value = this._applyFilter(value, filterMatch[1]);
        }
        
        return result.replace(match, value);
      }
      return result;
    }, template);
  }

  _parseStateAttrFunction(template) {
    const attrMatches = template.match(/{{\s*state_attr\(['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?(?:\s*\|[^}]*)?\)\s*}}/g);
    if (!attrMatches) return template;

    return attrMatches.reduce((result, match) => {
      const attrMatch = match.match(/state_attr\(['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/);
      if (attrMatch) {
        const entityId = attrMatch[1];
        const attribute = attrMatch[2] || 'friendly_name';
        
        if (this.hass?.states?.[entityId]?.attributes?.[attribute]) {
          const value = this.hass.states[entityId].attributes[attribute];
          const filterMatch = match.match(/\|\s*([^}]+)/);
          let filteredValue = value;
          
          if (filterMatch) {
            filteredValue = this._applyFilter(value, filterMatch[1]);
          }
          
          return result.replace(match, filteredValue);
        }
      }
      return result;
    }, template);
  }

  _parseStateDotNotation(template) {
    const dotMatches = template.match(/{{\s*states\.([^ ]+)\.attributes\.([^ }|]+)(?:\s*\|[^}]*)?\s*}}/g);
    if (!dotMatches) return template;

    return dotMatches.reduce((result, match) => {
      const dotMatch = match.match(/states\.([^ ]+)\.attributes\.([^ }|]+)/);
      if (dotMatch && this.hass?.states?.[dotMatch[1]]?.attributes?.[dotMatch[2]]) {
        const value = this.hass.states[dotMatch[1]].attributes[dotMatch[2]];
        const filterMatch = match.match(/\|\s*([^}]+)/);
        let filteredValue = value;
        
        if (filterMatch) {
          filteredValue = this._applyFilter(value, filterMatch[1]);
        }
        
        return result.replace(match, filteredValue);
      }
      return result;
    }, template);
  }

  // === 过滤器支持 ===
  
  _applyFilter(value, filterExpression) {
    const filters = filterExpression.split('|').map(f => f.trim());
    
    return filters.reduce((result, filter) => {
      const [filterName, ...args] = filter.split('(');
      
      switch (filterName.trim()) {
        case 'upper':
          return String(result).toUpperCase();
          
        case 'lower':
          return String(result).toLowerCase();
          
        case 'capitalize':
          return String(result).charAt(0).toUpperCase() + String(result).slice(1);
          
        case 'length':
          return String(result).length;
          
        case 'replace':
          if (args.length > 0) {
            const replaceArgs = args.join('(').replace(/\)$/, '').split(',');
            if (replaceArgs.length >= 2) {
              const oldStr = replaceArgs[0].trim().replace(/['"]/g, '');
              const newStr = replaceArgs[1].trim().replace(/['"]/g, '');
              return String(result).replace(new RegExp(oldStr, 'g'), newStr);
            }
          }
          return result;
          
        case 'round':
          const num = parseFloat(result);
          if (!isNaN(num)) {
            const roundArgs = args.length > 0 ? args.join('(').replace(/\)$/, '') : '0';
            const precision = parseInt(roundArgs) || 0;
            return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
          }
          return result;
          
        case 'float':
          const floatNum = parseFloat(result);
          return isNaN(floatNum) ? result : floatNum;
          
        case 'int':
          const intNum = parseInt(result);
          return isNaN(intNum) ? result : intNum;
          
        case 'default':
          const defaultArgs = args.length > 0 ? args.join('(').replace(/\)$/, '') : '';
          const defaultValue = defaultArgs.trim().replace(/['"]/g, '');
          return result || defaultValue;
          
        default:
          return result;
      }
    }, value);
  }

  // === 其他解析方法 ===

  _parseMathExpressions(template) {
    const mathMatches = template.match(/{{\s*([^{}]+)\s*}}/g);
    if (!mathMatches) return template;

    return mathMatches.reduce((result, match) => {
      const mathExpr = match.replace(/[{}]/g, '').trim();
      
      // 检查是否是纯数学表达式（只包含数字、运算符、空格、括号）
      if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(mathExpr)) {
        try {
          const calcResult = eval(mathExpr);
          return result.replace(match, calcResult);
        } catch (e) {
          console.warn('数学表达式计算失败:', mathExpr);
        }
      }
      
      return result;
    }, template);
  }

  _parseTimeFunctions(template) {
    if (!template.includes('now()')) return template;

    const now = new Date();
    const timeFormats = {
      "strftime('%H:%M')": now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      "strftime('%Y-%m-%d')": now.toLocaleDateString('zh-CN'),
      "strftime('%m月%d日')": `${now.getMonth() + 1}月${now.getDate()}日`,
      "strftime('%Y年%m月%d日')": `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
      "strftime('%A')": '星期' + '日一二三四五六'[now.getDay()],
      "strftime('%H')": String(now.getHours()).padStart(2, '0'),
      "strftime('%M')": String(now.getMinutes()).padStart(2, '0'),
      "strftime('%S')": String(now.getSeconds()).padStart(2, '0')
    };

    let result = template;
    Object.entries(timeFormats).forEach(([format, value]) => {
      const pattern = `{{\\s*now\\(\\)\\.${format}\\s*}}`;
      const regex = new RegExp(pattern, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  _parseRemainingTemplates(template) {
    return template.replace(/{{\s*[^}]*\s*}}/g, '');
  }

  // === 工具方法 ===

  parseEntities(entitiesConfig) {
    const result = {};
    
    if (!entitiesConfig || typeof entitiesConfig !== 'object') {
      return result;
    }

    Object.entries(entitiesConfig).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result[key] = this.parse(value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  isJinjaTemplate(value) {
    return typeof value === 'string' && 
           (value.includes('{{') || value.includes('{%'));
  }

  getReferencedEntities(template) {
    const entities = new Set();
    
    if (!this.isJinjaTemplate(template)) {
      return Array.from(entities);
    }

    // 匹配 states('entity_id')
    const stateFuncMatches = template.match(/states\(['"]([^'"]+)['"]\)/g);
    if (stateFuncMatches) {
      stateFuncMatches.forEach(match => {
        const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
        if (entityMatch) entities.add(entityMatch[1]);
      });
    }

    // 匹配 state_attr('entity_id', 'attribute')
    const stateAttrMatches = template.match(/state_attr\(['"]([^'"]+)['"]/g);
    if (stateAttrMatches) {
      stateAttrMatches.forEach(match => {
        const entityMatch = match.match(/state_attr\(['"]([^'"]+)['"]/);
        if (entityMatch) entities.add(entityMatch[1]);
      });
    }

    // 匹配 states.entity_id.attributes.attribute
    const dotNotationMatches = template.match(/states\.([^\s\.]+)\.attributes/g);
    if (dotNotationMatches) {
      dotNotationMatches.forEach(match => {
        const entityMatch = match.match(/states\.([^\s\.]+)\.attributes/);
        if (entityMatch) entities.add(entityMatch[1]);
      });
    }

    // 匹配 states.entity_id
    const entityRefMatches = template.match(/states\.([^\s}\.|]+)/g);
    if (entityRefMatches) {
      entityRefMatches.forEach(match => {
        const entityMatch = match.match(/states\.([^\s}\.|]+)/);
        if (entityMatch) entities.add(entityMatch[1]);
      });
    }

    return Array.from(entities);
  }

  // 获取实体状态（直接方法）
  getEntityState(entityId) {
    return this.hass?.states?.[entityId]?.state || null;
  }

  // 获取实体属性（直接方法）
  getEntityAttribute(entityId, attribute) {
    return this.hass?.states?.[entityId]?.attributes?.[attribute] || null;
  }

  // 检查实体是否存在
  entityExists(entityId) {
    return !!this.hass?.states?.[entityId];
  }
}

let _instance = null;

export const getJinjaParser = (hass) => {
  if (!_instance || _instance.hass !== hass) {
    _instance = new JinjaParser(hass);
  }
  return _instance;
};