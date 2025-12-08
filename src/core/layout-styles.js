import { css } from 'https://unpkg.com/lit@3.1.3/index.js?module';

/**
 * 布局样式工具 - 提供通用的布局类
 * 不包含卡片特定的样式
 */

// 基础布局类
export const layoutStyles = css`
  /* ===== 通用布局工具类 ===== */
  
  /* 容器查询基础 */
  .cf-container {
    container-type: inline-size;
    container-name: cf-container;
  }
  
  /* 弹性布局 */
  .cf-flex { display: flex; }
  .cf-flex-col { display: flex; flex-direction: column; }
  .cf-flex-row { display: flex; flex-direction: row; }
  .cf-flex-wrap { flex-wrap: wrap; }
  .cf-flex-nowrap { flex-wrap: nowrap; }
  
  /* 对齐方式 */
  .cf-items-start { align-items: flex-start; }
  .cf-items-center { align-items: center; }
  .cf-items-end { align-items: flex-end; }
  .cf-items-stretch { align-items: stretch; }
  .cf-items-baseline { align-items: baseline; }
  
  .cf-justify-start { justify-content: flex-start; }
  .cf-justify-center { justify-content: center; }
  .cf-justify-end { justify-content: flex-end; }
  .cf-justify-between { justify-content: space-between; }
  .cf-justify-around { justify-content: space-around; }
  .cf-justify-evenly { justify-content: space-evenly; }
  
  /* 网格布局 */
  .cf-grid { display: grid; }
  .cf-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .cf-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cf-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cf-grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .cf-grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .cf-grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  
  /* 间距 */
  .cf-gap-xs { gap: var(--cf-spacing-xs); }
  .cf-gap-sm { gap: var(--cf-spacing-sm); }
  .cf-gap-md { gap: var(--cf-spacing-md); }
  .cf-gap-lg { gap: var(--cf-spacing-lg); }
  .cf-gap-xl { gap: var(--cf-spacing-xl); }
  
  /* 内外边距 */
  .cf-p-0 { padding: 0; }
  .cf-p-xs { padding: var(--cf-spacing-xs); }
  .cf-p-sm { padding: var(--cf-spacing-sm); }
  .cf-p-md { padding: var(--cf-spacing-md); }
  .cf-p-lg { padding: var(--cf-spacing-lg); }
  .cf-p-xl { padding: var(--cf-spacing-xl); }
  
  .cf-px-xs { padding-left: var(--cf-spacing-xs); padding-right: var(--cf-spacing-xs); }
  .cf-px-sm { padding-left: var(--cf-spacing-sm); padding-right: var(--cf-spacing-sm); }
  .cf-px-md { padding-left: var(--cf-spacing-md); padding-right: var(--cf-spacing-md); }
  .cf-px-lg { padding-left: var(--cf-spacing-lg); padding-right: var(--cf-spacing-lg); }
  .cf-px-xl { padding-left: var(--cf-spacing-xl); padding-right: var(--cf-spacing-xl); }
  
  .cf-py-xs { padding-top: var(--cf-spacing-xs); padding-bottom: var(--cf-spacing-xs); }
  .cf-py-sm { padding-top: var(--cf-spacing-sm); padding-bottom: var(--cf-spacing-sm); }
  .cf-py-md { padding-top: var(--cf-spacing-md); padding-bottom: var(--cf-spacing-md); }
  .cf-py-lg { padding-top: var(--cf-spacing-lg); padding-bottom: var(--cf-spacing-lg); }
  .cf-py-xl { padding-top: var(--cf-spacing-xl); padding-bottom: var(--cf-spacing-xl); }
  
  .cf-m-0 { margin: 0; }
  .cf-m-xs { margin: var(--cf-spacing-xs); }
  .cf-m-sm { margin: var(--cf-spacing-sm); }
  .cf-m-md { margin: var(--cf-spacing-md); }
  .cf-m-lg { margin: var(--cf-spacing-lg); }
  .cf-m-xl { margin: var(--cf-spacing-xl); }
  
  .cf-mx-auto { margin-left: auto; margin-right: auto; }
  
  /* 宽度和高度 */
  .cf-w-full { width: 100%; }
  .cf-w-screen { width: 100vw; }
  .cf-w-min { width: min-content; }
  .cf-w-max { width: max-content; }
  .cf-w-fit { width: fit-content; }
  
  .cf-h-full { height: 100%; }
  .cf-h-screen { height: 100vh; }
  .cf-h-min { height: min-content; }
  .cf-h-max { height: max-content; }
  .cf-h-fit { height: fit-content; }
  
  .cf-min-w-0 { min-width: 0; }
  .cf-min-h-0 { min-height: 0; }
  
  /* 文本对齐 */
  .cf-text-left { text-align: left; }
  .cf-text-center { text-align: center; }
  .cf-text-right { text-align: right; }
  .cf-text-justify { text-align: justify; }
  
  /* 文本溢出 */
  .cf-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .cf-line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .cf-line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .cf-line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  /* 定位 */
  .cf-relative { position: relative; }
  .cf-absolute { position: absolute; }
  .cf-fixed { position: fixed; }
  .cf-sticky { position: sticky; }
  
  .cf-top-0 { top: 0; }
  .cf-right-0 { right: 0; }
  .cf-bottom-0 { bottom: 0; }
  .cf-left-0 { left: 0; }
  
  .cf-inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  
  /* 显示隐藏 */
  .cf-hidden { display: none; }
  .cf-block { display: block; }
  .cf-inline { display: inline; }
  .cf-inline-block { display: inline-block; }
  
  /* 溢出 */
  .cf-overflow-auto { overflow: auto; }
  .cf-overflow-hidden { overflow: hidden; }
  .cf-overflow-scroll { overflow: scroll; }
  .cf-overflow-x-auto { overflow-x: auto; }
  .cf-overflow-y-auto { overflow-y: auto; }
  
  /* 圆角 */
  .cf-rounded-none { border-radius: 0; }
  .cf-rounded-xs { border-radius: var(--cf-radius-xs); }
  .cf-rounded-sm { border-radius: var(--cf-radius-sm); }
  .cf-rounded-md { border-radius: var(--cf-radius-md); }
  .cf-rounded-lg { border-radius: var(--cf-radius-lg); }
  .cf-rounded-xl { border-radius: var(--cf-radius-xl); }
  .cf-rounded-pill { border-radius: var(--cf-radius-pill); }
  .cf-rounded-circle { border-radius: var(--cf-radius-circle); }
  
  .cf-rounded-t-none { border-top-left-radius: 0; border-top-right-radius: 0; }
  .cf-rounded-r-none { border-top-right-radius: 0; border-bottom-right-radius: 0; }
  .cf-rounded-b-none { border-bottom-right-radius: 0; border-bottom-left-radius: 0; }
  .cf-rounded-l-none { border-top-left-radius: 0; border-bottom-left-radius: 0; }
  
  /* 边框 */
  .cf-border { border: 1px solid var(--cf-border); }
  .cf-border-t { border-top: 1px solid var(--cf-border); }
  .cf-border-r { border-right: 1px solid var(--cf-border); }
  .cf-border-b { border-bottom: 1px solid var(--cf-border); }
  .cf-border-l { border-left: 1px solid var(--cf-border); }
  
  .cf-border-none { border: none; }
  
  /* 阴影 */
  .cf-shadow-none { box-shadow: none; }
  .cf-shadow-xs { box-shadow: var(--cf-shadow-xs); }
  .cf-shadow-sm { box-shadow: var(--cf-shadow-sm); }
  .cf-shadow-md { box-shadow: var(--cf-shadow-md); }
  .cf-shadow-lg { box-shadow: var(--cf-shadow-lg); }
  .cf-shadow-xl { box-shadow: var(--cf-shadow-xl); }
  .cf-shadow-inner { box-shadow: var(--cf-shadow-inner); }
  
  /* 透明度 */
  .cf-opacity-0 { opacity: 0; }
  .cf-opacity-25 { opacity: 0.25; }
  .cf-opacity-50 { opacity: 0.5; }
  .cf-opacity-75 { opacity: 0.75; }
  .cf-opacity-100 { opacity: 1; }
  
  /* 指针事件 */
  .cf-pointer-events-none { pointer-events: none; }
  .cf-pointer-events-auto { pointer-events: auto; }
  
  /* 用户选择 */
  .cf-select-none { user-select: none; }
  .cf-select-text { user-select: text; }
  .cf-select-all { user-select: all; }
  
  /* 过渡动画 */
  .cf-transition-all { transition: all var(--cf-transition-normal); }
  .cf-transition-colors { transition: color var(--cf-transition-normal), 
                               background-color var(--cf-transition-normal), 
                               border-color var(--cf-transition-normal); }
  .cf-transition-opacity { transition: opacity var(--cf-transition-normal); }
  .cf-transition-transform { transition: transform var(--cf-transition-normal); }
  
  /* 变换 */
  .cf-transform { transform: translate(var(--cf-translate-x), var(--cf-translate-y)) 
                          rotate(var(--cf-rotate)) 
                          scale(var(--cf-scale-x), var(--cf-scale-y)); }
  .cf-transform-none { transform: none; }
  
  .cf-translate-x-0 { --cf-translate-x: 0; }
  .cf-translate-x-full { --cf-translate-x: 100%; }
  .cf-translate-y-0 { --cf-translate-y: 0; }
  .cf-translate-y-full { --cf-translate-y: 100%; }
  
  /* 层级 */
  .cf-z-0 { z-index: 0; }
  .cf-z-10 { z-index: 10; }
  .cf-z-20 { z-index: 20; }
  .cf-z-30 { z-index: 30; }
  .cf-z-40 { z-index: 40; }
  .cf-z-50 { z-index: 50; }
  
  /* 滚动行为 */
  .cf-scroll-smooth { scroll-behavior: smooth; }
  .cf-scroll-auto { scroll-behavior: auto; }
  
  /* 滚动条样式 */
  .cf-scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .cf-scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .cf-scrollbar-thin::-webkit-scrollbar-track {
    background: var(--cf-neutral-100);
    border-radius: var(--cf-radius-sm);
  }
  
  .cf-scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--cf-neutral-400);
    border-radius: var(--cf-radius-sm);
  }
  
  .cf-scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: var(--cf-neutral-500);
  }
  
  /* 深色模式滚动条 */
  @media (prefers-color-scheme: dark) {
    .cf-scrollbar-thin::-webkit-scrollbar-track {
      background: var(--cf-neutral-800);
    }
    
    .cf-scrollbar-thin::-webkit-scrollbar-thumb {
      background: var(--cf-neutral-600);
    }
    
    .cf-scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: var(--cf-neutral-500);
    }
  }
`;

/**
 * 创建容器查询媒体查询
 * @param {string} containerName - 容器名称
 * @param {string} maxWidth - 最大宽度
 * @returns {string} CSS字符串
 */
export function createContainerQuery(containerName, maxWidth) {
  return `
    @container ${containerName} (max-width: ${maxWidth}) {
      .cf-responsive-${maxWidth.replace('px', '')} {
        /* 响应式样式将在这里应用 */
      }
    }
  `;
}

/**
 * 响应式断点
 */
export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

/**
 * 生成响应式工具类
 */
export const responsiveStyles = css`
  /* 小屏幕 (<= 480px) */
  @media (max-width: 480px) {
    .cf-sm-hidden { display: none; }
    .cf-sm-block { display: block; }
    .cf-sm-flex { display: flex; }
    .cf-sm-grid { display: grid; }
    
    .cf-sm-flex-col { flex-direction: column; }
    .cf-sm-flex-row { flex-direction: row; }
    
    .cf-sm-text-center { text-align: center; }
    .cf-sm-text-left { text-align: left; }
    .cf-sm-text-right { text-align: right; }
  }
  
  /* 中等屏幕 (<= 768px) */
  @media (max-width: 768px) {
    .cf-md-hidden { display: none; }
    .cf-md-block { display: block; }
    .cf-md-flex { display: flex; }
    .cf-md-grid { display: grid; }
    
    .cf-md-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .cf-md-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  
  /* 大屏幕 (<= 1024px) */
  @media (max-width: 1024px) {
    .cf-lg-hidden { display: none; }
    .cf-lg-block { display: block; }
    .cf-lg-flex { display: flex; }
    .cf-lg-grid { display: grid; }
    
    .cf-lg-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .cf-lg-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cf-lg-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
`;

/**
 * 组合所有布局样式
 */
export const allLayoutStyles = css`
  ${layoutStyles}
  ${responsiveStyles}
`;
