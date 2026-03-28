/**
 * @file phase.ts
 * @description 页面过渡阶段类型定义
 * @description 定义页面切换动画的阶段状态
 * @author 鸡哥
 */

/**
 * 页面过渡阶段类型
 * @description 用于控制页面内容的过渡动画和动态岛导航高亮跟随
 */
export type Phase = 'idle' | 'transitioning';
