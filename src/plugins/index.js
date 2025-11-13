// src/plugins/index.js
// 插件自动注册 - 不需要手动导出每个插件
// PluginRegistry 会自动发现和注册插件

/**
 * 插件工具函数
 */
export function validatePluginManifest(manifest) {
    const requiredFields = ['id', 'name', 'version', 'description', 'author', 'category'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`插件清单缺少必需字段: ${missingFields.join(', ')}`);
    }
    
    if (!manifest.id.match(/^[a-z-]+$/)) {
      throw new Error('插件ID只能包含小写字母和连字符');
    }
    
    if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('版本号格式不正确，应为 x.x.x');
    }
    
    return true;
  }
  
  /**
   * 获取插件分类
   */
  export function getPluginCategories() {
    return {
      'info': '信息显示',
      'time': '时间日期', 
      'weather': '天气',
      'sensor': '传感器',
      'control': '设备控制',
      'media': '媒体',
      'system': '系统'
    };
  }
  
  /**
   * 插件开发工具
   */
  export class PluginDeveloperTools {
    static validatePluginClass(PluginClass) {
      const requiredMethods = ['getTemplate', 'getStyles'];
      const missingMethods = requiredMethods.filter(method => 
        typeof PluginClass.prototype[method] !== 'function'
      );
      
      if (missingMethods.length > 0) {
        throw new Error(`插件类缺少必需方法: ${missingMethods.join(', ')}`);
      }
      
      return true;
    }
    
    static generatePluginStub(pluginId, pluginName) {
      return `
  // 插件模板: ${pluginName}
  import { BasePlugin } from '../core/base-plugin.js';
  
  export const manifest = {
    id: '${pluginId}',
    name: '${pluginName}',
    version: '1.0.0',
    description: '${pluginName} 插件描述',
    author: 'Your Name',
    category: 'info',
    icon: '🔧',
    entityRequirements: [
      {
        key: 'example_source',
        description: '示例数据源',
        required: false
      }
    ],
    themeSupport: true,
    gradientSupport: false
  };
  
  export default class ${this._toPascalCase(pluginId)}Plugin extends BasePlugin {
    getTemplate(config, hass, entities) {
      const exampleData = this._getCardValue(hass, entities, 'example_source', '默认值');
      
      return \`
        <div class="cardforge-card ${pluginId}-card">
          <div class="card-content">
            <div class="example-text">\${exampleData}</div>
          </div>
        </div>
      \`;
    }
  
    getStyles(config) {
      return this.getBaseStyles(config) + \`
        .${pluginId}-card {
          \${this._responsivePadding('20px', '16px')}
          \${this._responsiveHeight('120px', '100px')}
          \${this._flexCenter()}
        }
        
        .example-text {
          \${this._responsiveFontSize('1.2em', '1em')}
          color: var(--primary-color);
        }
      \`;
    }
  }
      `.trim();
    }
    
    static _toPascalCase(str) {
      return str.replace(/(^\w|-\w)/g, match => match.replace('-', '').toUpperCase());
    }
  }
  
  /**
   * 插件质量检查
   */
  export class PluginQualityChecker {
    static checkPluginQuality(pluginClass, manifest) {
      const issues = [];
      
      // 检查清单完整性
      if (!manifest.icon) {
        issues.push('建议添加图标(icon)字段');
      }
      
      if (!manifest.entityRequirements) {
        issues.push('建议明确定义实体需求(entityRequirements)');
      }
      
      // 检查样式响应式
      const styles = new pluginClass().getStyles({});
      if (!styles.includes('@media')) {
        issues.push('建议添加响应式样式支持');
      }
      
      // 检查主题支持
      if (!manifest.themeSupport) {
        issues.push('建议添加主题支持');
      }
      
      return {
        score: Math.max(0, 10 - issues.length),
        issues,
        suggestions: issues.map(issue => `💡 ${issue}`)
      };
    }
  }