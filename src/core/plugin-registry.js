// src/core/plugin-registry.js
class PluginRegistry {
  static _plugins = new Map();

  static async initialize() {
    if (this._plugins.size > 0) return;

    const plugins = [
      await import('../plugins/simple-clock.js'),
      await import('../plugins/welcome-card.js'),
      await import('../plugins/weather-card.js'),
      await import('../plugins/time-week.js')
    ];

    plugins.forEach(module => {
      if (module.manifest && module.default) {
        this._plugins.set(module.manifest.id, {
          manifest: module.manifest,
          class: module.default
        });
      }
    });
  }

  static getPlugin(id) {
    return this._plugins.get(id);
  }

  static getAllPlugins() {
    return Array.from(this._plugins.values()).map(p => p.manifest);
  }

  static createInstance(id) {
    const plugin = this._plugins.get(id);
    return plugin ? new plugin.class() : null;
  }
}

export { PluginRegistry };