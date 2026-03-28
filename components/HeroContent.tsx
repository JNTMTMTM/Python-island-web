/**
 * @file HeroContent.tsx
 * @description 首页主要展示区域内容组件
 * @description 首页 Hero 区域，包含副标题、主标题、描述文案和操作按钮
 * @description 支持入场交错动画（副标题→标题→描述→按钮）和鼠标悬停交互
 * @author 鸡哥
 */

'use client';

import { Download, Github } from 'lucide-react';
import stylesButton from '@/styles/button.module.css';
import stylesTypography from '@/styles/typography.module.css';
import stylesEffect from '@/styles/effect.module.css';
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';

/**
 * Hero 区域内容组件
 * 首页主要展示区域，包含标题、描述和操作按钮
 */
interface HeroContentProps {
  threeRef: { current: { setHover: (val: boolean) => void } | null };
  progress: number;
  activeView: ViewState;
  phase: Phase;
}

export default function HeroContent({ threeRef, progress, activeView, phase }: HeroContentProps) {
  // 判断当前是否为 hero 视图
  const isHero = activeView === 'hero';

  // 滑出效果：hero→features 过渡期间（progress 0→1），hero 应该淡出/滑出
  const slideOut = phase === 'transitioning' && activeView !== 'hero' ? progress : 0;
  // 滑入效果：features→hero 过渡期间，hero 出现并向上滑入
  const slideIn = isHero && phase === 'transitioning' ? progress : 1;

  // 计算透明度和垂直位移
  const opacity = isHero ? Math.max(0, 1 - slideOut) * slideIn : 0;
  const translateY = isHero ? -slideOut * 80 + (1 - slideIn) * 50 : 0;

  return (
    <div
      id="hero"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        pointerEvents: isHero ? 'auto' : 'none',
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '680px',
          padding: '0 clamp(20px, 5vw, 60px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* 副标题 */}
        <span
          className={isHero ? stylesEffect.heroSubtitleAnim : ''}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: ' #86868B',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            opacity: isHero ? undefined : 0,
          }}
        >
          Windows Dynamic Island
        </span>

        {/* 主标题 */}
        <h1
          className={`${stylesTypography.textHero} ${stylesEffect.gradientText} ${isHero ? stylesEffect.heroTitleAnim : ''}`}
          style={{ letterSpacing: '-0.02em', opacity: isHero ? undefined : 0 }}
        >
          Pyisland
        </h1>

        {/* 描述文本 */}
        <p
          className={isHero ? stylesEffect.heroDescAnim : ''}
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: 'rgb(89, 89, 92)',
            lineHeight: 1.6,
            maxWidth: '440px',
            fontWeight: 400,
            opacity: isHero ? undefined : 0,
          }}
        >
          Windows 灵动岛新时代 — 打造现代控制中心
        </p>

        {/* 操作按钮 */}
        <div
          className={isHero ? stylesEffect.heroButtonsAnim : ''}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '8px',
            opacity: isHero ? undefined : 0,
          }}
        >
          {/* 下载按钮 */}
          <a
            href="/#download"
            className={stylesButton.btnSecondary}
            onMouseEnter={() => threeRef.current?.setHover(true)}
            onMouseLeave={() => threeRef.current?.setHover(false)}
          >
            <Download size={16} />
            立即下载
          </a>
          {/* 文档按钮 */}
          <a
            href="https://docs.pyisland.com"
            className={stylesButton.btnPrimary}
            onMouseEnter={() => threeRef.current?.setHover(true)}
            onMouseLeave={() => threeRef.current?.setHover(false)}
          >
            <Github size={16} />
            开发文档
          </a>
        </div>
      </div>
    </div>
  );
}
