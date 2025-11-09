// ha-cardforge-card/components/theme.js (添加新主题)
static _registerBuiltinThemes() {
  const builtinThemes = {
    'default': {
      id: 'default',
      name: '默认主题',
      icon: '🎨',
      description: '使用 Home Assistant 默认主题',
      type: 'builtin',
      variables: {
        '--cardforge-bg-color': 'var(--card-background-color)',
        '--cardforge-text-color': 'var(--primary-text-color)',
        '--cardforge-primary-color': 'var(--primary-color)',
        '--cardforge-border-radius': 'var(--ha-card-border-radius, 12px)',
        '--cardforge-shadow': 'var(--ha-card-box-shadow, none)'
      }
    },
    'dark': {
      id: 'dark',
      name: '深色主题',
      icon: '🌙',
      description: '适合暗色模式的深色主题',
      type: 'builtin',
      variables: {
        '--cardforge-bg-color': '#1e1e1e',
        '--cardforge-text-color': '#ffffff',
        '--cardforge-primary-color': '#bb86fc',
        '--cardforge-border-radius': '12px',
        '--cardforge-shadow': '0 4px 8px rgba(0,0,0,0.3)'
      }
    },
    'material': {
      id: 'material',
      name: '材质设计',
      icon: '⚡',
      description: 'Google Material Design 风格',
      type: 'builtin',
      variables: {
        '--cardforge-bg-color': '#fafafa',
        '--cardforge-text-color': '#212121',
        '--cardforge-primary-color': '#6200ee',
        '--cardforge-border-radius': '8px',
        '--cardforge-shadow': '0 3px 6px rgba(0,0,0,0.16)'
      }
    },
    'glass': {
      id: 'glass',
      name: '玻璃拟态',
      icon: '🔮',
      description: '毛玻璃效果现代设计',
      type: 'builtin',
      variables: {
        '--cardforge-bg-color': 'rgba(255, 255, 255, 0.1)',
        '--cardforge-text-color': '#ffffff',
        '--cardforge-primary-color': '#ffffff',
        '--cardforge-border-radius': '16px',
        '--cardforge-shadow': '0 8px 32px rgba(0,0,0,0.1)',
        '--cardforge-backdrop': 'blur(10px)'
      }
    }
  };

  Object.entries(builtinThemes).forEach(([id, theme]) => {
    this._themes.set(id, theme);
  });
}