'use client';

import dynamic from 'next/dynamic';
import { useRef, useEffect, ComponentType } from 'react';
import { Download, Github } from 'lucide-react';
import Link from 'next/link';
import { ThreeSceneInner } from './ThreeScene';
import type { ThreeSceneHandle } from './ThreeScene';
import styles from '@/styles/animation.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesButton from '@/styles/button.module.css';

const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle> }>;

export default function Hero() {
  const threeRef = useRef<ThreeSceneHandle>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Sync hue from ThreeScene animation loop to a CSS variable on the section element
  useEffect(() => {
    let rafId: number;

    const syncHue = () => {
      const hue = threeRef.current?.hueRef.current;
      if (sectionRef.current && hue !== undefined) {
        sectionRef.current.style.setProperty('--hero-hue', `${hue.toFixed(1)}`);
      }
      rafId = requestAnimationFrame(syncHue);
    };

    rafId = requestAnimationFrame(syncHue);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '68px',
      }}
    >
      {/* 3D Canvas — always mounted, handles its own loading/error/fallback internally */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <ThreeScene ref={threeRef} />
      </div>

      {/* Radial gradient overlay - focus center */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(9,9,11,0.3) 40%, rgba(9,9,11,0.85) 70%, #09090B 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, #09090B 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* CTA Buttons Overlay - Fixed at bottom of hero, highest z-index */}
      <div
        className={`${styles.animateFadeInUp} ${styles.animationDelay200}`}
        style={{
          position: 'absolute',
          bottom: '120px',
          left: 0,
          right: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: 0,
        }}
      >
        <Link
          href="/download"
          className={stylesButton.btnPrimary}
          onMouseEnter={() => threeRef.current?.setHover(true)}
          onMouseLeave={() => threeRef.current?.setHover(false)}
        >
          <Download size={16} />
          立即下载
        </Link>
        <Link
          href="/developers"
          className={stylesButton.btnSecondary}
          onMouseEnter={() => threeRef.current?.setHover(true)}
          onMouseLeave={() => threeRef.current?.setHover(false)}
        >
          <Github size={16} />
          开发文档
        </Link>
      </div>

      {/* Content - centered, below the 3D island */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 60px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Headline */}
        <div className={styles.animateFadeInUp} style={{ opacity: 0 }}>
          <h1
            className={stylesTypography.textHero}
            style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
          >
            Pyisland
          </h1>
        </div>

        {/* Sub-headline */}
        <div
          className={`${styles.animateFadeInUp} ${styles.animationDelay100}`}
          style={{ opacity: 0 }}
        >
          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: '480px',
            }}
          >
            Windows 灵动岛新时代 — 用 Python 开发，为 Windows 打造现代控制中心
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 1s 1.2s forwards',
          opacity: 0,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          向下滚动
        </span>
        <div
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(161,161,170,0.3), transparent)',
          }}
        />
      </div>
    </section>
  );
}
