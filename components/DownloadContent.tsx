'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';
import { downloadBranches } from '@/data/downloadData';

interface DownloadContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  onBackToContributors: () => void;
  onBackToHome: () => void;
}

type Branch = typeof downloadBranches[number];

const BRANCH_COLORS: Record<string, { glow: string; glowDim: string }> = {
  'tauri-island':    { glow: 'rgba(5,150,105,0.28)',   glowDim: 'rgba(5,150,105,0.10)' },
  'pyislandqt':      { glow: 'rgba(217,119,6,0.26)',   glowDim: 'rgba(217,119,6,0.10)' },
  'pyislandpyside6': { glow: 'rgba(100,116,139,0.26)', glowDim: 'rgba(100,116,139,0.10)' },
  'pyisland-wanku':  { glow: 'rgba(139,92,246,0.26)', glowDim: 'rgba(139,92,246,0.10)' },
};

export default function DownloadContent({
  progress,
  activeView,
  phase,
  onBackToContributors,
  onBackToHome,
}: DownloadContentProps) {
  const isDownload = activeView === 'download';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'contributors' ? progress : 0;
  const opacity = isDownload ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDownload ? 1 : 0;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const [cardHovered, setCardHovered] = useState(false);

  // Two-phase switch: fade out → switch → fade in; also sync island switcher
  useEffect(() => {
    if (selectedIdx === displayIdx) return;
    setContentVisible(false);
    const t1 = setTimeout(() => {
      setDisplayIdx(selectedIdx);
      window.dispatchEvent(new CustomEvent('pyisland:download-select', { detail: selectedIdx }));
      const t2 = setTimeout(() => setContentVisible(true), 60);
      return () => clearTimeout(t2);
    }, 180);
    return () => clearTimeout(t1);
  }, [selectedIdx, displayIdx]);

  // Sync island switcher on mount (first card selected)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pyisland:download-select', { detail: 0 }));
  }, []);

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

  // Wheel: up → previous card (or contributors if at first), down → next card (or home if at last)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isDownload || phase !== 'idle') return;
    if (e.deltaY < 0) {
      e.preventDefault();
      if (selectedIdx === 0) {
        onBackToContributors();
      } else {
        const prev = selectedIdx - 1;
        setSelectedIdx(prev);
        window.dispatchEvent(new CustomEvent('pyisland:download-select', { detail: prev }));
      }
    } else {
      e.preventDefault();
      if (selectedIdx === downloadBranches.length - 1) {
        onBackToHome();
      } else {
        const next = selectedIdx + 1;
        setSelectedIdx(next);
        window.dispatchEvent(new CustomEvent('pyisland:download-select', { detail: next }));
      }
    }
  }, [isDownload, phase, onBackToContributors, onBackToHome, selectedIdx]);

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
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        pointerEvents: isDownload ? 'auto' : 'none',
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
          Downloads
        </span>
        {['文件', '编辑', '显示', '窗口', '帮助'].map(item => (
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

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - slideInFactor) * 80}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
          padding: '40px 24px',
        }}
      >
        {/* Terminal window */}
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          style={{
            width: '100%',
            maxWidth: '640px',
            background: 'rgba(20, 20, 20, 0.95)',
            borderRadius: '12px',
            border: `1px solid rgba(255,255,255,${cardHovered ? 0.18 : 0.10})`,
            overflow: 'hidden',
            boxShadow: cardHovered
              ? '0 16px 64px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.25)'
              : '0 24px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)',
            transform: cardHovered
              ? 'translateY(-6px) scale(1.015)'
              : `translateY(${(1 - slideInFactor) * 20}px) scale(${slideInFactor})`,
            opacity: slideInFactor,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease 0.1s, box-shadow 0.4s ease, border-color 0.3s ease',
          }}
        >
          {/* Window title bar */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(30, 30, 30, 0.8)',
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
                color: 'rgba(255,255,255,0.5)',
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
              padding: '24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
              transition: contentVisible
                ? 'opacity 0.22s ease 0.10s, transform 0.22s ease 0.10s'
                : 'opacity 0.15s ease, transform 0.15s ease',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                {/* Tagline badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  background: `${branch.accentBg}`,
                  border: `1px solid ${branch.accentBorder}`,
                  borderRadius: '20px',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: branch.accentColor,
                    letterSpacing: '0.03em',
                  }}>
                    {branch.tagline}
                  </span>
                </div>

                {/* Branch name */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.96)',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                  fontFamily: "'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}>
                  {branch.name}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.50)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {branch.description}
                </p>
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
                    background: branch.accentColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : branch.accentColor,
                    flexShrink: 0,
                    marginTop: '6px',
                    boxShadow: cardHovered ? `0 0 8px ${branch.accentColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : branch.accentColor + '90'}` : 'none',
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
              borderRadius: '8px',
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
                    padding: '11px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: 'none',
                    background: branch.accentColor === '#FFFFFF'
                      ? 'rgba(255,255,255,0.95)'
                      : `linear-gradient(135deg, ${branch.accentColor} 0%, ${branch.accentColor}bb 100%)`,
                    color: branch.accentColor === '#FFFFFF' ? '#1D1D1F' : '#fff',
                    fontFamily: 'inherit',
                    letterSpacing: '0.05em',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: branch.accentColor === '#FFFFFF'
                      ? '0 6px 24px rgba(255,255,255,0.20), inset 0 1px 0 rgba(255,255,255,0.50)'
                      : `0 6px 24px ${branch.accentColor}60, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.025)';
                    e.currentTarget.style.boxShadow = branch.accentColor === '#FFFFFF'
                      ? '0 10px 36px rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.60)'
                      : `0 10px 36px ${branch.accentColor}90, inset 0 1px 0 rgba(255,255,255,0.35)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = branch.accentColor === '#FFFFFF'
                      ? '0 6px 24px rgba(255,255,255,0.20), inset 0 1px 0 rgba(255,255,255,0.50)'
                      : `0 6px 24px ${branch.accentColor}60, inset 0 1px 0 rgba(255,255,255,0.25)`;
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
                  padding: '11px 20px',
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
            padding: '10px 16px',
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
              onClick={() => { setSelectedIdx(i); window.dispatchEvent(new CustomEvent('pyisland:download-select', { detail: i })); }}
              title={b.name}
              style={{
                width: i === displayIdx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === displayIdx
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(255,255,255,0.25)',
                boxShadow: i === displayIdx ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
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
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
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
            gap: '16px',
            marginTop: '16px',
            opacity: slideInFactor * 0.6,
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
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            贡献者
          </button>

          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            滚轮切换版本
          </span>

          <button
            onClick={() => window.location.href = '/'}
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
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            返回首页
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer — BeiAn + Copyright */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          opacity: slideInFactor * 0.45,
          transform: `translateY(${(1 - slideInFactor) * 8}px)`,
          transition: 'transform 0.7s ease 0.25s, opacity 0.7s ease 0.25s',
          zIndex: 5,
        }}
      >
        <a
          href="https://beian.miit.gov.cn"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.50)',
            textDecoration: 'none',
            letterSpacing: '0.03em',
            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            transition: 'color 0.2s ease',
            pointerEvents: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
        >
          苏ICP备2026009305号-2
        </a>
        <span style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.30)',
          letterSpacing: '0.04em',
          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}>
          {"\u00A9"} 2026 - present Python Island. All rights reserved.
        </span>
      </div>
    </div>
  );
}
