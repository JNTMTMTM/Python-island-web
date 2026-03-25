'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { SCENE_CONFIG } from '@/lib/three/sceneConfig';
import { createScene, addLights, createIslandGroup, createOuterGlowLayers, createOrbitRings, createFloatingDots, createCoreGlow, createParticles, createMouseTracker, createAnimationState, GlowLayer } from '@/lib/three/createElements';
import { createAnimationLoop, AnimationState, SceneElements, SceneRefs, TransitionState } from '@/lib/three/animate';
import type { ThreeSceneHandle } from '@/lib/three/types';
export type { ThreeSceneHandle } from '@/lib/three/types';

export const ThreeSceneInner = forwardRef<ThreeSceneHandle>(function ThreeSceneInner(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const transitionRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setHover: (active: boolean) => {
      hoverRef.current = active;
    },
    setTransition: (progress: number) => {
      transitionRef.current = progress;
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;

    // Create scene
    const { scene, camera, renderer } = createScene(container);

    // Add lights
    addLights(scene);

    // Create island group with pill and inner glow
    const { group: islandGroup, pill, glow, glowMat } = createIslandGroup();
    scene.add(islandGroup);

    // Create outer glow layers
    const outerGlowLayers: GlowLayer[] = createOuterGlowLayers(islandGroup);

    // Create orbit rings
    const rings: THREE.Mesh[] = createOrbitRings(islandGroup);

    // Create floating dots
    createFloatingDots(islandGroup);

    // Create core glow
    const coreMat: THREE.MeshBasicMaterial = createCoreGlow(islandGroup);

    // Create particles
    const { points: particles, mat: particleMat } = createParticles(scene);

    // Create mouse tracker
    const { mouse, onMouseMove } = createMouseTracker();
    window.addEventListener('mousemove', onMouseMove);

    // Create animation state
    const animationState: AnimationState = createAnimationState();
    const transitionState: TransitionState = { current: 0 };

    // Bundle scene elements
    const elements: SceneElements = {
      islandGroup,
      pill,
      glow,
      glowMat,
      outerGlowLayers,
      rings,
      coreMat,
      particles,
      particleMat,
    };

    // Bundle refs
    const refs: SceneRefs = { mouse, hoverRef, transitionRef, transitionState };

    // Start animation loop
    const cleanup = createAnimationLoop(renderer, scene, camera, elements, refs, animationState);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cleanup();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
});
