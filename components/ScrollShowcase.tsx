'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { ThreeSceneHandle } from './ThreeScene';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import FeaturesContent from './FeaturesContent';
import BackButton from './BackButton';

const ThreeScene = dynamic(
  () => import('./ThreeScene').then(m => m.ThreeSceneInner),
  { ssr: false }
) as ComponentType<{ ref?: React.Ref<ThreeSceneHandle> }>;

type ViewState = 'hero' | 'features';

interface ScrollShowcaseProps {
  children?: ReactNode;
}

export default function ScrollShowcase({ children }: ScrollShowcaseProps) {
  const [view, setView] = useState<ViewState>('hero');
  const [transitionProgress, setTransitionProgress] = useState(0);
  const threeRef = useRef<ThreeSceneHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const wheelAccumulator = useRef(0);

  const handleTransition = useCallback((direction: 'down' | 'up') => {
    if (isTransitioning.current) return;

    if (direction === 'down' && view === 'hero') {
      isTransitioning.current = true;
      setView('features');

      let start: number | null = null;
      const duration = 800;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setTransitionProgress(eased);
        threeRef.current?.setTransition(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isTransitioning.current = false;
        }
      };
      requestAnimationFrame(animate);

    } else if (direction === 'up' && view === 'features') {
      isTransitioning.current = true;

      let start: number | null = null;
      const duration = 800;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setTransitionProgress(1 - eased);
        threeRef.current?.setTransition(1 - eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setView('hero');
          isTransitioning.current = false;
        }
      };
      requestAnimationFrame(animate);
    }
  }, [view]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      wheelAccumulator.current += e.deltaY;

      if (Math.abs(wheelAccumulator.current) > 80) {
        if (wheelAccumulator.current > 0) {
          handleTransition('down');
        } else {
          handleTransition('up');
        }
        wheelAccumulator.current = 0;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleTransition]);

  const isFeaturesView = transitionProgress > 0;

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
      {/* Layer 1: Subtle gradient background */}
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

      {/* Layer 2: 3D Canvas - full screen background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
        }}
      >
        <ThreeScene ref={threeRef} />
      </div>

      {/* Layer 3: Hero Content */}
      <HeroContent threeRef={threeRef} transitionProgress={transitionProgress} view={view} />

      {/* Scroll Indicator */}
      <ScrollIndicator transitionProgress={transitionProgress} />

      {/* Features Content */}
      <FeaturesContent transitionProgress={transitionProgress} />

      {/* Back to top indicator in features view */}
      {isFeaturesView && <BackButton onClick={() => handleTransition('up')} />}
    </div>
  );
}
