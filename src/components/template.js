export class TemplateEngine {
  static render(template, data, hass) {
    if (typeof template === 'function') {
      return template(data, hass);
    }

    if (typeof template === 'string') {
      return template.replace(/\[\[\[(.*?)\]\]\]/g, (match, code) => {
        try {
          const result = this._evaluateTemplate(code, data, hass);
          return result !== undefined ? String(result) : '';
        } catch (error) {
          console.error('模板渲染错误:', error);
          return '模板错误';
        }
      });
    }

    return template;
  }

  static _evaluateTemplate(code, data, hass) {
    const { config, entities } = data;
    const entityStates = entities || {};
    
    const context = {
      config,
      entities: entityStates,
      states: hass?.states || {},
      now: new Date(),
      formatTime: (time) => time ? time.split(':').slice(0, 2).join(':') : '00:00',
      getEntity: (entityId) => hass?.states[entityId],
      Math: Math,
      Date: Date
    };

    try {
      const func = new Function(...Object.keys(context), `return (${code})`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('模板执行错误:', error, '代码:', code);
      return null;
    }
  }

  static renderConditional(condition, trueContent, falseContent = '') {
    try {
      const result = this._evaluateTemplate(condition, {});
      return result ? trueContent : falseContent;
    } catch (error) {
      return falseContent;
    }
  }
}

window.TemplateEngine = TemplateEngine;