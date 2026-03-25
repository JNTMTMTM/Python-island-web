'use client';

import { Download, Github, ExternalLink, Star } from 'lucide-react';
import stylesLayout from '@/styles/layout.module.css';
import stylesBadge from '@/styles/badge.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';
import stylesButton from '@/styles/button.module.css';

export default function DownloadCTA() {
  return (
    <section
      id="download"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 140px) 0',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(99,102,241,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top border gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
        }}
      />

      <div className={stylesLayout.sectionContainer} style={{ position: 'relative', zIndex: 1 }}>
        {/* CTA Block */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto',
            padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 60px)',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow behind content */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '300px',
              background:
                'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Star badge */}
          <div style={{ marginBottom: '28px' }}>
            <span className={`${stylesBadge.badge} ${stylesBadge.badgeAccent}`}>
              <Star size={12} />
              开源免费
            </span>
          </div>

          <h2
            className={stylesTypography.textSection}
            style={{ marginBottom: '20px' }}
          >
            <span className={stylesEffect.gradientText}>立即体验</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(15px, 1.8vw, 17px)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              marginBottom: '40px',
            }}
          >
            下载 Pyisland，为你的 Windows 系统装上灵动岛。开源免费，持续更新。
          </p>

          {/* Download buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <a
              href="https://github.com/Python-island/Python-island/releases"
              target="_blank"
              rel="noopener noreferrer"
              className={stylesButton.btnPrimary}
              style={{ minWidth: '240px', cursor: 'pointer' }}
            >
              <Download size={16} />
              从 GitHub 下载
              <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>
            <a
              href="https://docs.pyisland.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={stylesButton.btnSecondary}
              style={{ minWidth: '240px', cursor: 'pointer' }}
            >
              查看安装指南
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Source code link */}
          <div>
            <a
              href="https://github.com/Python-island/Python-island"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <Github size={14} />
              源码 / GitHub
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
