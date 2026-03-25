'use client';

import { useRef } from 'react';
import {
  MousePointerClick,
  Sun,
  Volume2,
  Activity,
  Clipboard,
  Move,
} from 'lucide-react';
import stylesGlass from '@/styles/glass.module.css';
import stylesLayout from '@/styles/layout.module.css';
import stylesBadge from '@/styles/badge.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';
import stylesAnimation from '@/styles/animation.module.css';

const features = [
  {
    icon: MousePointerClick,
    title: '智能展开/收起',
    description:
      '点击展开显示控制面板，失去焦点自动收缩 — 优雅的交互体验，无需额外操作。',
    accent: '#71717A',
  },
  {
    icon: Sun,
    title: '亮度调节',
    description:
      '滑动条调节系统亮度，支持防抖机制 — 平滑调节，精准控制屏幕亮度。',
    accent: '#A1A1AA',
  },
  {
    icon: Volume2,
    title: '音量控制',
    description:
      '实时调节系统音量 — 一触即达，告别传统托盘图标点击。',
    accent: '#D4D4D8',
  },
  {
    icon: Activity,
    title: '系统状态监控',
    description:
      '实时显示 WiFi、蓝牙、电池状态 — 所有重要信息一目了然。',
    accent: '#71717A',
  },
  {
    icon: Clipboard,
    title: '剪贴板监控',
    description:
      '自动检测剪贴板中的 URL 并提供快捷打开选项 — 智能识别，高效流转。',
    accent: '#A1A1AA',
  },
  {
    icon: Move,
    title: '鼠标拖动',
    description:
      '支持鼠标拖动调整灵动岛位置 — 自由摆放，随心所欲。',
    accent: '#D4D4D8',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  index,
}: (typeof features)[0] & { index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={`${stylesGlass.glassCard} ${stylesGlass.glassCardHover}`}
      style={{
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Accent glow top */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-lg)',
          background: `rgba(161, 161, 170, 0.12)`,
          border: `1px solid rgba(161, 161, 170, 0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon size={22} color="#A1A1AA" />
      </div>

      {/* Text */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 140px) 0',
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(161,161,170,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className={stylesLayout.sectionContainer}>
        {/* Section header — left-aligned layout */}
        <div
          style={{
            marginBottom: 'clamp(48px, 8vw, 80px)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          }}
        >
          {/* Left: Label + Title */}
          <div>
            <span
              className={`${stylesBadge.badge} ${stylesBadge.badgeAccent}`}
              style={{ marginBottom: '20px', display: 'inline-flex' }}
            >
              核心功能
            </span>
            <h2 className={stylesTypography.textSection} style={{ marginBottom: '16px' }}>
              <span className={stylesEffect.gradientText}>功能介绍</span>
            </h2>
            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                maxWidth: '460px',
              }}
            >
              每一个细节都为 Windows 用户精心打造 — 从交互设计到底层实现，追求极致的用户体验。
            </p>
          </div>

          {/* Right: Decorative number */}
          <div
            aria-hidden="true"
            style={{
              textAlign: 'right',
              fontSize: 'clamp(80px, 12vw, 140px)',
              fontWeight: '800',
              color: 'rgba(161,161,170,0.04)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}
          >
            Pyisland
          </div>
        </div>

        {/* Feature grid */}
        <div
          id="features-grid"
          className={stylesAnimation.staggerChildren}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          #features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
