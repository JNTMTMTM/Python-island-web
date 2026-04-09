/**
 * @file DynamicIsland.tsx
 * @description 顶部动态岛导航组件，处理页面路由和状态管理
 * @description 提供 macOS 风格的顶部导航栏，支持页面切换、分支版本切换、下载版本切换等功能
 * @author 鸡哥
 */

'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Github } from 'lucide-react';
import { developData } from '../data/developData';
import { downloadBranches, getDownloadBranches } from '../data/downloadData';
import type { DownloadBranch } from '../data/downloadData';

/**
 * 导航页面类型定义
 * @description 定义所有可导航的页面标识符
 */
type NavPage = '#hero' | '#features' | '#branches' | '#develop' | '#contributors' | '#download';

/**
 * 导航顺序数组
 * @description 定义页面的导航顺序，用于计算页面切换的上下文
 */
const NAV_ORDER: NavPage[] = ['#hero', '#features', '#branches', '#develop', '#contributors', '#download'];

/**
 * 页面标题配置
 * @description 定义每个页面的标题和副标题，用于在动态岛中显示
 * @key {NavPage} 页面标识符（排除首页）
 * @value {title: string; subtitle: string} 页面标题和副标题
 */
const PAGE_TITLES: Record<Exclude<NavPage, '#hero'>, { title: string; subtitle: string }> = {
  '#features': { title: '核心功能', subtitle: '每一个细节都为 Windows 用户精心打造' },
  '#branches': { title: '分支总览', subtitle: '探索 Pyisland 项目的多个分支版本' },
  '#develop': { title: '快速安装', subtitle: '选择版本，获取安装命令' },
  '#contributors': { title: '关于贡献者', subtitle: 'Python-island 项目团队' },
  '#download': { title: '立即下载', subtitle: '选择适合您的版本进行下载' },
};

/**
 * 动态岛导航组件
 * @description macOS 风格的顶部导航栏，支持页面切换和子项切换
 * @description 通过自定义事件与其他组件通信，实现联动效果
 * @returns JSX.Element
 */
export default function DynamicIsland() {
  // ==================== 状态定义 ====================

  /** 鼠标悬停状态，用于控制动态岛的高亮效果 */
  const [isHovered, setIsHovered] = useState(false);

  /** 当前激活的页面，用于导航高亮和内容切换 */
  const [activePage, setActivePage] = useState<NavPage>('#hero');

  /** 当前选中的开发分支索引（0~3），对应 developData 数组 */
  const [selectedBranch, setSelectedBranch] = useState(0);

  /** 当前选中的下载分支索引（0~3），对应 downloadBranches 数组 */
  const [selectedDownload, setSelectedDownload] = useState(0);

  /** 下载分支数据（含动态下载地址） */
  const [downloadOptions, setDownloadOptions] = useState<DownloadBranch[]>(downloadBranches);

  // ==================== 引用定义 ====================

  /** 功能按钮引用，用于计算指示器位置 */
  const featuresBtnRef = useRef<HTMLButtonElement>(null);

  /** 分支按钮引用，用于计算指示器位置 */
  const branchesBtnRef = useRef<HTMLButtonElement>(null);

  /** 开发按钮引用，用于计算指示器位置 */
  const developBtnRef = useRef<HTMLButtonElement>(null);

  /** 贡献者按钮引用，用于计算指示器位置 */
  const contributorsBtnRef = useRef<HTMLButtonElement>(null);

  /** 下载按钮引用，用于计算指示器位置 */
  const downloadBtnRef = useRef<HTMLButtonElement>(null);

  /**
   * 导航指示器样式状态
   * @description 控制底部高亮下划线的位置、宽度和透明度
   */
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // ==================== 导航函数 ====================

  /**
   * 页面导航函数
   * @description 更新 URL hash 并触发自定义导航事件
   * @param hash - 目标页面的 hash 值（如 '#features'）
   */
  const navigate = useCallback((hash: string) => {
    history.pushState(null, '', window.location.pathname + hash);
    window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
  }, []);

  // ==================== 事件监听器 ====================

  /**
   * 监听 URL hash 变化和自定义导航事件
   * @description 根据当前 URL hash 更新激活的页面状态
   * @description 监听浏览器原生 hashchange 事件和自定义 pyisland:navigate 事件
   */
  useEffect(() => {
    const updateActivePage = () => {
      const hash = (window.location.hash || '#hero') as NavPage;
      setActivePage(hash);
    };
    updateActivePage();

    const handleHashChange = () => updateActivePage();
    const handleNavigate = (e: Event) => {
      setActivePage((e as CustomEvent).detail.hash as NavPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('pyisland:navigate', handleNavigate);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('pyisland:navigate', handleNavigate);
    };
  }, []);

  /**
   * 监听页面过渡进度事件
   * @description 在页面切换过程中，根据过渡进度更新动态岛显示的页面
   * @description 实现页面切换时导航栏的高亮跟随效果
   */
  useEffect(() => {
    let rafId: number | null = null;

    const handleProgress = (e: Event) => {
      const { progress, target } = (e as CustomEvent<{ progress: number; target: string }>).detail;
      const targetPage = `#${target}` as NavPage;
      const currentIdx = NAV_ORDER.indexOf(activePage);
      const targetIdx = NAV_ORDER.indexOf(targetPage);

      if (currentIdx === -1 || targetIdx === -1 || currentIdx === targetIdx) return;

      const totalSteps = Math.abs(targetIdx - currentIdx);
      const step = targetIdx > currentIdx ? 1 : -1;
      const currentStepIdx = currentIdx + Math.floor(progress * totalSteps) * step;
      const isLastStep = (step > 0 && currentStepIdx >= targetIdx) || (step < 0 && currentStepIdx <= targetIdx);

      const pageToShow: NavPage = isLastStep ? targetPage : NAV_ORDER[Math.max(0, Math.min(NAV_ORDER.length - 1, currentStepIdx))];

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setActivePage(pageToShow);
      });
    };

    window.addEventListener('pyisland:transition-progress', handleProgress);
    return () => {
      window.removeEventListener('pyisland:transition-progress', handleProgress);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [activePage]);

  /**
   * 监听开发分支选择事件
   * @description 接收来自 DevelopContent 组件的分支选择事件（滚轮切换触发）
   * @description 更新动态岛显示的选中分支索引
   */
  useEffect(() => {
    const handleBranchSelect = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (idx !== selectedBranch) setSelectedBranch(idx);
    };
    window.addEventListener('pyisland:branch-select', handleBranchSelect);
    return () => window.removeEventListener('pyisland:branch-select', handleBranchSelect);
  }, [selectedBranch]);

  /**
   * 监听下载分支选择事件
   * @description 接收来自 DownloadContent 组件的分支选择事件（点选或滚轮切换触发）
   * @description 更新动态岛显示的选中下载分支索引
   */
  useEffect(() => {
    const handleDownloadSelect = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (idx !== selectedDownload) setSelectedDownload(idx);
    };
    window.addEventListener('pyisland:download-select', handleDownloadSelect);
    return () => window.removeEventListener('pyisland:download-select', handleDownloadSelect);
  }, [selectedDownload]);

  /**
   * 加载动态下载分支数据
   * @description 从版本接口拉取 downloadUrl 并同步到动态岛下载切换器
   */
  useEffect(() => {
    let cancelled = false;

    const loadDownloadOptions = async () => {
      const branches = await getDownloadBranches();
      if (!cancelled) {
        setDownloadOptions(branches);
      }
    };

    void loadDownloadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedDownload >= downloadOptions.length) {
      setSelectedDownload(0);
      window.dispatchEvent(new CustomEvent('pyisland:island-download-select', { detail: 0 }));
    }
  }, [downloadOptions.length, selectedDownload]);

  // ==================== 切换处理函数 ====================

  /**
   * 处理动态岛发起的分支切换
   * @description 用户点击动态岛上的分支按钮时触发
   * @description 更新本地状态并通知 DevelopContent 组件同步更新
   * @param idx - 目标分支索引
   */
  const handleIslandBranchSwitch = useCallback((idx: number) => {
    if (idx !== selectedBranch) setSelectedBranch(idx);
    window.dispatchEvent(new CustomEvent('pyisland:island-branch-select', { detail: idx }));
  }, [selectedBranch]);

  /**
   * 处理动态岛发起的下载分支切换
   * @description 用户点击动态岛上的下载按钮时触发
   * @description 更新本地状态并通知 DownloadContent 组件同步更新
   * @param idx - 目标下载分支索引
   */
  const handleIslandDownloadSwitch = useCallback((idx: number) => {
    if (idx !== selectedDownload) setSelectedDownload(idx);
    window.dispatchEvent(new CustomEvent('pyisland:island-download-select', { detail: idx }));
  }, [selectedDownload]);

  // ==================== 布局计算 ====================

  /**
   * 更新导航指示器位置
   * @description 根据当前激活的页面，计算并设置底部高亮下划线的位置和宽度
   * @description 使用 useLayoutEffect 确保在 DOM 更新前同步更新，避免闪烁
   */
  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (activePage === '#features' && featuresBtnRef.current) {
        setIndicatorStyle({
          left: featuresBtnRef.current.offsetLeft + 6,
          width: featuresBtnRef.current.offsetWidth - 12,
          opacity: 1,
        });
      } else if (activePage === '#branches' && branchesBtnRef.current) {
        setIndicatorStyle({
          left: branchesBtnRef.current.offsetLeft + 6,
          width: branchesBtnRef.current.offsetWidth - 12,
          opacity: 1,
        });
      } else if (activePage === '#develop' && developBtnRef.current) {
        setIndicatorStyle({
          left: developBtnRef.current.offsetLeft + 6,
          width: developBtnRef.current.offsetWidth - 12,
          opacity: 1,
        });
      } else if (activePage === '#contributors' && contributorsBtnRef.current) {
        setIndicatorStyle({
          left: contributorsBtnRef.current.offsetLeft + 6,
          width: contributorsBtnRef.current.offsetWidth - 12,
          opacity: 1,
        });
      } else if (activePage === '#download' && downloadBtnRef.current) {
        setIndicatorStyle({
          left: downloadBtnRef.current.offsetLeft + 6,
          width: downloadBtnRef.current.offsetWidth - 12,
          opacity: 1,
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };
    updateIndicator();
  }, [activePage]);

  // ==================== 计算属性 ====================

  /** 是否在首页 */
  const isHero = activePage === '#hero';

  /** 当前页面信息（标题和副标题），首页不显示 */
  const pageInfo = !isHero ? PAGE_TITLES[activePage] : null;

  /** 是否显示页面标题 */
  const showTitle = !isHero;

  /** 是否为深色背景页面（需要调整动态岛位置） */
  const isDarkPage = activePage === '#develop' || activePage === '#contributors' || activePage === '#download';

  /** 动态岛距离顶部的距离 */
  const islandTop = isDarkPage ? '52px' : '24px';

  /** 是否显示分支切换器 */
  const showBranchSwitcher = activePage === '#develop';

  /** 是否显示下载分支切换器 */
  const showDownloadSwitcher = activePage === '#download';

  /** 是否显示扩展内容（标题或切换器） */
  const showIslandExpanded = showTitle || showBranchSwitcher || showDownloadSwitcher;

  /** 动态岛内边框圆角半径 */
  const islandRadius = showIslandExpanded ? '32px' : '28px';

  /** 动态岛外边框圆角半径 */
  const outerRadius = showIslandExpanded ? '36px' : '32px';

  /** 动态岛最小宽度 */
  const islandMinWidth = showIslandExpanded ? '420px' : '320px';

  return (
      <div
        style={{
          position: 'fixed',
          top: islandTop,
          left: '50%',
          transform: `translateX(-50%)`,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 1,
          transition: 'top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
        }}
      >
      <div
        style={{ position: 'relative', pointerEvents: 'auto' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 外部光晕 */}
        <div
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: outerRadius,
            background: 'transparent',
            pointerEvents: 'none',
            boxShadow: '0 0 0 1px rgba(113, 113, 122, 0.12), 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
            transform: isHovered ? 'scaleX(1.015)' : 'scaleX(1)',
            transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), min-width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            ...(isHovered && {
              boxShadow: '0 0 0 1px rgba(113, 113, 122, 0.18), 0 12px 48px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
            }),
          }}
        />

        {/* 岛屿主体 */}
        <div
          style={{
            position: 'relative',
            borderRadius: islandRadius,
            background: '#000000',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: isHovered ? 'scaleX(1.015)' : 'scaleX(1)',
            minWidth: islandMinWidth,
            transformOrigin: 'top center',
            transition: 'border-radius 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), min-width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* 导航栏 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 10px',
              minWidth: '470px',
            }}
          >
            {/* 左侧 Logo */}
            <button
              onClick={() => navigate('#hero')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                background: 'none',
                border: 'none',
                padding: 0,
              }}
              aria-label="Pyisland 首页"
            >
              <img src="/island_w.svg" alt="" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fafafa',
                  letterSpacing: '-0.02em',
                }}
              >
                Pyisland
              </span>
            </button>

            {/* 分割线 */}
            <div
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.12)',
                margin: '0 4px',
                flexShrink: 0,
              }}
            />

            {/* 导航链接 */}
            <div
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}
            >
              <button
                ref={featuresBtnRef}
                onClick={() => navigate('#features')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: activePage === '#features' ? '#ffffff' : '#71717a',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                className="diNavBtn"
              >
                功能
              </button>
              <button
                ref={branchesBtnRef}
                onClick={() => navigate('#branches')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: activePage === '#branches' ? '#ffffff' : '#71717a',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                className="diNavBtn"
              >
                分支
              </button>
              <button
                ref={developBtnRef}
                onClick={() => navigate('#develop')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: activePage === '#develop' ? '#ffffff' : '#71717a',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                className="diNavBtn"
              >
                开发
              </button>
              <button
                ref={contributorsBtnRef}
                onClick={() => navigate('#contributors')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: activePage === '#contributors' ? '#ffffff' : '#71717a',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                className="diNavBtn"
              >
                贡献者
              </button>
              <button
                ref={downloadBtnRef}
                onClick={() => navigate('#download')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: activePage === '#download' ? '#ffffff' : '#71717a',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
                className="diNavBtn"
              >
                下载
              </button>
              {/* 激活指示器下划线 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  height: '1.5px',
                  borderRadius: '1px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                  opacity: indicatorStyle.opacity,
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* 分割线 */}
            <div
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.12)',
                margin: '0 4px',
                flexShrink: 0,
              }}
            />

            {/* GitHub 图标 */}
            <a
              href="https://github.com/Python-island/Python-island"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                color: '#71717a',
                textDecoration: 'none',
                transition: 'color 0.2s ease, background 0.2s ease',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              className="diNavBtn"
            >
              <Github size={16} />
            </a>

            {/* 文档图标 */}
            <a
              href="https://docs.pyisland.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Docs"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                color: '#71717a',
                textDecoration: 'none',
                transition: 'color 0.2s ease, background 0.2s ease',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              className="diNavBtn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </a>
          </div>

          {/* 标题区域 */}
          <div
            style={{
              maxHeight: showTitle ? '80px' : '0px',
              overflow: 'hidden',
              opacity: showTitle ? 1 : 0,
              transition: 'max-height 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease, border-top 0.25s ease, padding 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              borderTop: showTitle ? '1px solid rgba(255,255,255,0.06)' : 'none',
              padding: showTitle ? '10px 16px 12px' : '0',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              {pageInfo?.title ?? ''}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#71717a',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              {pageInfo?.subtitle ?? ''}
            </span>
          </div>

          {/* 分支切换器行 — 在 #develop 页面可见 */}
          <div
            style={{
              maxHeight: activePage === '#develop' ? '72px' : '0px',
              overflow: 'hidden',
              opacity: activePage === '#develop' ? 1 : 0,
              transition: 'max-height 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: activePage === '#develop' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {/* 索引标签 */}
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
                paddingTop: '6px',
                transition: 'opacity 0.3s ease',
                userSelect: 'none',
              }}
            >
              {selectedBranch + 1} / {developData.length}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '4px 12px 8px',
                transform: activePage === '#develop' ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
                opacity: activePage === '#develop' ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
              }}
            >
              {developData.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleIslandBranchSwitch(i)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: selectedBranch === i ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: selectedBranch === i ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    boxShadow: selectedBranch === i ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
                    transform: selectedBranch === i ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
                    letterSpacing: '0.01em',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* 下载分支切换器行 — 在 #download 页面可见 */}
          <div
            style={{
              maxHeight: activePage === '#download' ? '72px' : '0px',
              overflow: 'hidden',
              opacity: activePage === '#download' ? 1 : 0,
              transition: 'max-height 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: activePage === '#download' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {/* 索引标签 */}
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
                paddingTop: '6px',
                transition: 'opacity 0.3s ease',
                userSelect: 'none',
              }}
            >
              {selectedDownload + 1} / {downloadOptions.length}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '4px 12px 8px',
                transform: activePage === '#download' ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
                opacity: activePage === '#download' ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
              }}
            >
              {downloadOptions.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleIslandDownloadSwitch(i)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: selectedDownload === i ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: selectedDownload === i ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    boxShadow: selectedDownload === i ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
                    transform: selectedDownload === i ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
                    letterSpacing: '0.01em',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
