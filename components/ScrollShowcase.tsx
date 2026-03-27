'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { ThreeSceneHandle } from './ThreeScene';
import type { ViewState, Phase } from './types';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import FeaturesContent from './FeaturesContent';
import BranchesContent from './BranchesContent';
import DownloadsContent from './DownloadsContent';
import DeveloperContent from './DeveloperContent';

const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle> }>;

const VIEW_TARGET: Record<ViewState, number> = {
  hero: 0,
  features: 0.33,
  branches: 0.55,
  downloads: 0.78,
  developers: 1,
};

const DURATION = 800;

interface PhaseState {
  phase: Phase;
  targetView: ViewState;
}

interface ScrollShowcaseProps {
  children?: ReactNode;
  initialView?: ViewState;
}

export default function ScrollShowcase({ children, initialView = 'hero' }: ScrollShowcaseProps) {
  /** Stable view after animation completes */
  const [view, setView] = useState<ViewState>(initialView);
  /** Phase + target during transition */
  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: 'idle', targetView: initialView });
  /** Local progress 0→1 for CSS animations */
  const [progress, setProgress] = useState(initialView === 'hero' ? 1 : 1);
  /** Current developer index in the dock (0-4) */
  const [currentDev, setCurrentDev] = useState(0);

  const threeRef = useRef<ThreeSceneHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const transitionRafRef = useRef<number | null>(null);

  /** Computed: active view during or after animation */
  const activeView = phaseState.phase === 'idle' ? view : phaseState.targetView;

  const handleTransition = useCallback((direction: 'down' | 'up') => {
    if (isTransitioning.current) return;

    const nextViewMap: Record<ViewState, ViewState | null> = {
      hero: direction === 'down' ? 'features' : null,
      features: direction === 'down' ? 'branches' : 'hero',
      branches: direction === 'down' ? 'downloads' : 'features',
      downloads: direction === 'down' ? 'developers' : 'branches',
      developers: direction === 'up' ? 'downloads' : null,
    };

    const nextView = nextViewMap[view];
    if (!nextView) return;

    if (transitionRafRef.current !== null) {
      cancelAnimationFrame(transitionRafRef.current);
      transitionRafRef.current = null;
    }
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
        transitionRafRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete — settle into the new view
        setView(nextView);
        setPhaseState({ phase: 'idle', targetView: nextView });
        setProgress(1);
        threeRef.current?.setTransition(toTarget);
        isTransitioning.current = false;
        transitionRafRef.current = null;
      }
    };
    transitionRafRef.current = requestAnimationFrame(animate);
  }, [view]);

  // URL hash sync
  useEffect(() => {
    const hash = `#${activeView}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', window.location.pathname + hash);
      window.dispatchEvent(new CustomEvent('pyisland:navigate', { detail: { hash } }));
    }
  }, [activeView]);

  // Initialize Three.js to initialView on mount
  useEffect(() => {
    if (initialView !== 'hero' && threeRef.current) {
      const target = VIEW_TARGET[initialView];
      threeRef.current.setViewTarget(target);
      threeRef.current.setTransition(target);
    }
  }, []); // run once on mount

  // Direct cross-page navigation — handles any target jump
  const navigateTo = useCallback((target: ViewState) => {
    if (VIEW_TARGET[target] === undefined) return;

    if (transitionRafRef.current !== null) {
      cancelAnimationFrame(transitionRafRef.current);
      transitionRafRef.current = null;
    }
    isTransitioning.current = true;

    const fromTarget = VIEW_TARGET[view];
    const toTarget = VIEW_TARGET[target];

    threeRef.current?.setViewTarget(toTarget);
    setPhaseState({ phase: 'transitioning', targetView: target });
    setProgress(0);

    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      const easedProgress = fromTarget + (toTarget - fromTarget) * eased;
      threeRef.current?.setTransition(easedProgress);
      setProgress(eased);

      window.dispatchEvent(new CustomEvent('pyisland:transition-progress', {
        detail: { progress: eased, target },
      }));

      if (t < 1) {
        transitionRafRef.current = requestAnimationFrame(animate);
      } else {
        setView(target);
        setPhaseState({ phase: 'idle', targetView: target });
        setProgress(1);
        threeRef.current?.setTransition(toTarget);
        window.dispatchEvent(new CustomEvent('pyisland:transition-progress', {
          detail: { progress: 1, target },
        }));
        isTransitioning.current = false;
        transitionRafRef.current = null;
      }
    };
    transitionRafRef.current = requestAnimationFrame(animate);
  }, [view]);

  // Navigation events from DynamicIsland nav
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const hash = (e as CustomEvent<{ hash: string }>).detail.hash;
      const target = hash.replace('#', '') as ViewState;
      navigateTo(target);
    };

    window.addEventListener('pyisland:navigate', handleNavigate);
    return () => window.removeEventListener('pyisland:navigate', handleNavigate);
  }, [navigateTo]);

  // Switch to a specific developer and show the developers view
  const switchToDeveloper = useCallback((index: number) => {
    setCurrentDev(index);
    if (view !== 'developers') {
      navigateTo('developers');
    }
  }, [view, navigateTo]);

  // Wheel scroll
  useEffect(() => {
    let accumulator = 0;
    let timer: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      // Don't intercept wheel when in developers or downloads view — they handle their own wheel
      if (view === 'developers' || view === 'downloads') return;
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

      {/* Downloads */}
      <DownloadsContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
        onBackToBranches={() => navigateTo('branches')}
        onForwardToDevelopers={() => navigateTo('developers')}
      />

      {/* Back button */}

      {/* Developers */}
      <DeveloperContent
        progress={progress}
        activeView={activeView}
        phase={phaseState.phase}
        currentDev={currentDev}
        onSwitchDev={switchToDeveloper}
        onBackToDownloads={() => navigateTo('downloads')}
      />
    </div>
  );
}
