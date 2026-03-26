'use client';

import {
  MousePointerClick,
  Sun,
  Volume2,
  Activity,
  Clipboard,
  Move,
} from 'lucide-react';
import stylesGlass from '@/styles/glass.module.css';
import stylesEffect from '@/styles/effect.module.css';

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

interface FeatureCardProps {
  icon: typeof MousePointerClick;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
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

interface FeaturesContentProps {
  transitionProgress: number;
}

export default function FeaturesContent({ transitionProgress }: FeaturesContentProps) {
  const contentOpacity = Math.min(1, Math.max(0, (transitionProgress - 0.65) * 3.5));
  const slideInFactor = Math.min(1, Math.max(0, (transitionProgress - 0.7) * 3.5));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: contentOpacity,
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
            transform: `translateX(${(1 - slideInFactor) * -60}px)`,
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
              transform: `translateY(${(1 - slideInFactor) * 100}px)`,
              opacity: contentOpacity,
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
            transform: `translateX(${(1 - slideInFactor) * 60}px)`,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
          }}
        >
          <FeatureCard {...features[3]} index={3} />
          <FeatureCard {...features[4]} index={4} />
          <FeatureCard {...features[5]} index={5} />
        </div>
      </div>
    </div>
  );
}
