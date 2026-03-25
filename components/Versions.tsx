'use client';

import { Monitor, Cpu, Layers } from 'lucide-react';
import stylesGlass from '@/styles/glass.module.css';
import stylesLayout from '@/styles/layout.module.css';
import stylesBadge from '@/styles/badge.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';
import stylesAnimation from '@/styles/animation.module.css';
import stylesButton from '@/styles/button.module.css';

const versions = [
  {
    icon: Monitor,
    name: 'pyislandPyside6',
    tag: '稳定版',
    tagType: 'badgeGreen',
    description:
      '基于 PySide6 的 Python 实现，稳定可靠。采用成熟的技术栈，适合大多数 Windows 用户。',
    highlights: ['PySide6 / Python', '成熟稳定', '易于扩展', '社区活跃'],
    accent: '#71717A',
    cta: '前往下载',
    href: '#download',
  },
  {
    icon: Cpu,
    name: 'tauri-island',
    tag: '高性能',
    tagType: 'badge-accent',
    description:
      '基于 Tauri 2 + Rust 的全新实现，性能更强。使用 Rust 后端，带来极致流畅的响应速度。',
    highlights: ['Tauri 2 / Rust', '极致性能', '体积小巧', '原生体验'],
    accent: '#A1A1AA',
    cta: '即将推出',
    href: '#',
    disabled: true,
  },
  {
    icon: Layers,
    name: 'pyisland-wanku',
    tag: '高仿真',
    tagType: 'badgeAmber',
    description:
      '高仿真 iOS 风格版本，支持录屏、媒体控制。更接近原生 iOS 灵动岛的设计细节。',
    highlights: ['iOS 风格', '录屏控制', '媒体控制', '精美动画'],
    accent: '#D4D4D8',
    cta: '即将推出',
    href: '#',
    disabled: true,
  },
];

export default function Versions() {
  return (
    <section
      id="versions"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 140px) 0',
        background:
          'linear-gradient(to bottom, transparent, rgba(161,161,170,0.03) 30%, rgba(161,161,170,0.03) 70%, transparent)',
      }}
    >
      <div className={stylesLayout.sectionContainer}>
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 'clamp(48px, 8vw, 80px)',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <span
              className={`${stylesBadge.badge} ${stylesBadge.badgeAccent}`}
              style={{ marginBottom: '20px', display: 'inline-flex' }}
            >
              技术选型
            </span>
            <h2 className={stylesTypography.textSection} style={{ marginBottom: '16px' }}>
              <span className={stylesEffect.gradientText}>多种分支版本</span>
            </h2>
            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                maxWidth: '480px',
              }}
            >
              根据你的需求选择最适合的版本 — 从 Python 的易用性到 Rust 的极致性能，总有一款适合你。
            </p>
          </div>
        </div>

        {/* Version cards */}
        <div id="versions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {versions.map((version, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={version.name}
                className={`${stylesGlass.glassCard} ${stylesGlass.glassCardHover} ${stylesAnimation.staggerChildren}`}
                style={{
                  padding: 'clamp(28px, 4vw, 48px)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'clamp(24px, 4vw, 60px)',
                  alignItems: 'center',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Left: Description */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: `rgba(161, 161, 170, 0.12)`,
                        border: `1px solid rgba(161, 161, 170, 0.2)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <version.icon
                        size={20}
                        color="#A1A1AA"
                      />
                    </div>
                    <code
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#fff',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {version.name}
                    </code>
                    <span className={`${stylesBadge.badge} ${stylesBadge[version.tagType as keyof typeof stylesBadge]}`}>
                      {version.tag}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '15px',
                      color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.7,
                      marginBottom: '24px',
                    }}
                  >
                    {version.description}
                  </p>

                  {/* Highlights */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '28px',
                    }}
                  >
                    {version.highlights.map((h) => (
                      <span
                        key={h}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'rgba(255,255,255,0.65)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  <a
                    href={version.href}
                    className={version.disabled ? '' : stylesButton.btnPrimary}
                    style={
                      version.disabled
                        ? {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: '600',
                            fontSize: '14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'not-allowed',
                            textDecoration: 'none',
                          }
                        : {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                          }
                    }
                    onClick={(e) => version.disabled && e.preventDefault()}
                  >
                    {version.cta}
                  </a>
                </div>

                {/* Right: Visual decoration */}
                <div
                  style={{
                    direction: 'ltr',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    height: '180px',
                  }}
                  aria-hidden="true"
                >
                  {/* Glow background */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(ellipse at center, ${version.accent}18 0%, transparent 70%)`,
                      borderRadius: 'var(--radius-lg)',
                    }}
                  />

                  {/* Pill mockup */}
                  <div
                    style={{
                      width: '200px',
                      height: '52px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(20, 20, 35, 0.9)',
                      border: `1px solid rgba(255,255,255,0.12)`,
                      boxShadow: `0 0 30px ${version.accent}30, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                    }}
                  >
                    {/* Inner content dots */}
                    {[
                      { color: '#34D399', label: 'wifi' },
                      { color: '#F59E0B', label: 'bat' },
                      { color: '#60A5FA', label: 'bluetooth' },
                    ].map((dot) => (
                      <div
                        key={dot.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: dot.color,
                            boxShadow: `0 0 6px ${dot.color}`,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Decorative rings */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '280px',
                      height: '280px',
                      borderRadius: '50%',
                      border: `1px solid ${version.accent}15`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '360px',
                      height: '360px',
                      borderRadius: '50%',
                      border: `1px solid ${version.accent}08`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #versions-grid > div {
            grid-template-columns: 1fr !important;
          }
          #versions-grid > div > div:last-child {
            height: 140px !important;
          }
        }
      `}</style>
    </section>
  );
}
