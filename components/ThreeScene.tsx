/**
 * @file ThreeScene.tsx
 * @description Three.js 3D 场景组件
 * @description 创建并管理 Three.js 场景，包括岛屿、光效、粒子等 3D 元素
 * @description 提供对外接口供父组件控制场景动画
 * @author 鸡哥
 */

'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { createScene, addLights, createIslandGroup, createOuterGlowLayers, createCoreGlow, createParticles, createMouseTracker, createAnimationState, GlowLayer } from '@/lib/three/createElements';
import { createAnimationLoop, AnimationState, SceneElements, SceneRefs, TransitionState } from '@/lib/three/animate';
import type { ThreeSceneHandle } from '@/lib/three/types';
import type { ViewState } from '@/data/viewState';
export type { ThreeSceneHandle } from '@/lib/three/types';

/**
 * ThreeScene 组件属性接口
 */
interface ThreeSceneInnerProps {
  /** 当前激活的视图状态 */
  activeView: ViewState;
}

/**
 * ThreeScene 内部组件
 * @description 使用 forwardRef 暴露控制方法给父组件
 * @param props - 组件属性
 * @param props.activeView - 当前激活的视图
 * @param ref - 组件引用
 * @returns JSX.Element
 */
export const ThreeSceneInner = forwardRef<ThreeSceneHandle, ThreeSceneInnerProps>(function ThreeSceneInner({ activeView }, ref) {
  // ==================== 引用定义 ====================

  /** 容器引用 */
  const containerRef = useRef<HTMLDivElement>(null);

  /** 悬停状态引用 */
  const hoverRef = useRef(false);

  /** 过渡进度引用（0~1） */
  const transitionRef = useRef(0);

  /**
   * 多视图目标位置引用（0 / 0.5 / 1）
   * @description 必须是 ref，以便 useImperativeHandle 可以访问
   */
  const viewTargetRef = useRef(0);

  /** 当前色相引用，用于与 CSS 同步 */
  const hueRef = useRef(0);

  // ==================== 暴露控制方法 ====================

  /**
   * 暴露给父组件的控制方法
   * @description 使用 useImperativeHandle 自定义暴露给父组件的引用
   */
  useImperativeHandle(ref, () => ({
    /**
     * 设置悬停状态
     * @param active - 是否悬停
     */
    setHover: (active: boolean) => {
      hoverRef.current = active;
    },
    /**
     * 设置动画期间的缓动进度值（过渡时为 0→1）
     * @param progress - 进度值（0~1）
     */
    setTransition: (progress: number) => {
      transitionRef.current = progress;
    },
    /**
     * 设置多视图目标位置：0=hero, 0.33=features, 0.55=branches, 0.78=develop, 1=contributors
     * @param target - 目标位置（0~1）
     */
    setViewTarget: (target: number) => {
      viewTargetRef.current = target;
    },
    /** 色相引用，用于外部读取 */
    hueRef,
  }));

  // ==================== 初始化 Three.js 场景 ====================

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;

  // 创建场景
  const { scene, camera, renderer } = createScene(container);

  // 添加灯光
  addLights(scene);

  // 创建岛屿组（包含胶囊体和内部光效）
  const { group: islandGroup, pill, glow, glowMat } = createIslandGroup();
  scene.add(islandGroup);

  // 创建外部光效层
  const outerGlowLayers: GlowLayer[] = createOuterGlowLayers(islandGroup);

  // 创建核心光效
  const coreMat: THREE.MeshBasicMaterial = createCoreGlow(islandGroup);

  // 创建粒子系统
  const { points: particles, mat: particleMat } = createParticles(scene);

  // 创建射线检测器（用于鼠标悬停检测）
  const raycaster = new THREE.Raycaster();

  // 创建鼠标跟踪器
  const { mouse, onMouseMove } = createMouseTracker();
    window.addEventListener('mousemove', onMouseMove);

    // 创建动画状态
    const animationState: AnimationState = createAnimationState();
    const transitionState: TransitionState = { current: 0, multiViewTarget: 0 };

    // 封装场景元素
    const elements: SceneElements = {
      islandGroup,
      pill,
      glow,
      glowMat,
      outerGlowLayers,
      coreMat,
      particles,
      particleMat,
      raycaster,
    };

    // 封装引用
    const refs: SceneRefs = { mouse, hoverRef, transitionRef, viewTargetRef, transitionState, hueRef };

    // 启动动画循环
    const cleanup = createAnimationLoop(renderer, scene, camera, elements, refs, animationState);

    // 窗口大小改变处理
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 清理函数
    return () => {
      cleanup();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ==================== 计算属性 ====================

  /** 是否已越过分支页面（需要隐藏 3D 场景） */
  const pastBranches = activeView !== 'hero'
    && activeView !== 'features'
    && activeView !== 'branches';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        opacity: pastBranches ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: pastBranches ? 'none' : 'auto',
      }}
      aria-hidden="true"
    />
  );
});
