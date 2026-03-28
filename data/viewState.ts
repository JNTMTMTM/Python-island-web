/**
 * @file viewState.ts
 * @description 视图状态类型定义
 * @description 定义整个页面导航系统的所有视图状态标识符
 * @author 鸡哥
 */

/**
 * 视图状态类型
 * @description 枚举页面导航的所有视图，用于控制内容切换和 3D 场景旋转
 */
export type ViewState = 'hero' | 'features' | 'branches' | 'develop' | 'contributors' | 'download';
