'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Github } from 'lucide-react';
import { developData } from '../data/developData';

type NavPage = '#hero' | '#features' | '#branches' | '#develop' | '#contributors' | '#download';

const NAV_ORDER: NavPage[] = ['#hero', '#features', '#branches', '#develop', '#contributors', '#download'];

const PAGE_TITLES: Record<Exclude<NavPage, '#hero'>, { title: string; subtitle: string }> = {
  '#features': { title: '核心功能', subtitle: '每一个细节都为 Windows 用户精心打造' },
  '#branches': { title: '分支总览', subtitle: '探索 Pyisland 项目的多个分支版本' },
  '#develop': { title: '快速安装', subtitle: '选择版本，获取安装命令' },
  '#contributors': { title: '关于贡献者', subtitle: 'Python-island 项目团队' },
  '#download': { title: '立即下载', subtitle: '选择适合您的版本进行下载' },
};

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [activePage, setActivePage] = useState<NavPage>('#hero');
  const [selectedBranch, setSelectedBranch] = useState(0);
  const featuresBtnRef = useRef<HTMLButtonElement>(null);
  const branchesBtnRef = useRef<HTMLButtonElement>(null);
  const developBtnRef = useRef<HTMLButtonElement>(null);
  const contributorsBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navigate = useCallback((hash: string) => {
    history.pushState(null, '', window.location.pathname + hash);
    window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
  }, []);

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

  // Listen for branch-select from DevelopContent (wheel scroll) to update island visual state
  useEffect(() => {
    const handleBranchSelect = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (idx !== selectedBranch) setSelectedBranch(idx);
    };
    window.addEventListener('pyisland:branch-select', handleBranchSelect);
    return () => window.removeEventListener('pyisland:branch-select', handleBranchSelect);
  }, [selectedBranch]);

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

  const isHero = activePage === '#hero';
  const pageInfo = !isHero ? PAGE_TITLES[activePage] : null;
  const showTitle = !isHero;
  const isDevelopContrib = activePage === '#develop' || activePage === '#contributors' || activePage === '#download';
  const islandTop = isDevelopContrib ? '52px' : '24px';
  const showBranchSwitcher = activePage === '#develop';
  const showIslandExpanded = showTitle || showBranchSwitcher;
  const islandRadius = showIslandExpanded ? '32px' : '28px';
  const outerRadius = showIslandExpanded ? '36px' : '32px';
  const islandMinWidth = showIslandExpanded ? '380px' : '280px';

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
        {/* Outer glow */}
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

        {/* Island body — height and width expand simultaneously from the top */}
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
          {/* Nav row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 10px',
              minWidth: '240px',
            }}
          >
            {/* Left logo */}
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

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.12)',
                margin: '0 4px',
                flexShrink: 0,
              }}
            />

            {/* Nav links */}
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
              {/* Active indicator underline */}
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

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.12)',
                margin: '0 4px',
                flexShrink: 0,
              }}
            />

            {/* GitHub icon */}
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
          </div>

          {/* Title section — always rendered so CSS transitions actually animate */}
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

          {/* Branch switcher row — only visible on #develop page */}
          <div
            style={{
              maxHeight: activePage === '#develop' ? '56px' : '0px',
              overflow: 'hidden',
              opacity: activePage === '#develop' ? 1 : 0,
              transition: 'max-height 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: activePage === '#develop' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 12px',
                transform: activePage === '#develop' ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
                opacity: activePage === '#develop' ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
              }}
            >
              {developData.map((item, i) => (
                <div
                  key={item.id}
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
                    cursor: 'default',
                    userSelect: 'none',
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
