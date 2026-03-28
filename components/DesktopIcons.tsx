/**
 * @file DesktopIcons.tsx
 * @description 桌面图标组件
 * @description macOS 风格的左侧边栏桌面图标（开发指南 / 贡献者 / 立即下载）
 * @description 支持悬停放大、点击导航、弹跳动画和图标光泽高亮效果
 * @author 鸡哥
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import type { ViewState } from '@/data/viewState';
import styles from '@/styles/appIcons.module.css';

/**
 * 应用图标接口
 * 定义桌面图标的属性
 */
interface AppIcon {
  id: string;
  label: string;
  target: ViewState;
  icon: React.ReactNode;
  bg: string;
  bgBorder: string;
  accent: string;
}

/**
 * 桌面图标组件属性接口
 */
interface DesktopIconsProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

// 桌面应用图标数据
const APPS: AppIcon[] = [
  {
    id: 'develop',
    label: '开发指南',
    target: 'develop',
    bg: 'linear-gradient(145deg, #2a2a2a 0%, #181818 100%)',
    bgBorder: 'rgba(255,255,255,0.25)',
    accent: '#ffffff',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        <path d="M8 8h8M8 12h6M8 16h8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="17" r="2" fill="rgba(255,255,255,0.7)"/>
      </svg>
    ),
  },
  {
    id: 'contributors',
    label: '贡献者',
    target: 'contributors',
    bg: 'linear-gradient(145deg, #2a2a2a 0%, #181818 100%)',
    bgBorder: 'rgba(255,255,255,0.25)',
    accent: '#ffffff',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        <circle cx="17" cy="7" r="2.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
        <path d="M2 19c0-4 3.5-6 7-6s7 2 7 6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 19c0-3 2-4.5 3-4.5s3 1.5 3 4.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'download',
    label: '立即下载',
    target: 'download',
    bg: 'linear-gradient(145deg, #2a2a2a 0%, #181818 100%)',
    bgBorder: 'rgba(255,255,255,0.25)',
    accent: '#ffffff',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v13m0 0-5-5m5 5 5-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/**
 * 桌面图标组件
 * macOS 风格的桌面图标，支持悬停、点击和弹跳动画
 */
export default function DesktopIcons({ activeView, onNavigate }: DesktopIconsProps) {
  // 当前悬停的图标索引
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // 当前正在弹跳的图标 ID
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  // 弹跳动画 key，用于重新触发动画
  const [bounceKey, setBounceKey] = useState<number>(0);
  // 定时器引用，用于清除弹跳状态
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 处理图标点击事件
   * 如果已处于目标视图且为开发指南，触发弹跳动画
   * 否则导航到目标视图
   */
  const handleClick = useCallback((app: AppIcon) => {
    if (activeView === app.target) {
      if (app.id === 'develop') {
        if (timerRef.current) clearTimeout(timerRef.current);
        setBouncingId(app.id);
        setBounceKey(prev => prev + 1);
        timerRef.current = setTimeout(() => setBouncingId(null), 600);
      }
    } else {
      onNavigate(app.target);
    }
  }, [activeView, onNavigate]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '28px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'auto',
      }}
    >
      {APPS.map((app, i) => {
        const isActive = activeView === app.target;
        const isHovered = hoveredIdx === i;
        const isBouncing = bouncingId === app.id;

        return (
          <div
            key={app.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              filter: isActive ? 'none' : 'opacity(0.55)',
              transition: 'filter 0.2s ease',
            }}
            onClick={() => handleClick(app)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            title={app.label}
          >
            {/* App icon — macOS desktop icon style */}
            <div
              key={isBouncing ? `bounce-${app.id}-${bounceKey}` : 'idle'}
              className={isBouncing ? styles.bounce : undefined}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: app.bg,
                border: `2px solid ${isActive ? app.bgBorder : 'rgba(255,255,255,0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive
                  ? `0 0 16px rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.35)`
                  : isHovered
                  ? '0 6px 20px rgba(0,0,0,0.4)'
                  : '0 4px 12px rgba(0,0,0,0.3)',
                transform: isHovered && !isBouncing ? 'scale(1.08)' : 'scale(1)',
                transition: isBouncing ? 'none' : 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
          >
            {/* 光泽高光效果 */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />
              {app.icon}
            </div>
            {/* 图标标签 — macOS 风格，位于图标下方 */}
            <span style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '500',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textShadow: '0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.4)',
              maxWidth: '72px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {app.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
