'use client';

import { useState, useEffect, useRef } from 'react';
import stylesEffect from '@/styles/effect.module.css';
import type { ViewState, Phase } from './types';

interface DownloadItem {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  accent: string;
  href: string;
  installMethods: {
    title: string;
    commands: string[];
    note?: string;
  }[];
  requirements?: string[];
}

const downloadData: DownloadItem[] = [
  {
    id: 'pyside6',
    name: 'pyislandPyside6',
    tagline: '功能完整 · 稳定可靠',
    badge: '稳定版',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island',
    installMethods: [
      {
        title: 'pip 安装',
        commands: [
          'pip install pyisland-pyside6',
          '# 或使用国内镜像',
          'pip install pyisland-pyside6 -i https://pypi.tuna.tsinghua.edu.cn/simple',
        ],
      },
      {
        title: '源码安装',
        commands: [
          'git clone https://github.com/Python-island/Python-island.git',
          'cd Python-island',
          'pip install -e .',
        ],
      },
      {
        title: '运行',
        commands: [
          'pyisland',
          '# 或',
          'python -m pyisland',
        ],
      },
    ],
    requirements: ['Python 3.11+', 'PySide6', 'requests'],
  },
  {
    id: 'wanku',
    name: 'pyisland-wanku',
    tagline: '高仿真 iOS · 功能丰富',
    badge: '高颜值',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/pyisland-wanku',
    installMethods: [
      {
        title: '克隆分支',
        commands: [
          'git clone -b pyisland-wanku https://github.com/Python-island/Python-island.git',
          'cd pyisland-wanku',
        ],
      },
      {
        title: '安装依赖',
        commands: [
          'pip install -r requirements.txt',
        ],
      },
      {
        title: '运行',
        commands: [
          'python main.py',
        ],
      },
    ],
    requirements: ['Python 3.10+', 'PySide6', 'requests', 'pywin32'],
  },
  {
    id: 'tauri',
    name: 'tauri-island',
    tagline: '性能优先 · Rust 重写',
    badge: '高性能',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/tauri-island',
    installMethods: [
      {
        title: '下载预编译包',
        commands: [
          '# 前往 GitHub Releases 下载最新版本',
          'https://github.com/Python-island/Python-island/releases',
        ],
        note: '支持 Windows x64 安装包',
      },
      {
        title: '源码编译',
        commands: [
          'git clone -b tauri-island https://github.com/Python-island/Python-island.git',
          'cd tauri-island',
          'cargo build --release',
        ],
        note: '需要 Rust 1.70+',
      },
      {
        title: '安装',
        commands: [
          '# Windows MSI 安装包',
          'msiexec /i pyisland-tauri-x.x.x.msi',
        ],
      },
    ],
    requirements: ['Rust 1.70+', 'Node.js 18+ (前端构建)'],
  },
  {
    id: 'pyislandqt',
    name: 'pyislandQT',
    tagline: '轻量高效 · 事件驱动',
    badge: '轻量版',
    badgeColor: '#1D1D1F',
    accent: '#86868B',
    href: 'https://github.com/Python-island/Python-island/tree/pyislandQT',
    installMethods: [
      {
        title: 'pip 安装',
        commands: [
          'pip install pyislandqt',
        ],
      },
      {
        title: '克隆安装',
        commands: [
          'git clone -b pyislandQT https://github.com/Python-island/Python-island.git',
          'cd pyislandQT',
          'pip install -e .',
        ],
      },
      {
        title: '运行',
        commands: [
          'pyisland-qt',
        ],
      },
    ],
    requirements: ['Python 3.10+', 'PyQt5', 'asyncio'],
  },
];

interface DownloadsContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
  onBackToBranches: () => void;
  onForwardToDevelopers: () => void;
}

export default function DownloadsContent({
  progress,
  activeView,
  phase,
  onBackToBranches,
  onForwardToDevelopers,
}: DownloadsContentProps) {
  const isDownloads = activeView === 'downloads';
  const isTransitioning = phase === 'transitioning';

  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;
  const opacity = isDownloads ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isDownloads ? 1 : 0;

  const [selectedBranch, setSelectedBranch] = useState(0);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  const currentData = downloadData[selectedBranch];

  const copyCommand = (cmd: string, lineNum: number) => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedLine(lineNum);
      setTimeout(() => setCopiedLine(null), 1500);
    });
  };

  const getMacTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const period = h < 12 ? '上午' : h < 13 ? '下午' : '晚上';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour}:${m}`;
  };

  const [macTime, setMacTime] = useState(getMacTime);

  useEffect(() => {
    const tick = () => setMacTime(getMacTime());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isDownloads) return;
    const handleWheel = (e: WheelEvent) => {
      if (phase !== 'idle') return;
      e.preventDefault();
      if (e.deltaY > 0) {
        if (selectedBranch < downloadData.length - 1) {
          setSelectedBranch(prev => prev + 1);
        } else {
          onForwardToDevelopers();
        }
      } else {
        if (selectedBranch > 0) {
          setSelectedBranch(prev => prev - 1);
        } else {
          onBackToBranches();
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDownloads, phase, selectedBranch, onBackToBranches, onForwardToDevelopers]);

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
        pointerEvents: isDownloads ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 30%, #2d2d2d 55%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'macBgShift 20s ease infinite',
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
        <img src="/island_w.svg" alt="" style={{ width: '14px', height: '14px', flexShrink: 0, opacity: 0.95 }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', letterSpacing: '0.01em' }}>
          Terminal
        </span>
        {['Shell', '编辑', '显示', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
          {macTime}
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - slideInFactor) * 80}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease',
          marginTop: '0px',
          padding: '40px 24px',
        }}
      >
        {/* Title */}
        <div
          style={{
            marginBottom: 'clamp(20px, 4vh, 32px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            transform: `translateY(${(1 - slideInFactor) * -20}px)`,
            opacity: slideInFactor,
            transition: 'transform 0.7s ease, opacity 0.7s ease',
          }}
        >
          <span
            className={stylesEffect.gradientText}
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: '600', letterSpacing: '-0.02em' }}
          >
            快速安装
          </span>
          <p style={{ fontSize: '14px', color: '#86868B', textAlign: 'center', lineHeight: 1.6 }}>
            选择版本，获取安装命令
          </p>
        </div>

        {/* Version tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            transform: `translateY(${(1 - slideInFactor) * -15}px)`,
            opacity: slideInFactor,
            transition: 'transform 0.7s ease 0.05s, opacity 0.7s ease 0.05s',
          }}
        >
          {downloadData.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSelectedBranch(i)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: selectedBranch === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.10)',
                color: selectedBranch === i ? '#1D1D1F' : 'rgba(255,255,255,0.7)',
                boxShadow: selectedBranch === i ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                transform: selectedBranch === i ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Terminal window */}
        <div
          style={{
            width: '100%',
            background: 'rgba(20, 20, 20, 0.95)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.10)',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            transform: `translateY(${(1 - slideInFactor) * 20}px) scale(${slideInFactor})`,
            opacity: slideInFactor,
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.7s ease 0.1s',
          }}
        >
          {/* Terminal title bar */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(30, 30, 30, 0.8)',
            }}
          >
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            ))}
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              ~ / pyisland / install / {currentData.name}
            </span>
          </div>

          {/* Terminal content */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Branch info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  background: `${currentData.accent}12`,
                  border: `1px solid ${currentData.accent}28`,
                  borderRadius: '20px',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: '700', color: currentData.badgeColor, letterSpacing: '0.05em' }}>
                  {currentData.badge}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                {currentData.tagline}
              </span>
            </div>

            {/* Install methods */}
            {currentData.installMethods.map((method, methodIdx) => (
              <div key={method.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#28C840', fontFamily: 'ui-monospace, monospace' }}>
                    #
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                    {method.title}
                  </span>
                  {method.note && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>
                      {method.note}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {method.commands.map((cmd, cmdIdx) => {
                    const globalLine = currentData.installMethods
                      .slice(0, methodIdx)
                      .reduce((sum, m) => sum + m.commands.length, 0) + cmdIdx + 1;
                    return (
                      <div
                        key={cmdIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 14px',
                          borderBottom: cmdIdx < method.commands.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'ui-monospace, monospace', width: '24px', flexShrink: 0 }}>
                          {globalLine}
                        </span>
                        <code
                          style={{
                            flex: 1,
                            fontSize: '12px',
                            color: cmd.startsWith('#') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {cmd}
                        </code>
                        {!cmd.startsWith('#') && (
                          <button
                            onClick={() => copyCommand(cmd, globalLine)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              border: 'none',
                              background: copiedLine === globalLine
                                ? 'rgba(40, 200, 64, 0.2)'
                                : 'rgba(255,255,255,0.08)',
                              color: copiedLine === globalLine
                                ? '#28C840'
                                : 'rgba(255,255,255,0.5)',
                              transition: 'all 0.2s ease',
                              fontFamily: 'ui-monospace, monospace',
                            }}
                          >
                            {copiedLine === globalLine ? 'copied' : 'copy'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Requirements */}
            {currentData.requirements && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#FEBC2E', fontFamily: 'ui-monospace, monospace' }}>!</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>依赖要求</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentData.requirements.map(req => (
                    <span
                      key={req}
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(254, 188, 46, 0.1)',
                        border: '1px solid rgba(254, 188, 46, 0.2)',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#FEBC2E',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation hint */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            opacity: slideInFactor * 0.6,
            transition: 'transform 0.7s ease 0.2s, opacity 0.7s ease 0.2s',
          }}
        >
          <button
            onClick={onBackToBranches}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            分支总览
          </button>

          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            滚轮切换版本
          </span>

          <button
            onClick={onForwardToDevelopers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            开发者
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
