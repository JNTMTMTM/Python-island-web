/**
 * @file DevelopContent.tsx
 * @description 开发指南内容组件
 * @description 展示各个分支的安装命令和依赖信息，模拟 macOS 终端界面
 * @description 支持滚轮切换分支、命令行复制、终端内容高度自适应等功能
 * @author 鸡哥
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ViewState } from '@/data/viewState';
import type { Phase } from '@/data/phase';
import { developData } from '../data/developData';
import DesktopIcons from './DesktopIcons';

// 开发内容组件的属性接口
interface DevelopContentProps {
  progress: number; // 过渡进度值
  activeView: ViewState; // 当前激活的视图状态
  phase: Phase; // 当前动画阶段
  onBackToBranches: () => void; // 返回分支总览的回调函数
  onForwardToContributors: () => void; // 前进到贡献者的回调函数
  onNavigate: (view: ViewState) => void; // 导航到指定视图的回调函数
}

// 开发内容组件：显示各个分支的安装命令和依赖信息
export default function DevelopContent({
  progress,
  activeView,
  phase,
  onBackToBranches,
  onForwardToContributors,
  onNavigate,
}: DevelopContentProps) {
  // 判断当前是否为开发视图
  const isDevelop = activeView === 'develop';
  // 判断当前是否处于过渡阶段
  const isTransitioning = phase === 'transitioning';

  // 计算滑出动画的进度
  const slideOut = isTransitioning && activeView === 'branches' ? progress : 0;
  // 根据滑出进度计算透明度
  const opacity = isDevelop ? Math.max(0, 1 - slideOut) : 0;
  // 滑入动画因子，控制内容显示
  const slideInFactor = isDevelop ? 1 : 0;

  // 用户选择的分支索引
  const [selectedBranch, setSelectedBranch] = useState(0);
  // 实际显示的分支索引（用于动画过渡）
  const [displayBranch, setDisplayBranch] = useState(0);
  // 分支内容是否可见（用于切换动画）
  const [branchVisible, setBranchVisible] = useState(true);
  // 当前复制的命令行号
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  // 终端内容的高度
  const [terminalContentHeight, setTerminalContentHeight] = useState(0);
  // 终端卡片是否被悬停
  const [cardHovered, setCardHovered] = useState(false);
  // 用于测量终端内容高度的引用
  const contentMeasuredRef = useRef<HTMLDivElement>(null);

  // 获取当前显示的分支数据
  const currentData = developData[displayBranch];

  // 测量内容的固有高度（scrollHeight不受maxHeight影响）
  const measureHeight = useCallback((): number | null => {
    const el = contentMeasuredRef.current;
    if (!el) return null;
    // 临时显示内容以获取准确的scrollHeight
    el.style.overflow = 'visible';
    el.style.visibility = 'hidden';
    const h = el.scrollHeight;
    el.style.overflow = '';
    el.style.visibility = '';
    return h;
  }, []);

  // 当内容变化时通过ResizeObserver重新测量高度
  const handleResize = useCallback(() => {
    const h = measureHeight();
    if (h !== null && h > 0) {
      setTerminalContentHeight(h);
    }
  }, [measureHeight]);

  // 设置ResizeObserver监听内容大小变化
  useEffect(() => {
    const el = contentMeasuredRef.current;
    if (!el) return;
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [handleResize]);

  // 进入开发视图时：在绘制后立即测量高度
  useEffect(() => {
    if (!isDevelop) return;
    requestAnimationFrame(() => {
      const h = measureHeight();
      if (h !== null && h > 0) {
        setTerminalContentHeight(h);
      }
    });
  }, [isDevelop, measureHeight]);

  // 两阶段切换分支：淡出 → 切换分支 → 测量新高度 → 淡入
  useEffect(() => {
    if (selectedBranch === displayBranch) return;
    setBranchVisible(false);
    const t1 = setTimeout(() => {
      setDisplayBranch(selectedBranch);
      const t2 = setTimeout(() => {
        const h = measureHeight();
        setTerminalContentHeight(h !== null && h > 0 ? h : 300);
        setBranchVisible(true);
        setCopiedLine(null);
      }, 60);
      return () => clearTimeout(t2);
    }, 180);
    return () => clearTimeout(t1);
  }, [selectedBranch, displayBranch, measureHeight]);

  // 复制命令到剪贴板
  const copyCommand = (cmd: string, lineNum: number) => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedLine(lineNum);
      setTimeout(() => setCopiedLine(null), 1500);
    });
  };

  // 获取macOS风格的当前时间显示
  const getMacTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    // 根据小时判断时段：早上/中午/晚上
    const period = h >= 5 && h < 12 ? '早上' : h >= 12 && h < 18 ? '中午' : '晚上';
    const displayHour = h.toString().padStart(2, '0');
    return `${period} ${displayHour}:${m}`;
  };

  // macOS时间状态
  const [macTime, setMacTime] = useState(getMacTime);

  // 每秒更新macOS时间
  useEffect(() => {
    const tick = () => setMacTime(getMacTime());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // 监听滚轮事件，在不同分支之间切换
  useEffect(() => {
    if (!isDevelop) return;
    const handleWheel = (e: WheelEvent) => {
      // 非空闲状态下不响应滚轮
      if (phase !== 'idle') return;
      e.preventDefault();
      if (e.deltaY > 0) {
        // 向下滚动：切换到下一个分支或前进到贡献者
        if (selectedBranch < developData.length - 1) {
          const next = selectedBranch + 1;
          setSelectedBranch(next);
          window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: next }));
        } else {
          onForwardToContributors();
        }
      } else {
        // 向上滚动：切换到上一个分支或返回分支总览
        if (selectedBranch > 0) {
          const prev = selectedBranch - 1;
          setSelectedBranch(prev);
          window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: prev }));
        } else {
          onBackToBranches();
        }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDevelop, phase, selectedBranch, onBackToBranches, onForwardToContributors]);

  // 监听从Dynamic Island发起的分支切换事件
  useEffect(() => {
    const handleIslandSwitch = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (idx !== selectedBranch && idx >= 0 && idx < developData.length) {
        setSelectedBranch(idx);
      }
    };
    window.addEventListener('pyisland:island-branch-select', handleIslandSwitch);
    return () => window.removeEventListener('pyisland:island-branch-select', handleIslandSwitch);
  }, [selectedBranch]);

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
        pointerEvents: isDevelop ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 4,
        // macOS风格的深色渐变背景
        background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 30%, #2d2d2d 55%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'macBgShift 20s ease infinite',
        overflow: 'hidden',
        paddingTop: '140px',
      }}
    >
      {/* macOS菜单栏 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          // 玻璃拟态效果
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
        {/* 应用图标 */}
        <img src="/island_w.svg" alt="" style={{ width: '14px', height: '14px', flexShrink: 0, opacity: 0.95 }} />
        {/* 应用名称 */}
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', letterSpacing: '0.01em' }}>
          Terminal
        </span>
        {/* 菜单项 */}
        {['Shell', '编辑', '显示', '窗口', '帮助'].map(item => (
          <span key={item} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {item}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        {/* 音量图标 */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.85)">
          <path d="M1 4C1 2.9 1.9 2 3 2h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4zm0-1L0 3v4l1-1h12l1 1V3l-1 0H1z" />
          <path d="M4 5h6M4 7h3" stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none" />
        </svg>
        {/* 下拉箭头 */}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>▼</span>
        {/* 缩放比例 */}
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>100%</span>
        {/* macOS时间 */}
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}>
          {macTime}
        </span>
      </div>

      {/* 主内容区域 */}
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
        {/* 终端窗口 */}
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          style={{
            width: '100%',
            background: 'rgba(20, 20, 20, 0.95)',
            borderRadius: '12px',
            // 悬停时边框更明显
            border: `1px solid rgba(255,255,255,${cardHovered ? 0.18 : 0.10})`,
            overflow: 'hidden',
            // 悬停时阴影效果更强
            boxShadow: cardHovered
              ? '0 16px 64px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.25)'
              : '0 24px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)',
            // 悬停时轻微上浮和放大
            transform: cardHovered
              ? 'translateY(-6px) scale(1.015)'
              : `translateY(${(1 - slideInFactor) * 20}px) scale(${slideInFactor})`,
            opacity: slideInFactor,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease 0.1s, box-shadow 0.4s ease, border-color 0.3s ease',
          }}
        >
          {/* 终端标题栏 */}
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
            {/* 红黄绿三色窗口控制按钮 */}
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
            ))}
            {/* 窗口标题 */}
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

          {/* 终端内容区域 - 分支切换时有淡入淡出和高度动画 */}
          <div
            style={{
              maxHeight: branchVisible ? `${terminalContentHeight}px` : '0px',
              overflow: 'hidden',
              transition: branchVisible
                ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'max-height 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* 终端内容包裹层 - 用于测量高度 */}
            <div
              ref={contentMeasuredRef}
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                opacity: branchVisible ? 1 : 0,
                transform: branchVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                transition: branchVisible
                  ? 'opacity 0.2s ease 0.15s, transform 0.2s ease 0.15s'
                  : 'opacity 0.15s ease, transform 0.15s ease',
              }}
            >
            {/* 分支信息展示 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              {/* 分支标签 */}
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
                <span style={{ fontSize: '10px', fontWeight: '600', color: `${currentData.accent}cc`, letterSpacing: '0.03em' }}>
                  {currentData.name}
                </span>
              </div>
              {/* 分支标语 */}
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                {currentData.tagline}
              </span>
            </div>

            {/* 安装方法列表 */}
            {currentData.installMethods.map((method, methodIdx) => (
              <div key={method.title}>
                {/* 方法标题 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#28C840', fontFamily: 'ui-monospace, monospace' }}>
                    #
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
                    {method.title}
                  </span>
                  {/* 方法说明 */}
                  {method.note && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginLeft: '4px' }}>
                      {method.note}
                    </span>
                  )}
                </div>
                {/* 命令代码块 */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {method.commands.map((cmd, cmdIdx) => {
                    // 计算全局行号
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
                        {/* 行号 */}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'ui-monospace, monospace', width: '24px', flexShrink: 0 }}>
                          {globalLine}
                        </span>
                        {/* 命令内容 */}
                        <code
                          style={{
                            flex: 1,
                            fontSize: '12px',
                            // 注释行颜色较浅
                            color: cmd.startsWith('#') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {cmd}
                        </code>
                        {/* 复制按钮 - 注释行不显示 */}
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
                              // 复制成功后显示绿色
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

            {/* 依赖要求 */}
            {currentData.requirements && (
              <div style={{ marginTop: '8px' }}>
                {/* 标题 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#FEBC2E', fontFamily: 'ui-monospace, monospace' }}>!</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>依赖要求</span>
                </div>
                {/* 依赖标签列表 */}
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
        </div>

        {/* 分支导航点 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
            opacity: slideInFactor,
            transform: `translateY(${(1 - slideInFactor) * 10}px)`,
            transition: 'transform 0.7s ease 0.15s, opacity 0.7s ease 0.15s',
          }}
        >
          {developData.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setSelectedBranch(i); window.dispatchEvent(new CustomEvent('pyisland:branch-select', { detail: i })); }}
              title={item.name}
              style={{
                // 当前选中的分支显示为长条
                width: i === displayBranch ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === displayBranch
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.25)',
                // 选中的点有发光效果
                boxShadow: i === displayBranch ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                padding: 0,
              }}
              onMouseEnter={e => {
                // 悬停时非选中点稍微变长
                if (i !== displayBranch) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.width = '12px';
                }
              }}
              onMouseLeave={e => {
                if (i !== displayBranch) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.width = '8px';
                }
              }}
            />
          ))}
        </div>

        {/* 导航提示按钮 */}
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
          {/* 返回分支总览按钮 */}
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

          {/* 中间提示文字 */}
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            滚轮切换版本
          </span>

          {/* 前进到贡献者按钮 */}
          <button
            onClick={onForwardToContributors}
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
            贡献者
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* macOS桌面图标 */}
      <DesktopIcons activeView={activeView} onNavigate={onNavigate} />
    </div>
  );
}
