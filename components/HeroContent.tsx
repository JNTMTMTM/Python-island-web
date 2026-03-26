'use client';

import { Download, Github } from 'lucide-react';
import stylesButton from '@/styles/button.module.css';
import stylesTypography from '@/styles/typography.module.css';

interface HeroContentProps {
  threeRef: { current: { setHover: (val: boolean) => void } | null };
  transitionProgress: number;
  view: 'hero' | 'features';
}

export default function HeroContent({ threeRef, transitionProgress, view }: HeroContentProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: view === 'hero' ? 1 : 0,
        transform: `translateY(${Math.min(transitionProgress * 2, 1) * -80}px)`,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: view === 'hero' ? 'auto' : 'none',
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '680px',
          padding: '0 clamp(20px, 5vw, 60px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#86868B',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Windows Dynamic Island
        </span>

        <h1
          className={stylesTypography.textHero}
          style={{ color: '#1D1D1F', letterSpacing: '-0.03em' }}
        >
          Pyisland
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: '#86868B',
            lineHeight: 1.6,
            maxWidth: '440px',
            fontWeight: '400',
          }}
        >
          Windows 灵动岛新时代 — 用 Python 开发，为 Windows 打造现代控制中心
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <a
            href="/download"
            className={stylesButton.btnPrimary}
            onMouseEnter={() => threeRef.current?.setHover(true)}
            onMouseLeave={() => threeRef.current?.setHover(false)}
          >
            <Download size={16} />
            立即下载
          </a>
          <a
            href="/developers"
            className={stylesButton.btnSecondary}
            onMouseEnter={() => threeRef.current?.setHover(true)}
            onMouseLeave={() => threeRef.current?.setHover(false)}
          >
            <Github size={16} />
            开发文档
          </a>
        </div>
      </div>
    </div>
  );
}
