'use client';

import stylesGlass from '@/styles/glass.module.css';
import stylesEffect from '@/styles/effect.module.css';
import type { ViewState, Phase } from './types';

const codeSnippets = [
  {
    lang: 'bash',
    label: '安装',
    code: 'pip install pyisland\n# 或 clone 源码\ngit clone https://github.com/Python-island/Python-island',
  },
  {
    lang: 'python',
    label: '快速开始',
    code: 'from pyisland import Island\n\nisland = Island()\nisland.on_click(lambda: print("点击了灵动岛"))\nisland.run()',
  },
  {
    lang: 'python',
    label: '自定义 UI',
    code: 'island.set_brightness_control(enabled=True)\nisland.set_media_control(enabled=True)\nisland.set_rainbow_mode(enabled=True)',
  },
];

function CodeCard({ snippet, slideIn }: { snippet: typeof codeSnippets[number]; slideIn: number }) {
  const langColors: Record<string, string> = {
    bash: '#71717a',
    python: '#2563EB',
    rust: '#D97706',
  };
  const color = langColors[snippet.lang] ?? '#86868B';

  return (
    <div
      style={{
        width: '260px',
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '14px',
        overflow: 'hidden',
        transform: `translateY(${(1 - slideIn) * 30}px)`,
        opacity: slideIn,
        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          background: 'rgba(245, 245, 247, 0.6)',
        }}
      >
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
            <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: '10px', color: '#86868B', fontWeight: '500', marginLeft: '4px' }}>
          {snippet.label}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '9px',
            color: color,
            fontWeight: '600',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.05em',
          }}
        >
          {snippet.lang}
        </span>
      </div>
      {/* Code body */}
      <div style={{ padding: '14px 16px' }}>
        <pre
          style={{
            margin: 0,
            fontSize: '11px',
            lineHeight: 1.7,
            color: '#1D1D1F',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {snippet.code}
        </pre>
      </div>
    </div>
  );
}

interface DeveloperContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
}

export default function DeveloperContent({ progress, activeView, phase }: DeveloperContentProps) {
  const isDevelopers = activeView === 'developers';
  const isTransitioning = phase === 'transitioning';

  // Slide-out: when transitioning developers→branches (progress 0→1), this view fades out
  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;

  const opacity = isDevelopers ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDevelopers ? 1 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        pointerEvents: isDevelopers ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0d1b2a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* macOS menu bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: 'rgba(30, 30, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '20px',
          zIndex: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Apple logo */}
        <svg width="12" height="14" viewBox="0 0 12 14" fill="white" style={{ opacity: 0.9 }}>
          <path d="M9.5 10.5c0-1.5 1.2-2.2 1.2-3.1 0-.5-.4-.8-1-.8-.7 0-1.4.4-1.8 1l-.5-.6c.5-.7 1.3-1.1 2.3-1.1 1.4 0 2.3.8 2.3 2.1 0 1.4-1 2.4-1 3.5 0 .7.4 1.4 1.1 1.4.6 0 1-.4 1-.4l.4.5c-.1.1-.5.5-1.4.5-1.1 0-1.9-.8-1.9-2l.3-.1zm-4.5-.4c-.5-.6-1.3-.9-2-.9-.8 0-1.5.3-2 .9l.5.6c.4-.4.9-.6 1.5-.6.6 0 1.2.2 1.6.7l.4-.7zM8 0c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4S5.8 0 8 0zm0 7c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3z" />
        </svg>
        {/* Active app */}
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', letterSpacing: '0.01em' }}>
          Finder
        </span>
        {/* Menu items */}
        {['文件', '编辑', '显示', '前往', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Status icons */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.85)">
          <path d="M1 4C1 2.9 1.9 2 3 2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4zm0-1L0 3v4l1-1h12l1 1V3l-1 0H1z" />
          <path d="M4 5h6M4 7h3" stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none" />
        </svg>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>▼</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>100%</span>
        {/* Clock */}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          下午 3:42
        </span>
      </div>

      {/* Desktop icons */}
      {[
        { name: 'Pyisland', icon: '🟠', x: '18px' },
        { name: 'VSCode', icon: '🔵', x: '18px' },
        { name: 'Terminal', icon: '⚫', x: '18px' },
      ].map((icon, i) => (
        <div
          key={icon.name}
          style={{
            position: 'absolute',
            top: `calc(28px + ${i * 90}px + 20px)`,
            left: icon.x,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            opacity: slideInFactor * 0.85,
            transform: `translateY(${(1 - slideInFactor) * 10}px)`,
            transition: `opacity 0.6s ease ${0.5 + i * 0.08}s, transform 0.6s ease ${0.5 + i * 0.08}s`,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: icon.icon === '⚫'
                ? 'linear-gradient(135deg, #1D1D1F, #3a3a3c)'
                : icon.icon === '🔵'
                ? 'linear-gradient(135deg, #007ACC, #0098FF)'
                : 'linear-gradient(135deg, #FF9500, #FF6B00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'white', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {icon.name}
          </span>
        </div>
      ))}

      {/* Screen / window container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - slideInFactor) * 80}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
          marginTop: '28px',
        }}
      >
        {/* Title above screen */}
        <div
          style={{
            marginBottom: 'clamp(16px, 3vh, 28px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            transform: `translateY(${(1 - slideInFactor) * -20}px)`,
            opacity: slideInFactor,
            transition: 'transform 0.7s ease, opacity 0.7s ease',
          }}
        >
          <span
            className={stylesEffect.gradientText}
            style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '600', letterSpacing: '-0.02em' }}
          >
            开发指南
          </span>
          <p style={{ fontSize: '13px', color: '#86868B', textAlign: 'center', lineHeight: 1.6 }}>
            基于 PySide6 · 完整 API · 插件系统
          </p>
        </div>

        {/* Main screen window */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 0, 0, 0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0, 0, 0, 0.10), 0 2px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Window title bar */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'rgba(245, 245, 247, 0.7)',
            }}
          >
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
            ))}
            <span
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: '12px',
                color: '#86868B',
                fontWeight: '500',
                letterSpacing: '0.02em',
              }}
            >
              docs.pyisland.com — pyislandPyside6
            </span>
          </div>

          {/* Window content */}
          <div
            style={{
              padding: 'clamp(20px, 4vw, 40px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Feature highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { icon: '●', label: '核心功能', desc: '灵动岛胶囊、时间显示、控制面板' },
                { icon: '◉', label: '系统控制', desc: '亮度调节、WiFi/蓝牙、电池监控' },
                { icon: '○', label: '实用功能', desc: '剪贴板 URL 检测、快捷链接' },
                { icon: '◈', label: '事件总线', desc: '异步事件驱动架构' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(0, 0, 0, 0.025)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                    opacity: slideInFactor,
                    transition: `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s, opacity 0.6s ease ${i * 0.08}s`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#86868B' }}>{item.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1D1D1F' }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#86868B', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Code snippets */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '4px',
                transform: `translateY(${(1 - slideInFactor) * 20}px)`,
                opacity: slideInFactor,
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, opacity 0.7s ease 0.2s',
              }}
            >
              {codeSnippets.map((snippet, i) => (
                <CodeCard key={snippet.label} snippet={snippet} slideIn={slideInFactor} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(0, 0, 0, 0.025)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                transform: `translateY(${(1 - slideInFactor) * 16}px)`,
                opacity: slideInFactor * 0.9,
                transition: 'transform 0.6s ease 0.3s, opacity 0.6s ease 0.3s',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 2px' }}>
                  了解更多
                </p>
                <p style={{ fontSize: '11px', color: '#86868B', margin: 0 }}>
                  完整 API 文档 · 插件开发 · 贡献指南
                </p>
              </div>
              <a
                href="https://docs.pyisland.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 18px',
                  background: '#1D1D1F',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                访问文档 →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* macOS Dock */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: `translateX(-50%) translateY(${(1 - slideInFactor) * 30}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.7s ease 0.4s',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.25)',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        {[
          { name: 'Finder', emoji: '🗂️', w: 52, h: 52 },
          { name: 'Safari', emoji: '🧭', w: 52, h: 52 },
          { name: 'VSCode', emoji: '💻', w: 52, h: 52 },
          { name: 'Terminal', emoji: '⬛', w: 52, h: 52 },
          { name: 'Pyisland', emoji: '🟠', w: 52, h: 52 },
          { name: 'App Store', emoji: '🟦', w: 52, h: 52 },
          { name: 'Settings', emoji: '⚙️', w: 52, h: 52 },
        ].map((app) => (
          <div
            key={app.name}
            title={app.name}
            style={{
              width: `${app.w}px`,
              height: `${app.h}px`,
              borderRadius: '12px',
              background: app.emoji === '⬛'
                ? 'linear-gradient(135deg, #1D1D1F, #3a3a3c)'
                : app.emoji === '🟠'
                ? 'linear-gradient(135deg, #FF9500, #FF6B00)'
                : app.emoji === '🟦'
                ? 'linear-gradient(135deg, #007AFF, #0051D4)'
                : app.emoji === '💻'
                ? 'linear-gradient(135deg, #007ACC, #0098FF)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          />
        ))}
        {/* Separator */}
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
        {[
          { name: 'Trash', emoji: '🗑️', w: 52, h: 52 },
        ].map((app) => (
          <div
            key={app.name}
            title={app.name}
            style={{
              width: `${app.w}px`,
              height: `${app.h}px`,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          />
        ))}
      </div>
    </div>
  );
}
