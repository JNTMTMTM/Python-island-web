'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewState, Phase } from './types';
import { downloadBranches } from '@/data/downloadData';

interface DownloadContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  onBackToContributors: () => void;
}

type Branch = typeof downloadBranches[number];

const BRANCH_COLORS: Record<string, { glow: string; glowDim: string }> = {
  'tauri-island':    { glow: 'rgba(5,150,105,0.28)',   glowDim: 'rgba(5,150,105,0.10)' },
  'pyislandqt':      { glow: 'rgba(217,119,6,0.26)',   glowDim: 'rgba(217,119,6,0.10)' },
  'pyislandpyside6': { glow: 'rgba(100,116,139,0.26)', glowDim: 'rgba(100,116,139,0.10)' },
  'pyisland-wanku':  { glow: 'rgba(139,92,246,0.26)', glowDim: 'rgba(139,92,246,0.10)' },
};

const CONTENT_W = 620;

export default function DownloadContent({
  progress,
  activeView,
  phase,
  onBackToContributors,
}: DownloadContentProps) {
  const isDownload = activeView === 'download';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'contributors' ? progress : 0;
  const opacity = isDownload ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDownload ? 1 : 0;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const [windowHovered, setWindowHovered] = useState(false);

  // Two-phase switch: fade out → switch → fade in
  useEffect(() => {
    if (selectedIdx === displayIdx) return;
    setContentVisible(false);
    const t1 = setTimeout(() => {
      setDisplayIdx(selectedIdx);
      const t2 = setTimeout(() => setContentVisible(true), 60);
      return () => clearTimeout(t2);
    }, 180);
    return () => clearTimeout(t1);
  }, [selectedIdx, displayIdx]);

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

  // Wheel: up → contributors, down → next card
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isDownload || phase !== 'idle') return;
    if (e.deltaY < 0) {
      e.preventDefault();
      onBackToContributors();
    } else {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, downloadBranches.length - 1));
    }
  }, [isDownload, phase, onBackToContributors]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (opacity === 0 && !isDownload) return null;

  const branch = downloadBranches[displayIdx];
  const colors = BRANCH_COLORS[branch.id] ?? { glow: 'rgba(255,255,255,0.15)', glowDim: 'rgba(255,255,255,0.06)' };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${(1 - opacity) * 16}px)`,
        transition: opacity < 1 ? 'none' : 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: isDownload ? 'auto' : 'none',
        zIndex: 10,
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
          background: 'rgba(28, 28, 30, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
          Downloads
        </span>
        {['文件', '编辑', '显示', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.70)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.88)', letterSpacing: '0.02em' }}>
          {macTime}
        </span>
      </div>

      {/* Page title */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          left: '50%',
          transform: `translateX(-50%) translateY(${(1 - slideInFactor) * 20}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.05s, opacity 0.8s ease 0.05s',
          textAlign: 'center',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: '800',
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '-0.03em',
          margin: 0,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          下载中心
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: 0, letterSpacing: '0.01em' }}>
          选择适合你的版本，开启 Python 灵动岛之旅
        </p>
      </div>

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - slideInFactor) * 60}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
          padding: '100px 24px 40px',
        }}
      >
        {/* Terminal window — now contains everything */}
        <div
          onMouseEnter={() => setWindowHovered(true)}
          onMouseLeave={() => setWindowHovered(false)}
          style={{
            width: '100%',
            maxWidth: `${CONTENT_W}px`,
            background: 'rgba(18, 18, 20, 0.90)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '16px',
            border: `1px solid rgba(255,255,255,${windowHovered ? 0.14 : 0.09})`,
            overflow: 'hidden',
            boxShadow: windowHovered
              ? `0 32px 96px rgba(0,0,0,0.6), 0 0 48px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.09)`
              : '0 32px 96px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
            transition: 'box-shadow 0.4s ease, border-color 0.3s ease',
          }}
        >
          {/* Window title bar */}
          <div
            style={{
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.055)',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
              <div key={i} style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: c,
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              }} />
            ))}
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.42)',
                fontWeight: '500',
                fontFamily: "'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                letterSpacing: '0.02em',
              }}
            >
              ~/pyisland/downloads — {displayIdx + 1} / {downloadBranches.length}
            </span>
          </div>

          {/* Branch content — fades in/out on switch */}
          <div
            key={branch.id}
            style={{
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
              transition: contentVisible
                ? 'opacity 0.22s ease 0.10s, transform 0.22s ease 0.10s'
                : 'opacity 0.15s ease, transform 0.15s ease',
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glowDim} 0%, transparent 70%)`,
              opacity: windowHovered ? 0.8 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
              zIndex: 0,
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                {/* Tagline badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  background: `${branch.accentBg}`,
                  border: `1px solid ${branch.accentBorder}`,
                  borderRadius: '20px',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: branch.accentColor,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    {branch.tagline}
                  </span>
                </div>

                {/* Branch name */}
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.96)',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                  fontFamily: "'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}>
                  {branch.name}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {branch.description}
                </p>
              </div>

              {/* Label badge */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${branch.accentBg} 0%, rgba(255,255,255,0.04) 100%)`,
                border: `1px solid ${branch.accentBorder}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: windowHovered ? `0 0 28px ${colors.glow}` : 'none',
                transition: 'box-shadow 0.4s ease',
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '900',
                  color: branch.accentColor,
                  letterSpacing: '-0.01em',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  lineHeight: 1,
                }}>
                  {branch.label}
                </span>
                <div style={{ width: '20px', height: '1px', background: `${branch.accentBorder}`, margin: '4px 0' }} />
                <span style={{
                  fontSize: '8px',
                  fontWeight: '700',
                  color: `${branch.accentColor}88`,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {branch.tagline.slice(0, 2)}
                </span>
              </div>
            </div>

            {/* Feature list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', position: 'relative', zIndex: 1 }}>
              {branch.features.map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: branch.accentColor,
                    flexShrink: 0,
                    marginTop: '6px',
                    boxShadow: windowHovered ? `0 0 8px ${branch.accentColor}90` : 'none',
                    transition: 'box-shadow 0.3s ease',
                  }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.55 }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Audience */}
            <div style={{
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.22)',
              borderRadius: '10px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.38)',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              zIndex: 1,
            }}>
              <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.55)' }}>适用人群：</span>
              {branch.audience}
            </div>

            {/* Download button */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {branch.downloadLabel === '立即下载' ? (
                <button
                  onClick={() => window.open(branch.downloadUrl, '_blank')}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: 'none',
                    background: `linear-gradient(135deg, ${branch.accentColor} 0%, ${branch.accentColor}bb 100%)`,
                    color: '#fff',
                    fontFamily: 'inherit',
                    letterSpacing: '0.05em',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: `0 6px 24px ${branch.accentColor}60, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.025)';
                    e.currentTarget.style.boxShadow = `0 10px 36px ${branch.accentColor}90, inset 0 1px 0 rgba(255,255,255,0.35)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 6px 24px ${branch.accentColor}60, inset 0 1px 0 rgba(255,255,255,0.25)`;
                  }}
                  aria-label={`下载 ${branch.name}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {branch.downloadLabel}
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.30)',
                  fontFamily: 'inherit',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {branch.downloadLabel}
                </div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.015)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#28C840',
                boxShadow: '0 0 6px #28C84088',
              }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
                {downloadBranches.filter(b => b.downloadLabel === '立即下载').length} 个版本可下载
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.20)', letterSpacing: '0.02em' }}>
              Python Island v1.6
            </span>
          </div>
        </div>

        {/* Navigation dots */}
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
          {downloadBranches.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setSelectedIdx(i)}
              title={b.name}
              style={{
                width: i === displayIdx ? '26px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === displayIdx
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(255,255,255,0.22)',
                boxShadow: i === displayIdx ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: 0,
              }}
              onMouseEnter={e => {
                if (i !== displayIdx) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.50)';
                  e.currentTarget.style.width = '12px';
                }
              }}
              onMouseLeave={e => {
                if (i !== displayIdx) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.width = '8px';
                }
              }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '14px',
            opacity: slideInFactor,
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            transition: 'transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s',
          }}
        >
          <button
            onClick={onBackToContributors}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.13)',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.68)',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.68)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            贡献者
          </button>

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)' }} />

          <button
            onClick={() => window.location.href = '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.13)',
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.68)',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.68)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            返回首页
          </button>

          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em', marginLeft: '4px' }}>
            滚轮切换版本
          </span>
        </div>
      </div>
    </div>
  );
}
