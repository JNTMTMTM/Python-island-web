/**
 * @file BranchesContent.tsx
 * @description 分支总览内容组件
 * @description 展示 Pyisland 项目的四个分支版本（PySide6 / 万酷 / Tauri / PyQt5）
 * @description 以四卡片布局呈现，支持滑入动画和毛玻璃效果
 * @author 鸡哥
 */

'use client';

import stylesGlass from '@/styles/glass.module.css';
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';

// 项目分支数据
const branches = [
  {
    id: 'pyside6',
    name: 'pyislandPyside6',
    tagline: '功能完整 · 稳定可靠',
    description: '基于 Python + PySide6 构建的稳定版灵动岛，提供完整的系统控制功能。',
    tech: ['Python 3.11+', 'PySide6', 'QSS'],
    badge: '稳定版',
    badgeColor: '#1D1D1F',
    href: 'https://github.com/Python-island/Python-island',
    accent: '#86868B',
    position: 'top-left' as const,
  },
  {
    id: 'wanku',
    name: 'pyisland-wanku',
    tagline: '高仿真 iOS · 功能丰富',
    description: '追求高仿真 iOS 灵动岛外观，支持录屏、媒体控制和歌词显示。',
    tech: ['Python', 'PySide6', '毛玻璃'],
    badge: '高颜值',
    badgeColor: '#1D1D1F',
    href: 'https://github.com/Python-island/Python-island/tree/pyisland-wanku',
    accent: '#86868B',
    position: 'top-right' as const,
  },
  {
    id: 'tauri',
    name: 'tauri-island',
    tagline: '性能优先 · Rust 重写',
    description: '采用 Tauri 2 + Rust 重写，性能更强，安装包体积更小。',
    tech: ['Rust', 'Tauri 2', 'WebView'],
    badge: '高性能',
    badgeColor: '#1D1D1F',
    href: 'https://github.com/Python-island/Python-island/tree/tauri-island',
    accent: '#86868B',
    position: 'bottom-left' as const,
  },
  {
    id: 'pyislandqt',
    name: 'pyislandQT',
    tagline: '轻量高效 · 事件驱动',
    description: '纯 PyQt5 分支，基于事件总线架构，提供轻量高效的灵动岛体验。',
    tech: ['Python 3.10+', 'PyQt5', 'asyncio'],
    badge: '轻量版',
    badgeColor: '#1D1D1F',
    href: 'https://github.com/Python-island/Python-island/tree/pyislandQT',
    accent: '#86868B',
    position: 'bottom-right' as const,
  },
];

/**
 * 分支卡片组件
 * 显示单个项目分支的信息卡片
 */
function BranchCard({ branch, slideIn }: { branch: typeof branches[number]; slideIn: number }) {
  // 判断卡片是否在左侧
  const isLeft = branch.position.includes('left');

  return (
    <a
      href={branch.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none', cursor: 'pointer' }}
    >
      {/* 卡片容器 */}
      <div
        className={stylesGlass.branchCard}
        style={{
          padding: '18px 20px',
          width: '230px',
          borderRadius: 'var(--radius-lg)',
          transform: `translateX(${(1 - slideIn) * (isLeft ? -30 : 30)}px)`,
          opacity: slideIn,
          transition: `transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, border-radius 0.35s ease`,
          borderColor: 'rgba(0, 0, 0, 0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 顶部装饰线 */}
        <div
          className="branch-card-topline"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${branch.accent}40, transparent)`,
            opacity: 0.5,
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* 徽章标签 */}
        <div
          className="branch-card-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: '20px',
            background: `${branch.accent}15`,
            border: `1px solid ${branch.accent}30`,
            marginBottom: '10px',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: '600', color: branch.badgeColor, letterSpacing: '0.05em' }}>
            {branch.badge}
          </span>
        </div>
        <h4
          className="branch-card-title"
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#1D1D1F',
            marginBottom: '4px',
            letterSpacing: '-0.01em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            transition: 'color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {branch.name}
          <span className="branch-card-arrow" style={{ fontSize: '12px', color: '#86868B' }}>→</span>
        </h4>
        {/* 标语 */}
        <p style={{ fontSize: '11px', color: branch.accent, fontWeight: '500', marginBottom: '8px', letterSpacing: '0.02em' }}>
          {branch.tagline}
        </p>
        {/* 描述文本 */}
        <p style={{ fontSize: '12px', color: '#86868B', lineHeight: 1.5, marginBottom: '12px' }}>
          {branch.description}
        </p>
        {/* 技术标签 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {branch.tech.map(tech => (
            <span
              key={tech}
              style={{
                padding: '2px 7px',
                background: 'rgba(29, 29, 31, 0.04)',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#86868B',
                fontWeight: '500',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
        {/* 外部链接图标 */}
        <div
          className="branch-card-link-icon"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
      </div>
    </a>
  );
}

/**
 * 分支内容组件属性接口
 */
interface BranchesContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
}

export default function BranchesContent({ progress, activeView, phase }: BranchesContentProps) {
  // 判断当前是否为 branches 视图
  const isBranches = activeView === 'branches';
  // 判断是否处于过渡状态
  const isTransitioning = phase === 'transitioning';

  // 滑出效果：branches→develop 或 branches→contributors 过渡期间，branches 应该淡出
  const slideOut = isTransitioning && (activeView === 'develop' || activeView === 'contributors') ? progress : 0;

  // 计算透明度和滑入因子
  const opacity = isBranches ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isBranches ? 1 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        pointerEvents: isBranches ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 左列：2张卡片堆叠 */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: `translateX(calc(-130% - clamp(160px, 22vw, 260px))) translateY(0%) translateX(${(1 - slideInFactor) * -50}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            opacity: slideInFactor,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.05s, opacity 0.8s ease 0.05s',
          }}
        >
          <BranchCard branch={branches[0]} slideIn={slideInFactor} />
          <BranchCard branch={branches[2]} slideIn={slideInFactor} />
        </div>

        {/* 右列：2张卡片堆叠 */}
        <div
          style={{
            position: 'absolute',
            right: '50%',
            transform: `translateX(calc(130% + clamp(160px, 22vw, 260px))) translateY(0%) translateX(${(1 - slideInFactor) * 50}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            opacity: slideInFactor,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.8s ease 0.1s',
          }}
        >
          <BranchCard branch={branches[1]} slideIn={slideInFactor} />
          <BranchCard branch={branches[3]} slideIn={slideInFactor} />
        </div>

        {/* 底部提示 */}
        <div
          style={{
            position: 'absolute',
            bottom: '6vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            transform: `translateY(${(1 - slideInFactor) * 20}px)`,
            opacity: slideInFactor * 0.6,
            transition: 'transform 0.8s ease 0.3s, opacity 0.8s ease 0.3s',
          }}
        >
          <span style={{ fontSize: '11px', color: '#A1A1A6', letterSpacing: '0.05em' }}>
            点击卡片访问 GitHub 仓库
          </span>
        </div>
      </div>
    </div>
  );
}
