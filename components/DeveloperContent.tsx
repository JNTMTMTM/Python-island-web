'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import stylesEffect from '@/styles/effect.module.css';
import stylesDock from '@/styles/dock.module.css';
import type { ViewState, Phase, Developer } from './types';

const developers: Developer[] = [
  {
    id: 'StarWindv',
    name: '星灿长风v',
    nameEn: 'StarWindv',
    dockLabel: '星灿长风v',
    email: 'starwindv.stv@gmail.com',
    bio: 'ISTP/INTP 社恐金牛 | 擅长使用 Py/Java/Rust/Ts | 喜欢花里胡哨的东西和更底层的原理 | 热衷于自己造轮子来进行学习',
    traits: [
      { icon: '/', label: 'ISTP / INTP', desc: '理性工匠 · 逻辑思考' },
      { icon: '/', label: '社恐金牛', desc: '沉稳内敛 · 专注细节' },
      { icon: '/', label: '热衷造轮子', desc: '自己动手 · 深度学习' },
      { icon: '/', label: '追求底层原理', desc: '知其然 · 更知其所以然' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'Java' },
      { label: 'Rust' },
      { label: 'TypeScript' },
      { label: 'PySide6' },
      { label: 'Qt' },
      { label: 'Tauri' },
    ],
  },
  {
    id: 'Code',
    name: 'Code',
    nameEn: 'CODE',
    dockLabel: 'Code',
    email: '2064878930@qq.com',
    bio: 'INTP 水瓶 | 擅长使用 Py/Java/Vue | 激进维新派 VibeCoding 中乐此不疲 | 樱花只开一季 真爱只有一次',
    traits: [
      { icon: '/', label: 'INTP', desc: '逻辑学家 · 创新驱动' },
      { icon: '/', label: '浪漫水瓶', desc: '理想主义 · 追求真爱' },
      { icon: '/', label: 'VibeCoding', desc: '激进维新 · 乐此不疲' },
      { icon: '/', label: '多语言开发', desc: 'Py / Java / Vue' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'Java' },
      { label: 'Vue' },
      { label: 'VibeCoding' },
    ],
  },
  {
    id: 'silenthim',
    name: 'silenthim',
    nameEn: 'SILENTHIM',
    dockLabel: 'silenthim',
    email: '2066889432@qq.com',
    bio: '在校大学瘤子，鸡窝山软工の耻辱，精通 Python，C++，C，Java 各种语言输出 Hello World，一生只爱东北雨姐',
    traits: [
      { icon: '/', label: '在校大学生', desc: '鸡窝山软工' },
      { icon: '/', label: '多语言选手', desc: 'Python / C++ / C / Java' },
      { icon: '/', label: 'Hello World', desc: '精通各种语言入门' },
      { icon: '/', label: '一生真爱', desc: '东北雨姐' },
    ],
    skills: [
      { label: 'Python' },
      { label: 'C++' },
      { label: 'C' },
      { label: 'Java' },
    ],
  },
  {
    id: 'GeminiMortal',
    name: '双子座·凡尘',
    nameEn: 'GeminiMortal',
    dockLabel: '双子座·凡尘',
    email: '1468098941@qq.com',
    bio: '社恐双子 · 多语言开发者 · 视觉系代码爱好者 · 希望从零手搓独立作品',
    traits: [
      { icon: '/', label: 'INFJ / INFP / INTP', desc: '三重人格切换' },
      { icon: '/', label: '社恐双子', desc: 'SUT 在校生' },
      { icon: '/', label: '视觉系代码', desc: '花里胡哨的视觉效果' },
      { icon: '/', label: '手搓独立作品', desc: '从零开始的创造者' },
    ],
    skills: [
      { label: 'C++' },
      { label: 'Python' },
      { label: 'Java' },
      { label: 'JavaScript' },
    ],
  },
  {
    id: 'cXp1r',
    name: 'cXp1r',
    nameEn: 'CXP1R',
    dockLabel: 'cXp1r',
    email: 'admin@cxp1r.com',
    bio: '社恐小男孩，擅长摸鱼和提建议，喜欢将流程自动化，喜欢 C++ 和 Python',
    traits: [
      { icon: '/', label: '社恐小男孩', desc: '安静但有想法' },
      { icon: '/', label: '摸鱼达人', desc: '擅长摸鱼和提建议' },
      { icon: '/', label: '流程自动化', desc: '将重复流程自动化' },
      { icon: '/', label: 'C++ / Python', desc: '喜欢的两门语言' },
    ],
    skills: [
      { label: 'C++' },
      { label: 'Python' },
      { label: '自动化' },
    ],
  },
  {
    id: 'JNTMTMTM',
    name: '鸡哥',
    nameEn: 'JNTMTMTM',
    dockLabel: '鸡哥',
    email: 'JNTMTMTM@nailong.com',
    bio: '南京最后的全栈工程师',
    traits: [
      { icon: '/', label: '保持神秘_0', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_1', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_2', desc: '404 NOT FOUND' },
      { icon: '/', label: '保持神秘_3', desc: '404 NOT FOUND' },
    ],
    skills: [
      { label: '404 NOT FOUND' }
    ],
  },
];

const dockAvatars = developers.map(dev => {
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

interface DeveloperContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  currentDev: number;
  onSwitchDev: (index: number) => void;
}

export default function DeveloperContent({ progress, activeView, phase, currentDev, onSwitchDev }: DeveloperContentProps) {
  const isDevelopers = activeView === 'developers';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;
  const opacity = isDevelopers ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDevelopers ? 1 : 0;

  const dev = developers[currentDev];
  const dockDev = dockAvatars[currentDev];

  const getMacTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const period = h < 12 ? '上午' : h < 13 ? '下午' : '晚上';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour}:${m}`;
  };

  const [macTime, setMacTime] = useState(getMacTime);

  useEffect(() => {
    const tick = () => setMacTime(getMacTime());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Dock magnify effect ──────────────────────────────────────────────────
  const dockContainerRef = useRef<HTMLDivElement>(null);
  const dockScales = useRef<number[]>(dockAvatars.map((_, i) => (i === currentDev ? 1.25 : 1.0)));
  const dockBounce = useRef<boolean[]>(dockAvatars.map(() => false));
  const [, forceUpdate] = useState(0);
  const lastMouseX = useRef<number | null>(null);
  /** Index of the item the mouse is directly over */
  const hoveredIdx = useRef<number | null>(null);

  const ITEM_W = 62; // icon width (52) + gap (10)
  const MAX_SCALE = 1.25;
  const NEIGHBOR_SCALE_STEPS = [1.12, 1.06, 1.0];

  const handleDockMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = dockContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // First item center
    const firstCenter = 14 + 26; // padding + half icon
    const idx = Math.round((mouseX - firstCenter) / ITEM_W);
    const clampedIdx = Math.max(0, Math.min(dockAvatars.length - 1, idx));

    const newScales = dockAvatars.map((_, i) => {
      const dist = Math.abs(i - clampedIdx);
      if (i === currentDev) return MAX_SCALE;
      if (dist === 0) return MAX_SCALE;
      if (dist <= NEIGHBOR_SCALE_STEPS.length) return NEIGHBOR_SCALE_STEPS[dist - 1];
      return 1.0;
    });

    if (JSON.stringify(newScales) !== JSON.stringify(dockScales.current)) {
      dockScales.current = newScales;
      forceUpdate(n => n + 1);
    }

    hoveredIdx.current = clampedIdx;
    lastMouseX.current = mouseX;
  }, [currentDev]);

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
        pointerEvents: isDevelopers ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 30%, #2d2d2d 55%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'macBgShift 20s ease infinite',
        overflow: 'hidden',
      }}
    >
      {/* macOS menu bar */}
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
        <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.85)">
          <path d="M1 4C1 2.9 1.9 2 3 2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4zm0-1L0 3v4l1-1h12l1 1V3l-1 0H1z" />
          <path d="M4 5h6M4 7h3" stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none" />
        </svg>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>▼</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>100%</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          {macTime}
        </span>
      </div>

      {/* Main content container */}
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
        {/* Title */}
        <div
          style={{
            marginBottom: 'clamp(20px, 4vh, 36px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            transform: `translateY(${(1 - slideInFactor) * -20}px)`,
            opacity: slideInFactor,
            transition: 'transform 0.7s ease, opacity 0.7s ease',
          }}
        >
          <span
            className={stylesEffect.gradientText}
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: '600', letterSpacing: '-0.02em' }}
          >
            关于开发者
          </span>
          <p style={{ fontSize: '14px', color: '#86868B', textAlign: 'center', lineHeight: 1.6 }}>
            Python-island 项目团队
          </p>
        </div>

        {/* Profile card */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 0, 0, 0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0, 0, 0, 0.10), 0 2px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Window title bar */}
          <div
            style={{
              padding: '16px 16px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'rgba(245, 245, 247, 0.7)',
            }}
          >
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            ))}
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

          {/* Profile content */}
          <div
            style={{
              padding: 'clamp(28px, 5vw, 56px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            {/* Avatar + name + email */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                opacity: slideInFactor,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
              }}
            >
              {/* Avatar */}
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
                  src={dockDev.avatar}
                  alt={dev.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* Name & email */}
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
                  {dev.name}
                </h2>
                {dev.nameEn !== dev.name && (
                  <p style={{ fontSize: '13px', color: '#86868B', margin: '0 0 6px', fontWeight: '500' }}>
                    {dev.nameEn}
                  </p>
                )}
                <a
                  href={`mailto:${dev.email}`}
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
                  {dev.email}
                </a>
              </div>
            </div>

            {/* Traits grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                opacity: slideInFactor,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.08s, opacity 0.6s ease 0.08s',
              }}
            >
              {dev.traits.map((trait, i) => (
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

            {/* Bio quote */}
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.025)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                borderLeft: '3px solid #555',
                transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                opacity: slideInFactor,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.16s, opacity 0.6s ease 0.16s',
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
                {dev.bio}
              </p>
            </div>

            {/* Skills */}
            {dev.skills.length > 0 && (
              <div
                style={{
                  transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                  opacity: slideInFactor,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.24s, opacity 0.6s ease 0.24s',
                }}
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
                  {dev.skills.map(skill => (
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
      </div>

      {/* macOS Dock with developer avatars */}
      {/*
        Magnify logic:
        - Each avatar tracks its own scale via per-item refs updated on mouse-move.
        - Active item: always 1.25 scale + lifts 6px.
        - Hovered item: scales up to 1.20 + lifts 10px.
        - Neighbors: scale gradually based on distance (1–3 steps away).
        - On click: triggers a CSS bounce keyframe animation.
      */}
      <div
        ref={dockContainerRef}
        onMouseMove={handleDockMouseMove}
        onMouseLeave={handleDockMouseLeave}
        style={{
          position: 'absolute',
          bottom: '6px',
          left: '50%',
          transform: `translateX(-50%) translateY(${(1 - slideInFactor) * 30}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.7s ease 0.4s',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.22)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          boxShadow: '0 16px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          zIndex: 10,
          userSelect: 'none',
        }}
      >
        {dockAvatars.map((dock, i) => {
          const scale = dockScales.current[i] ?? (i === currentDev ? 1.25 : 1.0);
          const lift = i === currentDev ? -6 : (scale > 1 ? -Math.round((scale - 1) * 40) : 0);
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
              {/* Name tooltip */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-6px)',
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
                }}
              >
                {dock.name}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid rgba(30,30,30,0.88)',
                  }}
                />
              </div>

              {/* Avatar icon */}
              <div
                title={dock.name}
                onClick={() => onSwitchDev(i)}
                className={dockBounce.current[i] ? stylesDock.bounce : ''}
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
                  transform: `translateY(${lift}px) scale(1)`,
                  transition: i === currentDev
                    ? 'width 0.2s cubic-bezier(0.34,1.56,0.64,1), height 0.2s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, box-shadow 0.2s ease'
                    : 'width 0.18s cubic-bezier(0.34,1.56,0.64,1), height 0.18s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.18s ease, box-shadow 0.18s ease',
                }}
                onAnimationEnd={() => {
                  if (dockBounce.current[i]) {
                    dockBounce.current[i] = false;
                    forceUpdate(n => n + 1);
                  }
                }}
              >
                <img
                  src={dock.avatar}
                  alt={dock.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Active indicator dot */}
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
    </div>
  );
}
