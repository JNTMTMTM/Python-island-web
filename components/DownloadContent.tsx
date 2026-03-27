'use client';

import { useEffect, useCallback } from 'react';
import type { ViewState, Phase } from './types';
import stylesGlass from '@/styles/glass.module.css';
import stylesButton from '@/styles/button.module.css';
import stylesBadge from '@/styles/badge.module.css';
import stylesLayout from '@/styles/layout.module.css';
import { downloadBranches } from '@/data/downloadData';

interface DownloadContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  onBackToContributors: () => void;
}

type Branch = typeof downloadBranches[number];

function BranchCard({ branch, index }: { branch: Branch; index: number }) {
  const isAvailable = branch.downloadLabel === '立即下载';

  return (
    <div
      className={stylesGlass.glassCardHover}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span className={`${stylesBadge.badge} ${branch.badgeClass}`} style={{ marginBottom: '6px' }}>
            {branch.tagline}
          </span>
          <h3 style={{
            fontSize: '17px',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#1D1D1F',
            marginTop: '8px',
          }}>
            {branch.name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#86868B',
            marginTop: '3px',
          }}>
            {branch.description}
          </p>
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: branch.accentBg,
            border: `1px solid ${branch.accentBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            color: branch.accentColor,
            letterSpacing: '-0.02em',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          }}>
            {branch.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {branch.features.map((feature) => (
          <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: branch.accentColor,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', color: '#515154', lineHeight: 1.4 }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 12px',
        background: '#F5F5F7',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#86868B',
      }}>
        <span style={{ fontWeight: '500', color: '#515154' }}>适用人群：</span>
        {branch.audience}
      </div>

      <button
        className={isAvailable ? stylesButton.btnPrimary : stylesButton.btnSecondary}
        style={{
          width: '100%',
          marginTop: 'auto',
          opacity: isAvailable ? 1 : 0.5,
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          fontSize: '13px',
          padding: '9px 16px',
          fontFamily: 'inherit',
        }}
        onClick={() => isAvailable && window.open(branch.downloadUrl, '_blank')}
        disabled={!isAvailable}
        aria-label={`${branch.downloadLabel} ${branch.name}`}
      >
        {branch.downloadLabel}
      </button>
    </div>
  );
}

export default function DownloadContent({
  progress,
  activeView,
  phase,
  onBackToContributors,
}: DownloadContentProps) {
  const isDownload = activeView === 'download';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'contributors' ? progress : 0;
  const opacity = isDownload ? Math.max(0, 1 - slideOut) : 0;

  // Wheel: up → contributors, down → do nothing (end of scroll)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isDownload || phase !== 'idle') return;
    if (e.deltaY < 0) {
      e.preventDefault();
      onBackToContributors();
    }
  }, [isDownload, phase, onBackToContributors]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (opacity === 0 && !isDownload) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${(1 - opacity) * 16}px)`,
        transition: opacity < 1 ? 'none' : 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: isDownload ? 'auto' : 'none',
        padding: '100px 24px 40px',
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={stylesLayout.sectionContainer} style={{ maxWidth: '1400px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {downloadBranches.map((branch, i) => (
            <BranchCard key={branch.id} branch={branch} index={i} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className={stylesGlass.glassCard} style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#1D1D1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#fff', lineHeight: 1 }}>i</span>
              </span>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                系统要求
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Windows 10/11 (64位)'].map((req) => (
                <span key={req} style={{
                  padding: '5px 12px',
                  background: '#F5F5F7',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#515154',
                  fontWeight: '500',
                }}>
                  {req}
                </span>
              ))}
            </div>
          </div>

          <div className={stylesGlass.glassCard} style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              注意事项
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                '部分安全软件可能会误报，请添加信任',
                '首次运行需要安装依赖，请耐心等待',
                '建议关闭杀毒软件后再安装',
              ].map((note) => (
                <li key={note} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#515154', lineHeight: 1.4 }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D97706', marginTop: '5px', flexShrink: 0 }} />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={stylesGlass.glassCard} style={{ padding: '20px 24px', marginTop: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            获取帮助
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {[
              { text: '查看文档', href: 'https://docs.pyisland.com/branches/overview' },
              { text: '提交 Issue', href: 'https://github.com/Python-island/Python-island/issues' },
              { text: '加入交流群讨论', href: '#' },
            ].map((item) => (
              <a
                key={item.text}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#1D1D1F',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                  padding: '5px 12px',
                  background: '#F5F5F7',
                  borderRadius: '6px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#747478')}
                onMouseLeave={e => (e.currentTarget.style.color = '#1D1D1F')}
              >
                {item.text}
              </a>
            ))}
            <a
              href="https://github.com/Python-island/Python-island"
              target="_blank"
              rel="noopener noreferrer"
              className={stylesButton.btnSecondary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                padding: '5px 14px',
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
