/**
 * @file types.ts
 * @description Three.js 场景组件的类型定义
 * @description 定义 ThreeScene 组件暴露给父组件的句柄接口
 * @author 鸡哥
 */

/**
 * Three.js 场景组件句柄接口
 * @description 通过 forwardRef + useImperativeHandle 向父组件（ScrollShowcase）暴露控制方法
 * @description 用于控制悬停状态、过渡动画和视图目标切换
 */
export interface ThreeSceneHandle {
  /**
   * 设置悬停状态
   * @description 通知 Three.js 场景当前是否悬停在岛屿上，触发彩虹光效
   * @param active - 是否悬停
   */
  setHover: (active: boolean) => void;
  /**
   * 设置过渡进度
   * @description 接收来自 React 侧的缓动进度值（0~1），驱动 3D 岛屿旋转动画
   * @param progress - 缓动进度值（0~1）
   */
  setTransition: (progress: number) => void;
  /**
   * 设置视图目标
   * @description 设置多视图目标位置，用于控制岛屿旋转角度和相机距离
   * @description 0=hero（水平），0.33=features，0.55=branches，0.78=develop，1=contributors（垂直）
   * @param target - 目标位置（0~1）
   */
  setViewTarget: (target: number) => void;
  /**
   * 色相引用
   * @description 指向当前色相值的 React ref，用于 CSS 动画同步
   */
  hueRef: React.MutableRefObject<number>;
}
