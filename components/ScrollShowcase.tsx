'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { ThreeSceneHandle } from './ThreeScene';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import FeaturesContent from './FeaturesContent';
import BackButton from './BackButton';
import BranchesContent from './BranchesContent';

const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle> }>;

type ViewState = 'hero' | 'features' | 'branches';

const VIEW_TARGET: Record<ViewState, number> = {
  hero: 0,
  features: 0.5,
  branches: 1,
};

const DURATION = 800;

/**
 * Phase tracks where we are in the transition lifecycle:
 * - idle + view = fully settled in that view
 * - transitioning = animating toward targetView, content should show targetView
 */
type Phase = 'idle' | 'transitioning';
interface PhaseState {
  phase: Phase;
  targetView: ViewState;
}

interface ScrollShowcaseProps {
  children?: ReactNode;
}

export default function ScrollShowcase({ children }: ScrollShowcaseProps) {
  /** Stable view after animation completes */
  const [view, setView] = useState<ViewState>('hero');
  /** Phase + target during transition */
  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: 'idle', targetView: 'hero' });
  /** Local progress 0→1 for CSS animations */
  const [progress, setProgress] = useState(1);

  const threeRef = useRef<ThreeSceneHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  /** Computed: active view during or after animation */
  const activeView = phaseState.phase === 'idle' ? view : phaseState.targetView;

  const handleTransition = useCallback((direction: 'down' | 'up') => {
    if (isTransitioning.current) return;

    const nextViewMap: Record<ViewState, ViewState | null> = {
      hero: direction === 'down' ? 'features' : null,
      features: direction === 'down' ? 'branches' : 'hero',
      branches: direction === 'up' ? 'features' : null,
    };

    const nextView = nextViewMap[view];
    if (!nextView) return;

    isTransitioning.current = true;
    const fromTarget = VIEW_TARGET[view];
    const toTarget = VIEW_TARGET[nextView];

    // Immediately signal Three.js the destination
    threeRef.current?.setViewTarget(toTarget);

    // Begin transition — content should now show targetView
    setPhaseState({ phase: 'transitioning', targetView: nextView });
    setProgress(0);

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      // easedProgress drives rotation speed — same easing curve as React animation
      const easedProgress = fromTarget + (toTarget - fromTarget) * eased;
      threeRef.current?.setTransition(easedProgress);
      setProgress(eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete — settle into the new view
        setView(nextView);
        setPhaseState({ phase: 'idle', targetView: nextView });
        setProgress(1);
        threeRef.current?.setTransition(toTarget);
        isTransitioning.current = false;
      }
    };
    requestAnimationFrame(animate);
  }, [view]);

  // URL hash sync
  useEffect(() => {
    const hash = `#${activeView}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', window.location.pathname + hash);
      window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
    }
  }, [activeView]);

  // Navigation events from DynamicIsland nav
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const hash = (e as CustomEvent<{ hash: string }>).detail.hash;
      const target = hash.replace('#', '') as ViewState;

      if (target === activeView || !VIEW_TARGET[target]) return;

      if (VIEW_TARGET[target] > VIEW_TARGET[activeView]) {
        // Need to go down — may require multiple steps
        if (activeView === 'hero' && target === 'branches') {
          threeRef.current?.setViewTarget(0.5);
          handleTransition('down');
          setTimeout(() => handleTransition('down'), DURATION + 60);
        } else {
          handleTransition('down');
        }
      } else {
        // Need to go up — may require multiple steps
        if (activeView === 'branches' && target === 'hero') {
          handleTransition('up');
          setTimeout(() => handleTransition('up'), DURATION + 60);
        } else {
          handleTransition('up');
        }
      }
    };

    window.addEventListener('pyisland:navigate', handleNavigate);
    return () => window.removeEventListener('pyisland:navigate', handleNavigate);
  }, [activeView, handleTransition]);

  // Wheel scroll
  useEffect(() => {
    let accumulator = 0;
    let timer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulator += e.deltaY;

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (Math.abs(accumulator) > 80) {
          if (accumulator > 0) handleTransition('down');
          else handleTransition('up');
        }
        accumulator = 0;
      }, 50);
    };

    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
      clearTimeout(timer);
    };
  }, [handleTransition]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#FFFFFF',
        userSelect: 'none',
      }}
    >
      {/* Background gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(245, 245, 247, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Three.js Canvas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2 }}>
        <ThreeScene ref={threeRef} />
      </div>

      {/* Hero */}
      <HeroContent
        threeRef={threeRef}
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* Scroll indicator — only in hero */}
      <ScrollIndicator activeView={activeView} />

      {/* Features */}
      <FeaturesContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* Branches */}
      <BranchesContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
      />

      {/* Back button */}
      {activeView === 'branches' && (
        <BackButton onClick={() => handleTransition('up')} label="返回功能" />
      )}
    </div>
  );
}
