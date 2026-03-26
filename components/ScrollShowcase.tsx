'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { ThreeSceneHandle } from './ThreeScene';
import styles from '@/styles/animation.module.css';
import stylesLayout from '@/styles/layout.module.css';
import {
  MousePointerClick,
  Sun,
  Volume2,
  Activity,
  Clipboard,
  Move,
  Download,
  Github,
} from 'lucide-react';
import stylesGlass from '@/styles/glass.module.css';
import stylesBadge from '@/styles/badge.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';
import stylesButton from '@/styles/button.module.css';

const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle> }>;

type ViewState = 'hero' | 'features';

const features = [
  {
    icon: MousePointerClick,
    title: '智能展开/收起',
    description: '点击展开显示控制面板，失去焦点自动收缩 — 优雅的交互体验，无需额外操作。',
    accent: '#1D1D1F',
  },
  {
    icon: Sun,
    title: '亮度调节',
    description: '滑动条调节系统亮度，支持防抖机制 — 平滑调节，精准控制屏幕亮度。',
    accent: '#1D1D1F',
  },
  {
    icon: Volume2,
    title: '音量控制',
    description: '实时调节系统音量 — 一触即达，告别传统托盘图标点击。',
    accent: '#1D1D1F',
  },
  {
    icon: Activity,
    title: '系统状态监控',
    description: '实时显示 WiFi、蓝牙、电池状态 — 所有重要信息一目了然。',
    accent: '#1D1D1F',
  },
  {
    icon: Clipboard,
    title: '剪贴板监控',
    description: '自动检测剪贴板中的 URL 并提供快捷打开选项 — 智能识别，高效流转。',
    accent: '#1D1D1F',
  },
  {
    icon: Move,
    title: '鼠标拖动',
    description: '支持鼠标拖动调整灵动岛位置 — 自由摆放，随心所欲。',
    accent: '#1D1D1F',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: Omit<(typeof features)[0], 'accent'> & { index: number }) {
  return (
    <div
      className={`${stylesGlass.glassCard} ${stylesGlass.glassCardHover}`}
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #86868B, transparent)',
          opacity: 0.4,
          transition: 'opacity 0.3s ease, width 0.3s ease',
        }}
        className="card-accent-line"
      />
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(29, 29, 31, 0.06)',
          border: '1px solid rgba(29, 29, 31, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        }}
        className="card-icon"
      >
        <Icon size={18} color="#1D1D1F" />
      </div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1D1D1F',
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: '#86868B',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

interface ScrollShowcaseProps {
  children?: ReactNode;
}

export default function ScrollShowcase({ children }: ScrollShowcaseProps) {
  const [view, setView] = useState<ViewState>('hero');
  const [transitionProgress, setTransitionProgress] = useState(0);
  const threeRef = useRef<ThreeSceneHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const wheelAccumulator = useRef(0);

  const handleTransition = useCallback((direction: 'down' | 'up') => {
    if (isTransitioning.current) return;

    if (direction === 'down' && view === 'hero') {
      isTransitioning.current = true;
      setView('features');
      
      let start: number | null = null;
      const duration = 800;
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        setTransitionProgress(eased);
        threeRef.current?.setTransition(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isTransitioning.current = false;
        }
      };
      requestAnimationFrame(animate);
      
    } else if (direction === 'up' && view === 'features') {
      isTransitioning.current = true;
      
      let start: number | null = null;
      const duration = 800;
      
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        setTransitionProgress(1 - eased);
        threeRef.current?.setTransition(1 - eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setView('hero');
          isTransitioning.current = false;
        }
      };
      requestAnimationFrame(animate);
    }
  }, [view]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      wheelAccumulator.current += e.deltaY;
      
      if (Math.abs(wheelAccumulator.current) > 80) {
        if (wheelAccumulator.current > 0) {
          handleTransition('down');
        } else {
          handleTransition('up');
        }
        wheelAccumulator.current = 0;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleTransition]);

  const isFeaturesView = transitionProgress > 0;

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#FFFFFF',
      }}
    >
      {/* Layer 1: Subtle gradient background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(245, 245, 247, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 2: 3D Canvas - full screen background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
        }}
      >
        <ThreeScene ref={threeRef} />
      </div>

      {/* Layer 3: Hero Content - shows when in hero view */}
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

      {/* Scroll Indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: `translateX(-50%) translateY(${Math.min(transitionProgress * 2, 1) * 100}px)`,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: Math.max(0, 1 - transitionProgress * 4),
          transition: 'opacity 0.4s ease, transform 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#A1A1A6',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          向下滚动
        </span>
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(29, 29, 31, 0.2), transparent)',
          }}
        />
      </div>

      {/* Features Content - appears after island rotation completes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Math.min(1, Math.max(0, (transitionProgress - 0.65) * 3.5)),
          pointerEvents: transitionProgress > 0.88 ? 'auto' : 'none',
          transition: 'opacity 0.5s ease 0.1s',
          zIndex: 4,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '0 clamp(20px, 5vw, 60px)',
            display: 'grid',
            gridTemplateColumns: '1fr 320px 1fr',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transform: `translateX(${(1 - Math.min(1, Math.max(0, (transitionProgress - 0.7) * 3.5))) * -60}px)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
            }}
          >
            <FeatureCard {...features[0]} index={0} />
            <FeatureCard {...features[1]} index={1} />
            <FeatureCard {...features[2]} index={2} />
          </div>

          {/* Center - Island placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '280px',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateY(${(1 - Math.min(1, Math.max(0, (transitionProgress - 0.7) * 3.5))) * 100}px)`,
                opacity: Math.min(1, Math.max(0, (transitionProgress - 0.65) * 3.5)),
                transition: 'transform 0.8s ease, opacity 0.8s ease',
              }}
            >
              <span
                className={stylesEffect.gradientText}
                style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                  marginBottom: '12px',
                }}
              >
                核心功能
              </span>
              <p
                style={{
                  fontSize: '14px',
                  color: '#86868B',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  maxWidth: '200px',
                }}
              >
                每一个细节都为 Windows 用户精心打造
              </p>
            </div>
          </div>

          {/* Right column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transform: `translateX(${(1 - Math.min(1, Math.max(0, (transitionProgress - 0.7) * 3.5))) * 60}px)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
            }}
          >
            <FeatureCard {...features[3]} index={3} />
            <FeatureCard {...features[4]} index={4} />
            <FeatureCard {...features[5]} index={5} />
          </div>
        </div>
      </div>

      {/* Back to top indicator in features view */}
      {isFeaturesView && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
          onClick={() => handleTransition('up')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span style={{ fontSize: '13px', color: '#1D1D1F', fontWeight: '500' }}>返回</span>
        </div>
      )}
    </div>
  );
}
