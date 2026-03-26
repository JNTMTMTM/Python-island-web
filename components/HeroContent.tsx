'use client';

import { Download, Github } from 'lucide-react';
import stylesButton from '@/styles/button.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';

type ViewState = 'hero' | 'features' | 'branches';
type Phase = 'idle' | 'transitioning';

interface HeroContentProps {
  threeRef: { current: { setHover: (val: boolean) => void } | null };
  progress: number;
  activeView: ViewState;
  phase: Phase;
}

export default function HeroContent({ threeRef, progress, activeView, phase }: HeroContentProps) {
  const isHero = activeView === 'hero';

  // Slide-out: when transitioning hero→features, progress goes 0→1, hero should fade/slide out
  const slideOut = phase === 'transitioning' && activeView !== 'hero' ? progress : 0;
  // Slide-in: when transitioning features→hero, hero appears and slides up into place
  const slideIn = isHero && phase === 'transitioning' ? progress : 1;

  const opacity = isHero ? Math.max(0, 1 - slideOut) * slideIn : 0;
  const translateY = isHero ? -slideOut * 80 + (1 - slideIn) * 50 : 0;

  return (
    <div
      id="hero"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        pointerEvents: isHero ? 'auto' : 'none',
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
          className={isHero ? stylesEffect.heroSubtitleAnim : ''}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: ' #86868B',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: isHero ? undefined : 0,
          }}
        >
          Windows Dynamic Island
        </span>

        <h1
          className={`${stylesTypography.textHero} ${stylesEffect.gradientText} ${isHero ? stylesEffect.heroTitleAnim : ''}`}
          style={{ letterSpacing: '-0.02em', opacity: isHero ? undefined : 0 }}
        >
          Pyisland
        </h1>

        <p
          className={isHero ? stylesEffect.heroDescAnim : ''}
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: 'rgb(89, 89, 92)',
            lineHeight: 1.6,
            maxWidth: '440px',
            fontWeight: 400,
            opacity: isHero ? undefined : 0,
          }}
        >
          Windows 灵动岛新时代 — 打造现代控制中心
        </p>

        <div
          className={isHero ? stylesEffect.heroButtonsAnim : ''}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '8px',
            opacity: isHero ? undefined : 0,
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
