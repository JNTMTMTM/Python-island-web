'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            transform: isHovered ? 'scaleX(1.02)' : 'scaleX(1)',
            transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ...(isHovered && {
              boxShadow: '0 6px 32px rgba(0, 0, 0, 0.1)',
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
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="Pyisland 首页"
          >
            <img src="/island_w.svg" alt="" style={{ width: '22px', height: '22px', flexShrink: 0 }} />
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
          </Link>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[
              { href: '/features', label: '功能' },
              { href: '/developers', label: '开发者' },
              { href: '/download', label: '下载' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#71717a',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = '#fafafa';
                  (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = '#71717a';
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                {label}
              </Link>
            ))}
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
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = '#fafafa';
              el.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = '#71717a';
              el.style.background = 'transparent';
            }}
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
