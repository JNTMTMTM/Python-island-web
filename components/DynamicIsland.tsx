'use client';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Github } from 'lucide-react';

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePage, setActivePage] = useState('');
  const featuresBtnRef = useRef<HTMLButtonElement>(null);
  const branchesBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navigate = useCallback((hash: string) => {
    history.pushState(null, '', window.location.pathname + hash);
    window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
  }, []);

  useEffect(() => {
    const updateActivePage = () => {
      const hash = window.location.hash || '#hero';
      setActivePage(hash);
    };
    updateActivePage();

    const handleHashChange = () => updateActivePage();
    const handleNavigate = (e: Event) => {
      setActivePage((e as CustomEvent).detail.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('pyisland:navigate', handleNavigate);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('pyisland:navigate', handleNavigate);
    };
  }, []);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      let btn: HTMLButtonElement | null = null;
      let active = false;
      if (activePage === '#features' && featuresBtnRef.current) {
        btn = featuresBtnRef.current;
        active = true;
      } else if (activePage === '#branches' && branchesBtnRef.current) {
        btn = branchesBtnRef.current;
        active = true;
      }
      if (btn) {
        setIndicatorStyle({
          left: btn.offsetLeft + 6,
          width: btn.offsetWidth - 12,
          opacity: active ? 1 : 0,
        });
      }
    };
    updateIndicator();
  }, [activePage]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isScrolled ? '-100px' : '0'})`,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isScrolled ? 'none' : 'auto',
        opacity: isScrolled ? 0 : 1,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
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
            borderRadius: '32px',
            background: 'transparent',
            boxShadow: '0 0 0 1px rgba(113, 113, 122, 0.12), 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
            transform: isHovered ? 'scaleX(1.02)' : 'scaleX(1)',
            transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(isHovered && {
              boxShadow: '0 0 0 1px rgba(113, 113, 122, 0.18), 0 12px 48px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
            }),
          }}
        />

        {/* Main island body */}
        <div
          style={{
            position: 'relative',
            borderRadius: '28px',
            background: '#000000',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            minWidth: '240px',
            transform: isHovered ? 'scaleX(1.02)' : 'scaleX(1)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            {/* Active indicator underline — lives between both buttons so it can animate between them */}
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
      </div>
    </div>
  );
}
