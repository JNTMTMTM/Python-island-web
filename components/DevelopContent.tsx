'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ViewState, Phase } from './types';
import { downloadData } from '../data/downloadData';

interface DownloadsContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  onBackToBranches: () => void;
  onForwardToDevelopers: () => void;
}

export default function DownloadsContent({
  progress,
  activeView,
  phase,
  onBackToBranches,
  onForwardToDevelopers,
}: DownloadsContentProps) {
  const isDownloads = activeView === 'downloads';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;
  const opacity = isDownloads ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDownloads ? 1 : 0;

  const [selectedBranch, setSelectedBranch] = useState(0);
  const [displayBranch, setDisplayBranch] = useState(0);
  const [branchVisible, setBranchVisible] = useState(true);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  const [terminalContentHeight, setTerminalContentHeight] = useState(0);
  const [cardHovered, setCardHovered] = useState(false);
  const contentMeasuredRef = useRef<HTMLDivElement>(null);

  const currentData = downloadData[displayBranch];

  // Measure intrinsic content height (scrollHeight is unaffected by maxHeight)
  const measureHeight = useCallback((): number | null => {
    const el = contentMeasuredRef.current;
    if (!el) return null;
    // Temporarily reveal so scrollHeight is accurate
    el.style.overflow = 'visible';
    el.style.visibility = 'hidden';
    const h = el.scrollHeight;
    el.style.overflow = '';
    el.style.visibility = '';
    return h;
  }, []);

  // Measure via ResizeObserver on content change
  const handleResize = useCallback(() => {
    const h = measureHeight();
    if (h !== null && h > 0) {
      setTerminalContentHeight(h);
    }
  }, [measureHeight]);

  useEffect(() => {
    const el = contentMeasuredRef.current;
    if (!el) return;
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [handleResize]);

  // On entering downloads view: measure immediately after paint
  useEffect(() => {
    if (!isDownloads) return;
    requestAnimationFrame(() => {
      const h = measureHeight();
      if (h !== null && h > 0) {
        setTerminalContentHeight(h);
      }
    });
  }, [isDownloads, measureHeight]);

  // Two-phase switch: fade out → switch branch → measure new height → fade in
  useEffect(() => {
    if (selectedBranch === displayBranch) return;
    setBranchVisible(false);
    const t1 = setTimeout(() => {
      setDisplayBranch(selectedBranch);
      const t2 = setTimeout(() => {
        const h = measureHeight();
        setTerminalContentHeight(h !== null && h > 0 ? h : 300);
        setBranchVisible(true);
        setCopiedLine(null);
      }, 60);
      return () => clearTimeout(t2);
    }, 180);
    return () => clearTimeout(t1);
  }, [selectedBranch, displayBranch, measureHeight]);

  const copyCommand = (cmd: string, lineNum: number) => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedLine(lineNum);
      setTimeout(() => setCopiedLine(null), 1500);
    });
  };

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

  useEffect(() => {
    if (!isDownloads) return;
    const handleWheel = (e: WheelEvent) => {
      if (phase !== 'idle') return;
      e.preventDefault();
      if (e.deltaY > 0) {
        if (selectedBranch < downloadData.length - 1) {
          const next = selectedBranch + 1;
          setSelectedBranch(next);
          window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: next }));
        } else {
          onForwardToDevelopers();
        }
      } else {
        if (selectedBranch > 0) {
          const prev = selectedBranch - 1;
          setSelectedBranch(prev);
          window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: prev }));
        } else {
          onBackToBranches();
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDownloads, phase, selectedBranch, onBackToBranches, onForwardToDevelopers]);

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
        pointerEvents: isDownloads ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 30%, #2d2d2d 55%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'macBgShift 20s ease infinite',
        overflow: 'hidden',
        paddingTop: '100px',
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
          Terminal
        </span>
        {['Shell', '编辑', '显示', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
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
          marginTop: '0px',
          padding: '40px 24px',
        }}
      >
        {/* Terminal window */}
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          style={{
            width: '100%',
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
          {/* Terminal title bar */}
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
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            ))}
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              ~ / pyisland / install / {currentData.name}
            </span>
          </div>

          {/* Terminal content — fade + height animated on branch switch */}
          <div
            style={{
              maxHeight: branchVisible ? `${terminalContentHeight}px` : '0px',
              overflow: 'hidden',
              transition: branchVisible
                ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'max-height 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              ref={contentMeasuredRef}
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                opacity: branchVisible ? 1 : 0,
                transform: branchVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                transition: branchVisible
                  ? 'opacity 0.2s ease 0.15s, transform 0.2s ease 0.15s'
                  : 'opacity 0.15s ease, transform 0.15s ease',
              }}
            >
            {/* Branch info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  // justifyContent: 'center',
                  padding: '4px 10px',
                  background: `${currentData.accent}12`,
                  border: `1px solid ${currentData.accent}28`,
                  borderRadius: '20px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: '600', color: `${currentData.accent}cc`, letterSpacing: '0.03em' }}>
                  {currentData.name}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                {currentData.tagline}
              </span>
            </div>

            {/* Install methods */}
            {currentData.installMethods.map((method, methodIdx) => (
              <div key={method.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#28C840', fontFamily: 'ui-monospace, monospace' }}>
                    #
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                    {method.title}
                  </span>
                  {method.note && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>
                      {method.note}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {method.commands.map((cmd, cmdIdx) => {
                    const globalLine = currentData.installMethods
                      .slice(0, methodIdx)
                      .reduce((sum, m) => sum + m.commands.length, 0) + cmdIdx + 1;
                    return (
                      <div
                        key={cmdIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 14px',
                          borderBottom: cmdIdx < method.commands.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'ui-monospace, monospace', width: '24px', flexShrink: 0 }}>
                          {globalLine}
                        </span>
                        <code
                          style={{
                            flex: 1,
                            fontSize: '12px',
                            color: cmd.startsWith('#') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {cmd}
                        </code>
                        {!cmd.startsWith('#') && (
                          <button
                            onClick={() => copyCommand(cmd, globalLine)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              border: 'none',
                              background: copiedLine === globalLine
                                ? 'rgba(40, 200, 64, 0.2)'
                                : 'rgba(255,255,255,0.08)',
                              color: copiedLine === globalLine
                                ? '#28C840'
                                : 'rgba(255,255,255,0.5)',
                              transition: 'all 0.2s ease',
                              fontFamily: 'ui-monospace, monospace',
                            }}
                          >
                            {copiedLine === globalLine ? 'copied' : 'copy'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Requirements */}
            {currentData.requirements && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#FEBC2E', fontFamily: 'ui-monospace, monospace' }}>!</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>依赖要求</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentData.requirements.map(req => (
                    <span
                      key={req}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(254, 188, 46, 0.1)',
                        border: '1px solid rgba(254, 188, 46, 0.2)',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#FEBC2E',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
          {downloadData.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setSelectedBranch(i); window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: i })); }}
              title={item.name}
              style={{
                width: i === displayBranch ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === displayBranch
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.25)',
                boxShadow: i === displayBranch ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: 0,
              }}
              onMouseEnter={e => {
                if (i !== displayBranch) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.width = '12px';
                }
              }}
              onMouseLeave={e => {
                if (i !== displayBranch) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.width = '8px';
                }
              }}
            />
          ))}
        </div>

        {/* Navigation hint */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            opacity: slideInFactor * 0.6,
            transition: 'transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s',
          }}
        >
          <button
            onClick={onBackToBranches}
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
            分支总览
          </button>

          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            滚轮切换版本
          </span>

          <button
            onClick={onForwardToDevelopers}
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
            开发者
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
