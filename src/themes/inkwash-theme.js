// 水墨主题 - 宣纸质感背景版
export const theme = {
  id: 'inkwash',
  name: '水墨',
  description: '手工宣纸质感，温暖书卷气息',
  icon: '🖌️',
  
  styles: `
    .cardforge-container {
      /* === 核心：双层宣纸背景 === */
      
      /* 第一层：宣纸基底色 - 暖米白，年代感 */
      background-color: color-mix(
        in srgb,
        var(--cf-neutral-50),
        color-mix(
          in srgb,
          var(--cf-warning-color),
          transparent 92%
        ) 12%
      );
      
      /* 第二层：手工纸纤维纹理 - 极淡光影变化 */
      background-image: 
        /* 45度纤维纹理 - 主纤维走向 */
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), 0.008) 1px,
          rgba(var(--cf-text-primary-rgb), 0.008) 2px,
          transparent 2px,
          transparent 4px
        ),
        
        /* 135度交叉纹理 - 增加层次 */
        repeating-linear-gradient(
          135deg,
          transparent,
          transparent 1px,
          rgba(var(--cf-text-primary-rgb), 0.006) 1px,
          rgba(var(--cf-text-primary-rgb), 0.006) 1.5px,
          transparent 1.5px,
          transparent 3px
        ),
        
        /* 顶部微光 - 模拟光线下的纸面 */
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.02) 0%,
          transparent 4%
        );
      
      background-blend-mode: multiply;
      background-size: 
        8px 8px,   /* 纤维纹理尺寸 */
        6px 6px,   /* 交叉纹理尺寸 */
        100% 100%; /* 顶部微光尺寸 */
      
      /* 宣纸边缘质感 */
      border: 0.8px solid rgba(var(--cf-text-primary-rgb), 0.12);
      
      /* 极浅的纸面阴影，增加立体感 */
      box-shadow: 
        inset 0 0 40px rgba(255, 255, 255, 0.7), /* 纸面内发光 */
        0 1px 2px rgba(0, 0, 0, 0.03),           /* 柔和投影 */
        0 0 0 0.5px rgba(var(--cf-text-primary-rgb), 0.05); /* 极细边框 */
      
      /* 中式排版字体 */
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif);
      position: relative;
      overflow: hidden;
    }
    
    /* === 纸张毛边效果 - 极细的边缘纹理 === */
    .cardforge-container::before {
      content: '';
      position: absolute;
      top: -0.3px;
      left: -0.3px;
      right: -0.3px;
      bottom: -0.3px;
      background-image: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 0.3px,
          rgba(var(--cf-text-primary-rgb), 0.02) 0.3px,
          rgba(var(--cf-text-primary-rgb), 0.02) 0.6px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 0.3px,
          rgba(var(--cf-text-primary-rgb), 0.02) 0.3px,
          rgba(var(--cf-text-primary-rgb), 0.02) 0.6px
        );
      pointer-events: none;
      border-radius: inherit;
      z-index: 1;
      opacity: 0.3;
    }
    
    /* === 卡片内容优化 === */
    
    /* 大标题使用中式字体 */
    .cardforge-container .greeting,
    .cardforge-container .clock-time,
    .cardforge-container .poetry-title,
    .cardforge-container .week-number {
      font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', var(--cf-font-family-base, serif);
      font-weight: var(--cf-font-weight-bold);
      letter-spacing: 0.25px;
      color: var(--cf-text-primary);
      text-shadow: 0.5px 0.5px 0 rgba(255, 255, 255, 0.5); /* 纸面文字反光 */
    }
    
    /* === 块样式适配 === */
    
    /* 标题块 - 淡墨色底 */
    .cardforge-container .area-header {
      background: rgba(var(--cf-primary-color-rgb), 0.06);
      border-left: 2px solid rgba(var(--cf-primary-color-rgb), 0.25);
      border-radius: var(--cf-radius-sm);
      backdrop-filter: blur(1px); /* 轻微毛玻璃效果，模拟墨色晕染 */
    }
    
    /* 内容块 - 干净纸面 */
    .cardforge-container .area-content {
      background: rgba(255, 255, 255, 0.88); /* 半透明白，透出底层宣纸 */
      border: 0.6px solid rgba(var(--cf-text-primary-rgb), 0.09);
      border-radius: var(--cf-radius-sm);
      box-shadow: 
        inset 0 1px 2px rgba(255, 255, 255, 0.6),
        0 1px 1px rgba(0, 0, 0, 0.02);
    }
    
    /* 页脚块 - 轻微染色 */
    .cardforge-container .area-footer {
      background: rgba(var(--cf-accent-color-rgb), 0.03);
      border-top: 0.6px solid rgba(var(--cf-text-primary-rgb), 0.07);
      border-radius: var(--cf-radius-sm);
      font-size: var(--cf-font-size-sm);
    }
    
    /* 块图标 - 墨色边框 */
    .cardforge-container .block-icon {
      background: rgba(var(--cf-primary-color-rgb), 0.08);
      color: var(--cf-primary-color);
      border: 0.6px solid rgba(var(--cf-primary-color-rgb), 0.15);
    }
    
    /* === 深色模式：冷灰宣纸 === */
    @media (prefers-color-scheme: dark) {
      .cardforge-container {
        /* 冷灰色宣纸基底 */
        background-color: color-mix(
          in srgb,
          var(--cf-background),
          color-mix(
            in srgb,
            var(--cf-neutral-100),
            transparent 85%
          ) 18%
        );
        
        /* 深色模式纹理 - 更低调 */
        background-image: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.006) 1px,
            rgba(255, 255, 255, 0.006) 2px,
            transparent 2px,
            transparent 4px
          ),
          repeating-linear-gradient(
            135deg,
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.004) 1px,
            rgba(255, 255, 255, 0.004) 1.5px,
            transparent 1.5px,
            transparent 3px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.015) 0%,
            transparent 4%
          );
        
        border-color: rgba(255, 255, 255, 0.09);
        box-shadow: 
          inset 0 0 40px rgba(0, 0, 0, 0.2),
          0 1px 2px rgba(0, 0, 0, 0.1),
          0 0 0 0.5px rgba(255, 255, 255, 0.04);
      }
      
      /* 深色模式毛边 */
      .cardforge-container::before {
        background-image: 
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 0.3px,
            rgba(255, 255, 255, 0.015) 0.3px,
            rgba(255, 255, 255, 0.015) 0.6px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 0.3px,
            rgba(255, 255, 255, 0.015) 0.3px,
            rgba(255, 255, 255, 0.015) 0.6px
          );
        opacity: 0.25;
      }
      
      /* 深色模式标题文字优化 */
      .cardforge-container .greeting,
      .cardforge-container .clock-time,
      .cardforge-container .poetry-title,
      .cardforge-container .week-number {
        text-shadow: 0.5px 0.5px 0 rgba(0, 0, 0, 0.3);
      }
      
      /* 深色模式块样式 */
      .cardforge-container .area-header {
        background: rgba(var(--cf-primary-color-rgb), 0.09);
        border-left-color: rgba(var(--cf-primary-color-rgb), 0.35);
      }
      
      .cardforge-container .area-content {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 
          inset 0 1px 2px rgba(0, 0, 0, 0.2),
          0 1px 1px rgba(0, 0, 0, 0.05);
      }
      
      .cardforge-container .area-footer {
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-top-color: rgba(255, 255, 255, 0.06);
      }
      
      .cardforge-container .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.12);
        border-color: rgba(var(--cf-primary-color-rgb), 0.2);
      }
    }
    
    /* === 响应式优化 === */
    
    /* 平板：简化纹理 */
    @container cardforge-container (max-width: 768px) {
      .cardforge-container {
        background-image: 
          /* 只保留主纤维纹理 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 1px,
            rgba(var(--cf-text-primary-rgb), 0.006) 1px,
            rgba(var(--cf-text-primary-rgb), 0.006) 2px,
            transparent 2px,
            transparent 6px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.015) 0%,
            transparent 3%
          );
        
        background-size: 
          12px 12px,
          100% 100%;
        
        /* 减弱毛边效果 */
        &::before {
          opacity: 0.2;
        }
      }
    }
    
    /* 手机：移除纹理，只保留底色 */
    @container cardforge-container (max-width: 480px) {
      .cardforge-container {
        background-image: none; /* 移除所有纹理 */
        
        /* 简化阴影 */
        box-shadow: 
          inset 0 0 20px rgba(255, 255, 255, 0.5),
          0 1px 1px rgba(0, 0, 0, 0.02);
        
        /* 移除毛边 */
        &::before {
          display: none;
        }
      }
      
      /* 手机端块内边距优化 */
      .cardforge-container .area-header,
      .cardforge-container .area-content,
      .cardforge-container .area-footer {
        padding: var(--cf-spacing-sm);
      }
    }
    
    /* === 特殊模式支持 === */
    
    /* 高对比度模式：完全简化 */
    @media (prefers-contrast: high) {
      .cardforge-container {
        background-color: var(--cf-background) !important;
        background-image: none !important;
        border: 1px solid var(--cf-border) !important;
        box-shadow: var(--cf-shadow-sm) !important;
        
        &::before {
          display: none !important;
        }
      }
    }
    
    /* 性能模式：禁用部分效果 */
    @media (prefers-reduced-motion: reduce) {
      .cardforge-container {
        /* 禁用可能引起性能问题的效果 */
        backdrop-filter: none;
      }
    }
    
    /* 打印样式：纯白背景 */
    @media print {
      .cardforge-container {
        background-color: white !important;
        background-image: none !important;
        border: 1px solid #ddd !important;
        box-shadow: none !important;
        
        &::before {
          display: none !important;
        }
      }
    }
  `,
  
  preview: {
    // 预览展示宣纸质感
    background: `
      color-mix(in srgb, var(--cf-neutral-50), 
        color-mix(in srgb, var(--cf-warning-color), transparent 92%) 12%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 1px,
        rgba(var(--cf-text-primary-rgb), 0.008) 1px,
        rgba(var(--cf-text-primary-rgb), 0.008) 2px,
        transparent 2px,
        transparent 8px
      )
    `,
    color: 'var(--cf-text-primary)',
    border: '0.8px solid rgba(var(--cf-text-primary-rgb), 0.12)',
    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.7), 0 1px 2px rgba(0, 0, 0, 0.03)'
  }
};