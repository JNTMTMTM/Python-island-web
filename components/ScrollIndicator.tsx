/**
 * @file ScrollIndicator.tsx
 * @description 滚动指示器组件
 * @description 显示在页面底部，提示用户继续向下滚动或继续探索
 * @description 仅在 hero 和 features 视图下可见，过渡动画淡入淡出
 * @author 鸡哥
 */

'use client';

import type { ViewState } from '@/data/viewState';

/**
 * 滚动指示器组件属性接口
 */
interface ScrollIndicatorProps {
  activeView: ViewState;
}

/**
 * 滚动指示器组件
 * 显示在页面底部，提示用户继续向下滚动
 */
export default function ScrollIndicator({ activeView }: ScrollIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: (activeView === 'hero' || activeView === 'features') ? 1 : 0,
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* 提示文本 */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#A1A1A6',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {activeView === 'features' ? '继续探索' : '向下滚动'}
      </span>
      {/* 装饰线条 */}
      <div
        style={{
          width: '1px',
          height: '48px',
          background: 'linear-gradient(to bottom, rgba(29, 29, 31, 0.2), transparent)',
        }}
      />
    </div>
  );
}
