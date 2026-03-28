/**
 * @file ScrollShowcase.tsx
 * @description 滚动展示容器组件，管理整个页面的滚动和视图切换
 * @description 处理页面过渡动画、3D 场景控制、滚轮事件监听等功能
 * @author 鸡哥
 */

'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { ThreeSceneHandle } from './ThreeScene';
import type { ViewState } from '../data/viewState';
import type { Phase } from '../data/phase';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import FeaturesContent from './FeaturesContent';
import BranchesContent from './BranchesContent';
import DevelopContent from './DevelopContent';
import ContributorContent from './ContributorContent';
import DownloadContent from './DownloadContent';

/**
 * 动态导入 Three.js 场景组件
 * @description 使用 Next.js 动态导入优化初始加载性能
 * @description 禁用 SSR 以避免服务端渲染问题
 */
const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle>; activeView: ViewState }>;

/**
 * 视图目标映射表
 * @description 定义每个视图在 3D 场景中的目标位置（0~1）
 * @description 这些值用于控制 3D 场景的相机位置和岛屿旋转
 */
const VIEW_TARGET: Record<ViewState, number> = {
  hero: 0,           // 首页：岛屿水平显示
  features: 0.33,    // 功能页：岛屿开始旋转
  branches: 0.55,     // 分支页：岛屿继续旋转
  develop: 0.78,     // 开发页：岛屿接近垂直
  contributors: 1,    // 贡献者页：岛屿垂直显示
  download: 1,        // 下载页：与贡献者页相同位置
};

/**
 * 页面过渡动画持续时间（毫秒）
 */
const DURATION = 800;

/**
 * 动画阶段状态接口
 * @description 定义过渡动画的当前阶段和目标视图
 */
interface PhaseState {
  /** 动画阶段：'idle'（静止）或 'transitioning'（过渡中） */
  phase: Phase;
  /** 过渡目标视图 */
  targetView: ViewState;
}

/**
 * 滚动展示容器组件属性接口
 */
interface ScrollShowcaseProps {
  /** 子组件 */
  children?: ReactNode;
  /** 初始视图 */
  initialView?: ViewState;
}

/**
 * 滚动展示容器组件
 * @description 管理整个页面的滚动交互和视图切换
 * @description 使用滚轮、点击等方式在各个页面之间切换
 * @param props - 组件属性
 * @param props.children - 子组件
 * @param props.initialView - 初始视图（默认为 'hero'）
 * @returns JSX.Element
 */
export default function ScrollShowcase({ children, initialView = 'hero' }: ScrollShowcaseProps) {
  // ==================== 状态定义 ====================

  /** 动画完成后的稳定视图 */
  const [view, setView] = useState<ViewState>(initialView);

  /** 动画阶段状态（过渡时显示目标视图） */
  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: 'idle', targetView: initialView });

  /** CSS 动画进度（0~1），用于控制内容淡入淡出 */
  const [progress, setProgress] = useState(1);

  /** 当前选中的贡献者索引（0~4），对应 Dock 栏 */
  const [currentDev, setCurrentDev] = useState(0);

  // ==================== 引用定义 ====================

  /** Three.js 场景引用，用于控制 3D 动画 */
  const threeRef = useRef<ThreeSceneHandle>(null);

  /** 容器引用，用于滚轮事件监听 */
  const containerRef = useRef<HTMLDivElement>(null);

  /** 是否正在过渡动画中 */
  const isTransitioning = useRef(false);

  /** 动画帧 ID，用于取消动画 */
  const transitionRafRef = useRef<number | null>(null);

  // ==================== 计算属性 ====================

  /** 当前激活的视图（动画过程中显示目标视图） */
  const activeView = phaseState.phase === 'idle' ? view : phaseState.targetView;

  // ==================== 页面过渡处理 ====================

  /**
   * 处理页面过渡动画
   * @description 根据滚轮方向执行页面切换动画
   * @description 使用 cubic-bezier 缓动函数实现平滑过渡
   * @param direction - 滚动方向：'down' 向下滚动，'up' 向上滚动
   */
  const handleTransition = useCallback((direction: 'down' | 'up') => {
    if (isTransitioning.current) return;

    const nextViewMap: Record<ViewState, ViewState | null> = {
      hero: direction === 'down' ? 'features' : null,
      features: direction === 'down' ? 'branches' : 'hero',
      branches: direction === 'down' ? 'develop' : 'features',
      develop: direction === 'down' ? 'contributors' : 'branches',
      contributors: direction === 'down' ? 'download' : 'develop',
      download: direction === 'up' ? 'contributors' : null,
    };

    const nextView = nextViewMap[view];
    if (!nextView) return;

    if (transitionRafRef.current !== null) {
      cancelAnimationFrame(transitionRafRef.current);
      transitionRafRef.current = null;
    }
    isTransitioning.current = true;
    const fromTarget = VIEW_TARGET[view];
    const toTarget = VIEW_TARGET[nextView];

    // 立即通知 Three.js 目标位置
    threeRef.current?.setViewTarget(toTarget);

    // 开始过渡动画
    setPhaseState({ phase: 'transitioning', targetView: nextView });
    setProgress(0);

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      // 缓动进度驱动旋转速度 - 使用与 React 动画相同的缓动曲线
      const easedProgress = fromTarget + (toTarget - fromTarget) * eased;
      threeRef.current?.setTransition(easedProgress);
      setProgress(eased);

      if (t < 1) {
        transitionRafRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成 - 稳定到新视图
        setView(nextView);
        setPhaseState({ phase: 'idle', targetView: nextView });
        setProgress(1);
        threeRef.current?.setTransition(toTarget);
        isTransitioning.current = false;
        transitionRafRef.current = null;
      }
    };
    transitionRafRef.current = requestAnimationFrame(animate);
  }, [view]);

  // URL 哈希同步
  useEffect(() => {
    const hash = `#${activeView}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', window.location.pathname + hash);
      window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
    }
  }, [activeView]);

  // 挂载时初始化 Three.js 至初始视图
  useEffect(() => {
    if (initialView !== 'hero' && threeRef.current) {
      const target = VIEW_TARGET[initialView];
      threeRef.current.setViewTarget(target);
      threeRef.current.setTransition(target);
    }
  }, []); // 仅在挂载时执行一次

  // 跨页直接导航 — 支持任意目标跳转
  const navigateTo = useCallback((target: ViewState) => {
    if (VIEW_TARGET[target] === undefined) return;

    if (transitionRafRef.current !== null) {
      cancelAnimationFrame(transitionRafRef.current);
      transitionRafRef.current = null;
    }
    isTransitioning.current = true;

    const fromTarget = VIEW_TARGET[view];
    const toTarget = VIEW_TARGET[target];

    threeRef.current?.setViewTarget(toTarget);
    setPhaseState({ phase: 'transitioning', targetView: target });
    setProgress(0);

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      const easedProgress = fromTarget + (toTarget - fromTarget) * eased;
      threeRef.current?.setTransition(easedProgress);
      setProgress(eased);

      window.dispatchEvent(new CustomEvent('pyisland:transition-progress', {
        detail: { progress: eased, target },
      }));

      if (t < 1) {
        transitionRafRef.current = requestAnimationFrame(animate);
      } else {
        setView(target);
        setPhaseState({ phase: 'idle', targetView: target });
        setProgress(1);
        threeRef.current?.setTransition(toTarget);
        window.dispatchEvent(new CustomEvent('pyisland:transition-progress', {
          detail: { progress: 1, target },
        }));
        isTransitioning.current = false;
        transitionRafRef.current = null;
      }
    };
    transitionRafRef.current = requestAnimationFrame(animate);
  }, [view]);
  // 记录上一次导航的 hash，防止 hashchange 和 pyisland:navigate 同时触发造成重复调用
  const lastHashRef = useRef<string>('');

  // 监听原生 hashchange（锚点点击）和自定义 pyisland:navigate（DynamicIsland 内部导航）
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const hash = (e as CustomEvent<{ hash: string }>).detail.hash;
      const target = hash.replace('#', '') as ViewState;
      lastHashRef.current = hash;
      navigateTo(target);
    };

    const handleHashChange = () => {
      const hash = window.location.hash || '#hero';
      if (lastHashRef.current === hash) return;
      lastHashRef.current = hash;
      const target = hash.replace('#', '') as ViewState;
      navigateTo(target);
    };

    window.addEventListener('pyisland:navigate', handleNavigate);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('pyisland:navigate', handleNavigate);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigateTo]);

  // 切换到指定贡献者并显示贡献者视图
  const switchToContributor = useCallback((index: number) => {
    setCurrentDev(index);
    if (view !== 'contributors') {
      navigateTo('contributors');
    }
  }, [view, navigateTo]);

  // 滚轮滚动
  useEffect(() => {
    let accumulator = 0;
    let timer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      // 在贡献者、开发指南、下载页面中不拦截滚轮事件 — 由各自页面自行处理
      if (view === 'contributors' || view === 'develop' || view === 'download') return;
      e.preventDefault();
      accumulator += e.deltaY;

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (Math.abs(accumulator) > 80) {
          if (accumulator > 0) handleTransition('down');
          else handleTransition('up');
        }
        accumulator = 0;
      }, 50);
    };

    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
      clearTimeout(timer);
    };
  }, [handleTransition]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#FFFFFF',
        userSelect: 'none',
      }}
    >
      {/* 背景渐变 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(245, 245, 247, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Three.js 画布 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2 }}>
        <ThreeScene ref={threeRef} activeView={activeView} />
      </div>

      {/* 首页 */}
      <HeroContent
        threeRef={threeRef}
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* 滚动指示器 — 仅在首页显示 */}
      <ScrollIndicator activeView={activeView} />

      {/* 功能页 */}
      <FeaturesContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* 分支页 */}
      <BranchesContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* 开发页 */}
      <DevelopContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
        onBackToBranches={() => navigateTo('branches')}
        onForwardToContributors={() => navigateTo('contributors')}
        onNavigate={navigateTo}
      />

      {/* 返回按钮 */}

      {/* 贡献者页 */}
      <ContributorContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
        currentDev={currentDev}
        onSwitchDev={switchToContributor}
        onNavigate={navigateTo}
      />

      {/* 下载页 */}
      <DownloadContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
        onBackToContributors={() => navigateTo('contributors')}
        onBackToHome={() => navigateTo('hero')}
        onNavigate={navigateTo}
      />
    </div>
  );
}
