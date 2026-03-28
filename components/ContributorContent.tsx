/**
 * @file ContributorContent.tsx
 * @description 贡献者内容组件
 * @description macOS 风格的贡献者展示页面，包含个人资料卡片、macOS 菜单栏和 Dock 图标栏
 * @description 支持滚轮切换贡献者、头像悬停放大、卡片切换动画等功能
 * @author 鸡哥
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import stylesEffect from '@/styles/effect.module.css';
import DesktopIcons from './DesktopIcons';
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';
import { contributors } from '../data/contributorData';

// Dock 放大效果的最大缩放比例
const MAX_SCALE = 1.25;
// 相邻项目的缩放比例步长
const NEIGHBOR_SCALE_STEPS = [1.12, 1.06, 1.0];
// 单个图标项目的宽度（图标 52px + 间距 10px）
const ITEM_W = 62;

// 为贡献者添加头像路径
const dockAvatars = contributors.map(dev => {
  const avatarMap: Record<string, string> = {
    StarWindv: '/avatar/StarWindv.png',
    Code: '/avatar/code.png',
    silenthim: '/avatar/silenthim.jpg',
    GeminiMortal: '/avatar/GeminiMortal.jpg',
    cXp1r: '/avatar/cxp1r.png',
    JNTMTMTM: '/avatar/JNTMTMTM.jpg',
  };
  return {
    ...dev,
    avatar: avatarMap[dev.id] ?? '',
    dockLabel: dev.dockLabel,
  };
});

/**
 * 贡献者内容组件属性接口
 */
interface ContributorContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  currentDev: number;
  onSwitchDev: (index: number) => void;
  onNavigate: (view: ViewState) => void;
}

/**
 * 贡献者内容组件
 * macOS 风格的贡献者展示页面，包含个人资料卡片和 Dock 图标栏
 */
export default function ContributorContent({ progress, activeView, phase, currentDev, onSwitchDev, onNavigate }: ContributorContentProps) {
  // 判断当前是否为 contributors 视图
  const isContributors = activeView === 'contributors';
  // 判断是否处于过渡状态
  const isTransitioning = phase === 'transitioning';

  // 计算滑出、透明度和滑入因子
  const slideOut = isTransitioning && (activeView === 'branches' || activeView === 'develop') ? progress : 0;
  const opacity = isContributors ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isContributors ? 1 : 0;

  // 当前选中的贡献者
  const dev = contributors[currentDev];

  // 卡片切换动画状态 — 跟踪当前显示的内容
  const [displayDev, setDisplayDev] = useState(currentDev);
  const [cardVisible, setCardVisible] = useState(true);
  const [cardHovered, setCardHovered] = useState(false);

  /**
   * 在贡献者切换时动画化卡片内容
   */
  useEffect(() => {
    if (currentDev !== displayDev) {
      setCardVisible(false);
      const t1 = setTimeout(() => {
        setDisplayDev(currentDev);
        setCardVisible(true);
      }, 150);
      return () => clearTimeout(t1);
    }
  }, [currentDev, displayDev]);

  /**
   * 获取 macOS 风格的时间
   */
  const getMacTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const period = h >= 5 && h < 12 ? '早上' : h >= 12 && h < 18 ? '中午' : '晚上';
    const displayHour = h.toString().padStart(2, '0');
    return `${period} ${displayHour}:${m}`;
  };

  // macOS 风格时间显示
  const [macTime, setMacTime] = useState(getMacTime);

  // 每秒更新时间
  useEffect(() => {
    const tick = () => setMacTime(getMacTime());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /**
   * 滚轮滚动切换贡献者
   * 在 contributors 视图中，上下滚动切换不同的贡献者
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isContributors || phase !== 'idle') return;
      e.preventDefault();

      if (e.deltaY > 0) {
        // 向下滚动：已是最后一位贡献者则跳转下载页，否则切换到下一位
        if (currentDev === contributors.length - 1) {
          onNavigate('download');
        } else {
          onSwitchDev(currentDev + 1);
        }
        } else {
          // 向上滚动：切换到上一位贡献者，若已是第一位则返回开发页
          if (currentDev > 0) {
            onSwitchDev(currentDev - 1);
          } else {
            onNavigate('develop');
          }
        }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isContributors, phase, currentDev, onSwitchDev, onNavigate, contributors.length]);

  /**
   * Dock 放大效果
   * 实现类似 macOS Dock 的悬停放大效果
   */
  // Dock 容器引用
  const dockContainerRef = useRef<HTMLDivElement>(null);
  // 每个图标的缩放比例
  const dockScales = useRef<number[]>(dockAvatars.map((_, i) => (i === currentDev ? MAX_SCALE : 1.0)));
  // 用于强制更新组件
  const [, forceUpdate] = useState(0);
  const lastMouseX = useRef<number | null>(null);
  /** 鼠标当前悬停的项目索引 */
  const hoveredIdx = useRef<number | null>(null);

  /**
   * 当 currentDev 变化时同步 Dock 选中高亮
   */
  useEffect(() => {
    if (hoveredIdx.current === null) {
      dockScales.current = dockAvatars.map((_, i) => (i === currentDev ? MAX_SCALE : 1.0));
      forceUpdate(n => n + 1);
    }
  }, [currentDev]);

  /**
   * 处理 Dock 鼠标移动事件
   * 根据鼠标位置计算每个图标的缩放比例
   */
  const handleDockMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = dockContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // 第一个图标中心（考虑顶部内边距 14px）
    const firstCenter = 14 + 26; // 顶部内边距 + 图标一半高度
    const idx = Math.round((mouseY - firstCenter) / ITEM_W);
    const clampedIdx = Math.max(0, Math.min(dockAvatars.length - 1, idx));

    // 根据距离计算每个图标的缩放比例
    const newScales = dockAvatars.map((_, i) => {
      const dist = Math.abs(i - clampedIdx);
      if (i === currentDev) return MAX_SCALE;
      if (dist === 0) return MAX_SCALE;
      if (dist <= NEIGHBOR_SCALE_STEPS.length) return NEIGHBOR_SCALE_STEPS[dist - 1];
      return 1.0;
    });

    // 如果缩放比例有变化，更新并强制重渲染
    if (JSON.stringify(newScales) !== JSON.stringify(dockScales.current)) {
      dockScales.current = newScales;
      forceUpdate(n => n + 1);
    }

    hoveredIdx.current = clampedIdx;
    lastMouseX.current = mouseY;
  }, [currentDev]);

  /**
   * 处理 Dock 鼠标离开事件
   * 重置所有图标到默认状态
   */
  const handleDockMouseLeave = useCallback(() => {
    dockScales.current = dockAvatars.map((_, i) => (i === currentDev ? MAX_SCALE : 1.0));
    forceUpdate(n => n + 1);
    hoveredIdx.current = null;
    lastMouseX.current = null;
  }, [currentDev]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        pointerEvents: isContributors ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 30%, #2d2d2d 55%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'macBgShift 20s ease infinite',
        overflow: 'hidden',
        paddingTop: '88px',
      }}
    >
      {/* macOS 菜单栏 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: 'rgba(30, 30, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '20px',
          zIndex: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <img src="/island_w.svg" alt="" style={{ width: '14px', height: '14px', flexShrink: 0, opacity: 0.95 }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', letterSpacing: '0.01em' }}>
          Finder
        </span>
        {['文件', '编辑', '显示', '前往', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
      <div style={{ flex: 1 }} />
      {/* 右侧状态栏：WiFi 图标、电池图标等 */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.85)">
          <path d="M1 4C1 2.9 1.9 2 3 2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4zm0-1L0 3v4l1-1h12l1 1V3l-1 0H1z" />
          <path d="M4 5h6M4 7h3" stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none" />
        </svg>
        {/* 控中心下拉箭头 */}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>▼</span>
        {/* 音量指示 */}
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>100%</span>
        {/* 时间显示 */}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          {macTime}
        </span>
      </div>

      {/* 主内容容器 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1060px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - slideInFactor) * 80}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
          marginTop: '0px',
        }}
      >
        {/* 个人资料卡片 */}
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid rgba(0, 0, 0, ${cardHovered ? 0.14 : 0.07})`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: cardHovered
              ? '0 16px 64px rgba(0,0,0,0.16), 0 6px 20px rgba(0,0,0,0.10)'
              : '0 8px 48px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06)',
            transform: cardHovered ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-color 0.3s ease',
          }}
        >
          {/* 窗口标题栏 */}
          <div
            style={{
              padding: '16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'rgba(245, 245, 247, 0.7)',
            }}
          >
            {/* macOS 窗口控制按钮（红、黄、绿） */}
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            ))}
            {/* 窗口标题 */}
            <span
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '13px',
                color: '#86868B',
                fontWeight: '500',
                letterSpacing: '0.02em',
              }}
            >
              About — {dev.nameEn}
            </span>
          </div>

          {/* 个人资料内容 */}
          <div
            key={`card-content-${displayDev}`}
            style={{
              padding: 'clamp(28px, 5vw, 56px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
              transition: cardVisible
                ? 'opacity 0.2s ease, transform 0.2s ease'
                : 'opacity 0.15s ease, transform 0.15s ease',
            }}
          >
            {/* 头像 + 姓名 + 邮箱 */}
            <div
              className={stylesEffect.cardAvatarSlide}
            >
              {/* 头像容器 */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  border: '3px solid rgba(255,255,255,0.9)',
                }}
              >
                <img
                  src={dockAvatars[displayDev].avatar}
                  alt={contributors[displayDev].name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* 姓名和邮箱 */}
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1D1D1F',
                    margin: '0 0 4px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {contributors[displayDev].name}
                </h2>
                {contributors[displayDev].nameEn !== contributors[displayDev].name && (
                  <p style={{ fontSize: '13px', color: '#86868B', margin: '0 0 6px', fontWeight: '500' }}>
                    {contributors[displayDev].nameEn}
                  </p>
                )}
                <a
                  href={`mailto:${contributors[displayDev].email}`}
                  style={{
                    fontSize: '12px',
                    color: '#555',
                    textDecoration: 'none',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {contributors[displayDev].email}
                </a>
              </div>
            </div>

            {/* 特性网格 */}
            <div
              className={stylesEffect.cardTraitsSlide}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}
            >
              {contributors[displayDev].traits.map((trait, i) => (
                <div
                  key={trait.label}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(0, 0, 0, 0.025)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#fff',
                    background: '#1D1D1F',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'ui-monospace, monospace',
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1D1D1F', marginBottom: '2px' }}>
                      {trait.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#86868B' }}>{trait.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 个人简介 */}
            <div
              className={stylesEffect.cardBioSlide}
              style={{
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.025)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                borderLeft: '3px solid #555',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#1D1D1F',
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                {contributors[displayDev].bio}
              </p>
            </div>

            {/* 技术栈 */}
            {contributors[displayDev].skills.length > 0 && (
              <div
                className={stylesEffect.cardSkillsSlide}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#86868B',
                    marginBottom: '10px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  技术栈
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {contributors[displayDev].skills.map(skill => (
                    <span
                      key={skill.label}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.10)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#555',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {skill.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 贡献者导航点 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
            opacity: slideInFactor,
            transform: `translateY(${(1 - slideInFactor) * 10}px)`,
            transition: 'transform 0.7s ease 0.15s, opacity 0.7s ease 0.15s',
          }}
        >
          {contributors.map((d, i) => (
            <button
              key={d.id}
              onClick={() => onSwitchDev(i)}
              title={d.name}
              style={{
                width: i === currentDev ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === currentDev
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.25)',
                boxShadow: i === currentDev ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: 0,
              }}
              onMouseEnter={e => {
                if (i !== currentDev) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.width = '12px';
                }
              }}
              onMouseLeave={e => {
                if (i !== currentDev) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.width = '8px';
                }
              }}
            />
          ))}
        </div>

        {/* 页面导航按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            opacity: slideInFactor * 0.6,
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            transition: 'transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s',
          }}
        >
          {/* 返回开发指南按钮 */}
          <button
            onClick={() => onNavigate('develop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            开发
          </button>

          {/* 提示文本 */}
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            滚轮切换贡献者
          </span>

          {/* 前往下载页面按钮 */}
          <button
            onClick={() => onNavigate('download')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            下载
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* macOS Dock 贡献者头像栏 — 垂直布局，右侧 */}
      {/*
        Magnify logic:
        - Each avatar tracks its own scale via per-item refs updated on mouse-move.
        - Active item: always 1.25 scale + shifts -8px (leftward).
        - Hovered item: scales up + shifts left.
        - Neighbors: scale gradually based on distance (1–3 steps away).
        - On click: triggers a CSS bounce keyframe animation.
      */}
      <div
        ref={dockContainerRef}
        onMouseMove={handleDockMouseMove}
        onMouseLeave={handleDockMouseLeave}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: `translateY(-50%) translateX(${(1 - slideInFactor) * 20}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.7s ease 0.4s',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.22)',
          padding: '14px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 16px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          zIndex: 10,
          userSelect: 'none',
        }}
      >
        {dockAvatars.map((dock, i) => {
          const scale = dockScales.current[i] ?? (i === currentDev ? MAX_SCALE : 1.0);
          const shiftLeft = i === currentDev ? -8 : (scale > 1 ? -Math.round((scale - 1) * 40) : 0);
          return (
            <div
              key={dock.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                position: 'relative',
              }}
            >
              {/* 名称提示框 — 显示在头像左侧 */}
              <div
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%) translateX(-6px)',
                  background: 'rgba(30,30,30,0.88)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  opacity: hoveredIdx.current === i ? 1 : 0,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'opacity 0.15s ease',
                  letterSpacing: '0.01em',
                  marginRight: '10px',
                }}
              >
                {dock.name}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '100%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '5px solid rgba(30,30,30,0.88)',
                  }}
                />
              </div>

              {/* 头像图标 */}
              <div
                title={dock.name}
                onClick={() => onSwitchDev(i)}
                style={{
                  width: `${52 * scale}px`,
                  height: `${52 * scale}px`,
                  borderRadius: `${Math.round(12 * scale)}px`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `2px solid ${i === currentDev ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: i === currentDev
                    ? '0 0 0 3px rgba(255,255,255,0.15), 0 8px 20px rgba(0,0,0,0.35)'
                    : scale > 1.05
                      ? `0 ${12 - scale * 3}px ${24 - scale * 6}px rgba(0,0,0,${0.3 + (scale - 1) * 0.5}), 0 0 ${Math.round((scale - 1) * 30)}px rgba(255,255,255,0.12)`
                      : '0 3px 10px rgba(0,0,0,0.25)',
                  transform: `translateX(${shiftLeft}px) scale(1)`,
                  transition: i === currentDev
                    ? 'width 0.2s cubic-bezier(0.34,1.56,0.64,1), height 0.2s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, box-shadow 0.2s ease'
                    : 'width 0.18s cubic-bezier(0.34,1.56,0.64,1), height 0.18s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <img
                  src={dock.avatar}
                  alt={dock.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* 选中指示点 */}
              <div
                style={{
                  width: i === currentDev ? '5px' : '3px',
                  height: i === currentDev ? '5px' : '3px',
                  borderRadius: '50%',
                  background: i === currentDev ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  boxShadow: i === currentDev ? '0 0 4px rgba(255,255,255,0.6)' : 'none',
                  transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      <DesktopIcons activeView={activeView} onNavigate={onNavigate} />
    </div>
  );
}
