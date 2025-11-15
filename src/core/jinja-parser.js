// src/core/jinja-parser.js
export class JinjaParser {
    constructor(hass) {
      this.hass = hass;
    }
  
    // 主解析方法
    parse(template, defaultValue = '') {
      if (!template || typeof template !== 'string') {
        return defaultValue;
      }
  
      try {
        let result = template;
        
        // 按优先级解析不同类型的模板
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
  
    // 解析 {{ states('entity_id') }}
    _parseStateFunction(template) {
      const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
      if (!stateMatches) return template;
  
      return stateMatches.reduce((result, match) => {
        const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
        if (entityMatch && this.hass?.states?.[entityMatch[1]]) {
          return result.replace(match, this.hass.states[entityMatch[1]].state);
        }
        return result;
      }, template);
    }
  
    // 解析 {{ state_attr('entity_id', 'attribute') }}
    _parseStateAttrFunction(template) {
      const attrMatches = template.match(/{{\s*state_attr\(['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?\)\s*}}/g);
      if (!attrMatches) return template;
  
      return attrMatches.reduce((result, match) => {
        const attrMatch = match.match(/state_attr\(['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?\)/);
        if (attrMatch) {
          const entityId = attrMatch[1];
          const attribute = attrMatch[2] || 'friendly_name'; // 默认属性
          
          if (this.hass?.states?.[entityId]?.attributes?.[attribute]) {
            return result.replace(match, this.hass.states[entityId].attributes[attribute]);
          }
        }
        return result;
      }, template);
    }
  
    // 解析 {{ states.entity_id.attributes.attribute }}
    _parseStateDotNotation(template) {
      const dotMatches = template.match(/{{\s*states\.([^ ]+)\.attributes\.([^ }]+)\s*}}/g);
      if (!dotMatches) return template;
  
      return dotMatches.reduce((result, match) => {
        const dotMatch = match.match(/states\.([^ ]+)\.attributes\.([^ }]+)/);
        if (dotMatch && this.hass?.states?.[dotMatch[1]]?.attributes?.[dotMatch[2]]) {
          return result.replace(match, this.hass.states[dotMatch[1]].attributes[dotMatch[2]]);
        }
        return result;
      }, template);
    }
  
    // 解析数学表达式
    _parseMathExpressions(template) {
      const mathMatches = template.match(/{{\s*([^{}]+)\s*}}/g);
      if (!mathMatches) return template;
  
      return mathMatches.reduce((result, match) => {
        const mathExpr = match.replace(/[{}]/g, '').trim();
        
        // 检查是否是纯数学表达式（只包含数字、运算符、空格）
        if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(mathExpr)) {
          try {
            const calcResult = eval(mathExpr);
            // 处理 round() 函数
            if (mathExpr.includes('round(')) {
              const roundMatch = mathExpr.match(/round\(([^)]+)\)/);
              if (roundMatch) {
                const innerExpr = roundMatch[1];
                const innerResult = eval(innerExpr);
                return result.replace(match, Math.round(innerResult));
              }
            }
            return result.replace(match, calcResult);
          } catch (e) {
            console.warn('数学表达式计算失败:', mathExpr);
          }
        }
        
        return result;
      }, template);
    }
  
    // 解析时间函数
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
        "strftime('%M')": String(now.getMinutes()).padStart(2, '0')
      };
  
      let result = template;
      Object.entries(timeFormats).forEach(([format, value]) => {
        if (template.includes(format)) {
          result = result.replace(`{{ now().${format} }}`, value);
        }
      });
  
      return result;
    }
  
    // 清理剩余的模板标记
    _parseRemainingTemplates(template) {
      return template.replace(/{{\s*[^}]*\s*}}/g, '');
    }
  
    // 批量解析实体配置
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
  
    // 检查是否是Jinja模板
    isJinjaTemplate(value) {
      return typeof value === 'string' && 
             (value.includes('{{') || value.includes('{%'));
    }
  
    // 获取模板中引用的实体列表
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
  
      // 匹配 states.entity_id.attributes
      const dotNotationMatches = template.match(/states\.([^\s\.]+)\.attributes/g);
      if (dotNotationMatches) {
        dotNotationMatches.forEach(match => {
          const entityMatch = match.match(/states\.([^\s\.]+)\.attributes/);
          if (entityMatch) entities.add(entityMatch[1]);
        });
      }
  
      return Array.from(entities);
    }
  }
  
  // 单例模式
  let _instance = null;
  
  export const getJinjaParser = (hass) => {
    if (!_instance || _instance.hass !== hass) {
      _instance = new JinjaParser(hass);
    }
    return _instance;
  };