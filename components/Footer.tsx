'use client';

import { Github, BookOpen, ExternalLink } from 'lucide-react';
import stylesLayout from '@/styles/layout.module.css';

const footerLinks = [
  {
    title: '产品',
    items: [
      { label: '功能介绍', href: '#features', external: false },
      { label: '分支版本', href: '#versions', external: false },
      { label: '立即下载', href: '#download', external: false },
    ],
  },
  {
    title: '资源',
    items: [
      { label: '文档站', href: 'https://docs.pyisland.com/', external: true },
      { label: 'GitHub', href: 'https://github.com/Python-island/Python-island', external: true },
      { label: 'Release Notes', href: 'https://github.com/Python-island/Python-island/releases', external: true },
    ],
  },
  {
    title: '社区',
    items: [
      { label: '贡献指南', href: 'https://github.com/Python-island/Python-island/blob/pyisland-web/.github/CONTRIBUTING.md', external: true },
      { label: '行为准则', href: 'https://github.com/Python-island/Python-island/blob/pyisland-web/.github/CODE_OF_CONDUCT.md', external: true },
      { label: 'License', href: 'https://github.com/Python-island/Python-island/blob/pyisland-web/.github/LICENSE', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(to bottom, transparent, rgba(9,9,11,0.8))',
        padding: 'clamp(48px, 8vw, 80px) 0 32px',
      }}
    >
      <div className={stylesLayout.sectionContainer}>
        {/* Top: Brand + Links */}
        <div
          id="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 'clamp(32px, 5vw, 60px)',
            marginBottom: 'clamp(40px, 6vw, 60px)',
          }}
        >
          {/* Brand column */}
          <div>
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              aria-label="Pyisland 首页"
            >
              <img src="/island_w.svg" alt="" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                Pyisland
              </span>
            </a>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                maxWidth: '280px',
                marginBottom: '20px',
              }}
            >
              用 Python 开发，运行在 Windows 上的现代灵动岛控制中心。
            </p>

            <a
              href="https://docs.pyisland.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#D4D4D8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              <BookOpen size={13} />
              docs.pyisland.com
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                {group.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.55)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      }}
                    >
                      {item.label}
                      {item.external && (
                        <ExternalLink
                          size={10}
                          style={{
                            display: 'inline',
                            marginLeft: '4px',
                            opacity: 0.4,
                            verticalAlign: 'middle',
                          }}
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            © 2026 Pyisland. All rights reserved.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="https://github.com/Python-island/Python-island"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
              }}
              aria-label="GitHub"
            >
              <Github size={14} />
              GitHub
            </a>

            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.25)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              备案信息
            </a>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          #footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          #footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
