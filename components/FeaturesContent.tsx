/**
 * @file FeaturesContent.tsx
 * @description 功能特性内容组件
 * @description 展示 Pyisland 的六大核心功能（智能展开 / 亮度 / 音量 / 状态监控 / 剪贴板 / 拖动）
 * @description 以双列卡片布局呈现，支持滑入动画和悬停光效扫过效果
 * @author 鸡哥
 */

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
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';

// 功能特性卡片数据
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

/**
 * 功能特性卡片组件
 * 显示单个功能特性，支持滑入动画
 */
function FeatureCard({ icon: Icon, title, description, slideIn, delay }: {
  icon: typeof MousePointerClick;
  title: string;
  description: string;
  slideIn: number;
  delay: number;
}) {
  // 计算卡片透明度和过渡延迟
  const cardOpacity = slideIn;
  const transitionDelay = `${Math.min(delay, 2) * 80}ms`;

  return (
    <div
      className={`${stylesGlass.glassCard} ${stylesGlass.glassCardHover}`}
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        opacity: cardOpacity,
        transform: `translateY(${(1 - slideIn) * 20}px)`,
        transition: `opacity 1s ease ${transitionDelay}, transform 0.7s ease ${transitionDelay}, background 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* 顶部装饰线 */}
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
      {/* 图标容器 */}
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
      {/* 标题 */}
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
      {/* 描述文本 */}
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

/**
 * 功能特性内容组件
 * 在 features 视图中展示所有功能特性卡片
 */
interface FeaturesContentProps {
  progress: number;
  activeView: ViewState;
  phase: Phase;
}

export default function FeaturesContent({ progress, activeView, phase }: FeaturesContentProps) {
  // 判断当前是否为 features 视图
  const isFeatures = activeView === 'features';
  // 判断是否处于过渡状态
  const isTransitioning = phase === 'transitioning';

  // 滑出因子：features→branches 过渡期间（progress 0→1），features 应该淡出/滑出
  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;

  // 计算透明度和滑入因子
  const opacity = isFeatures ? Math.max(0, 1 - slideOut) : 0;
  const slideInFactor = isFeatures ? 1 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: isFeatures ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
      }}
    >
      {/* 左列：3张卡片堆叠 */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 10vw, 120px)',
          top: '50%',
          transform: `translateY(-50%) translateX(${(1 - slideInFactor) * -40}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '260px',
        }}
      >
        {features.slice(0, 3).map((feature, i) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            slideIn={slideInFactor}
            delay={i}
          />
        ))}
      </div>

      {/* 右列：3张卡片堆叠 */}
      <div
        style={{
          position: 'absolute',
          right: 'clamp(20px, 10vw, 120px)',
          top: '50%',
          transform: `translateY(-50%) translateX(${(1 - slideInFactor) * 40}px)`,
          opacity: slideInFactor,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '260px',
        }}
      >
        {features.slice(3, 6).map((feature, i) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            slideIn={slideInFactor}
            delay={i}
          />
        ))}
      </div>
    </div>
  );
}
