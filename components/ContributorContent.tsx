'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import stylesEffect from '@/styles/effect.module.css';
import stylesDock from '@/styles/dock.module.css';
import type { ViewState, Phase } from './types';
import { developers } from '@/data/developerData';

const MAX_SCALE = 1.25;
const NEIGHBOR_SCALE_STEPS = [1.12, 1.06, 1.0];
const ITEM_W = 62; // icon width (52) + gap (10)

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
  onBackToDownloads: () => void;
}

export default function DeveloperContent({ progress, activeView, phase, currentDev, onSwitchDev, onBackToDownloads }: DeveloperContentProps) {
  const isDevelopers = activeView === 'developers';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && (activeView === 'branches' || activeView === 'downloads') ? progress : 0;
  const opacity = isDevelopers ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDevelopers ? 1 : 0;

  const dev = developers[currentDev];
  const dockDev = dockAvatars[currentDev];

  // Card switch animation state — tracks what's currently displayed
  const [displayDev, setDisplayDev] = useState(currentDev);
  const [cardVisible, setCardVisible] = useState(true);
  const [cardHovered, setCardHovered] = useState(false);

  // Animate card content on developer switch
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

  const getMacTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const period = h >= 5 && h < 12 ? '早上' : h >= 12 && h < 18 ? '中午' : '晚上';
    const displayHour = h.toString().padStart(2, '0');
    return `${period} ${displayHour}:${m}`;
  };

  const [macTime, setMacTime] = useState(getMacTime);

  useEffect(() => {
    const tick = () => setMacTime(getMacTime());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Wheel scroll: switch developer when in developers view ─────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isDevelopers || phase !== 'idle') return;
      e.preventDefault();

      if (e.deltaY > 0) {
        // Scroll down: go to next developer; stop at last
        if (currentDev < developers.length - 1) {
          onSwitchDev(currentDev + 1);
        }
      } else {
        // Scroll up: go to prev developer, or back to downloads at first
        if (currentDev > 0) {
          onSwitchDev(currentDev - 1);
        } else {
          onBackToDownloads();
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDevelopers, phase, currentDev, onSwitchDev, onBackToDownloads, developers.length]);

  // ── Dock magnify effect ──────────────────────────────────────────────────
  const dockContainerRef = useRef<HTMLDivElement>(null);
  const dockScales = useRef<number[]>(dockAvatars.map((_, i) => (i === currentDev ? MAX_SCALE : 1.0)));
  const dockBounce = useRef<boolean[]>(dockAvatars.map(() => false));
  const [, forceUpdate] = useState(0);
  const lastMouseX = useRef<number | null>(null);
  /** Index of the item the mouse is directly over */
  const hoveredIdx = useRef<number | null>(null);

  // ── Sync dock selection highlight when currentDev changes ───────────────────
  useEffect(() => {
    if (hoveredIdx.current === null) {
      dockScales.current = dockAvatars.map((_, i) => (i === currentDev ? MAX_SCALE : 1.0));
      forceUpdate(n => n + 1);
    }
  }, [currentDev]);

  /**
   * Tracks hover state for the back-to-branches button, separate from avatar magnify */
  const backBtnHovered = useRef(false);

  const handleDockMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = dockContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // First item center (accounting for top padding of 14px)
    const firstCenter = 14 + 26; // padding + half icon
    const idx = Math.round((mouseY - firstCenter) / ITEM_W);
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
    lastMouseX.current = mouseY;
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
        paddingTop: '88px',
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
        {/* Profile card */}
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
          {/* Window title bar */}
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
            {/* Avatar + name + email */}
            <div
              className={stylesEffect.cardAvatarSlide}
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
                  src={dockAvatars[displayDev].avatar}
                  alt={developers[displayDev].name}
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
                  {developers[displayDev].name}
                </h2>
                {developers[displayDev].nameEn !== developers[displayDev].name && (
                  <p style={{ fontSize: '13px', color: '#86868B', margin: '0 0 6px', fontWeight: '500' }}>
                    {developers[displayDev].nameEn}
                  </p>
                )}
                <a
                  href={`mailto:${developers[displayDev].email}`}
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
                  {developers[displayDev].email}
                </a>
              </div>
            </div>

            {/* Traits grid */}
            <div
              className={stylesEffect.cardTraitsSlide}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}
            >
              {developers[displayDev].traits.map((trait, i) => (
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
                {developers[displayDev].bio}
              </p>
            </div>

            {/* Skills */}
            {developers[displayDev].skills.length > 0 && (
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
                  {developers[displayDev].skills.map(skill => (
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

        {/* Developer navigation dots */}
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
          {developers.map((d, i) => (
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

        {/* Page navigation controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '16px',
            opacity: slideInFactor * 0.6,
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            transition: 'transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s',
          }}
        >
          <button
            onClick={onBackToDownloads}
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
            下载
          </button>

          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            点击 Dock 栏头像或上方圆点切换
          </span>
        </div>
      </div>

      {/* macOS Dock with developer avatars — vertical, right side */}
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
              {/* Name tooltip — appears to the left of the avatar */}
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
                  transform: `translateX(${shiftLeft}px) scale(1)`,
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

        {/* Return to downloads button */}
        <div
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
              opacity: hoveredIdx.current === dockAvatars.length || backBtnHovered.current ? 1 : 0,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'opacity 0.15s ease',
              letterSpacing: '0.01em',
              marginRight: '10px',
            }}
          >
            下载界面
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

          {/* Icon button */}
          <div
            title="返回下载界面"
            onClick={onBackToDownloads}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
              transform: 'translateX(0px)',
              transition: 'width 0.18s cubic-bezier(0.34,1.56,0.64,1), height 0.18s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              backBtnHovered.current = true;
              forceUpdate(n => n + 1);
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.5)';
              el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.35)';
              el.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={e => {
              backBtnHovered.current = false;
              forceUpdate(n => n + 1);
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.15)';
              el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
              el.style.transform = 'translateX(0px)';
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* Indicator dot */}
          <div
            style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
