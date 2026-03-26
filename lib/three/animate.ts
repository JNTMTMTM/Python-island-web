// Animation logic for Three.js scene

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';
import { GlowLayer } from './createElements';
import {
  getBaseHue,
  getBreathFactor,
  getNeutralGlowColor,
  getRainbowGlowColor,
  lerp,
  lerpColor,
} from './effects';

export interface AnimationState {
  hoverState: { active: boolean; current: number };
  rainbowState: { target: number; current: number };
}

export interface TransitionState {
  current: number;
  /** 0 = hero, 0.5 = features, 1 = branches — cumulative smoothed value */
  multiViewTarget: number;
}

export interface SceneElements {
  islandGroup: THREE.Group;
  pill: THREE.Mesh;
  glow: THREE.Mesh;
  glowMat: THREE.MeshBasicMaterial;
  outerGlowLayers: GlowLayer[];
  coreMat: THREE.MeshBasicMaterial;
  particles: THREE.Points;
  particleMat: THREE.PointsMaterial;
  raycaster: THREE.Raycaster;
}

export interface SceneRefs {
  mouse: { x: number; y: number };
  hoverRef: React.MutableRefObject<boolean>;
  transitionRef: React.MutableRefObject<number>;
  /** Raw multi-view target: 0=hero, 0.5=features, 1=branches */
  viewTargetRef: React.MutableRefObject<number>;
  transitionState: TransitionState;
  hueRef: React.MutableRefObject<number>;
}

/**
 * Create the animation loop
 */
export function createAnimationLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  elements: SceneElements,
  refs: SceneRefs,
  state: AnimationState
): () => void {
  let animId = 0;
  let isRunning = true;
  const ndc = new THREE.Vector2();

  // Initial camera position
  const initialCameraZ = SCENE_CONFIG.camera.positionZ;

  const animate = () => {
    if (!isRunning) return;
    animId = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // ── Raycasting: detect hover over island pill ─────────────────────────────
    ndc.set(refs.mouse.x, refs.mouse.y);
    elements.raycaster.setFromCamera(ndc, camera);
    const hits = elements.raycaster.intersectObject(elements.pill, false);
    refs.hoverRef.current = hits.length > 0;

    // Update state
    const isHovered = refs.hoverRef.current;
    state.rainbowState.target = isHovered ? 1 : 0;
    state.rainbowState.current = getTransitionFactor(
      state.rainbowState.current,
      state.rainbowState.target,
      SCENE_CONFIG.rainbow.smoothing
    );

    // Update transition state from ref (smooth lerp for 0→1 transition)
    refs.transitionState.current += (refs.transitionRef.current - refs.transitionState.current) * 0.08;
    const transition = refs.transitionState.current;

    // Animate island group
    animateIslandGroup(elements, refs, state, t, transition);

    // Animate glow effects
    const baseHue = getBaseHue(t);
    animateGlowEffects(elements, state, t, baseHue);

    // Expose current hue to CSS via refs (used by useRainbowSync and Hero buttons)
    refs.hueRef.current = baseHue;

    // Animate particles
    animateParticles(elements, state, t, baseHue);

    // Camera animation - move closer during transition
    const targetCameraZ = lerp(initialCameraZ, initialCameraZ * 0.85, transition);
    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;

    renderer.render(scene, camera);
  };

  // Start animation
  animate();

  // Return cleanup function
  return () => {
    isRunning = false;
    cancelAnimationFrame(animId);
  };
}

function getTransitionFactor(current: number, target: number, smoothing: number): number {
  return current + (target - current) * smoothing;
}

/**
 * Animate the island group (float, tilt, scale, transition rotation)
 */
function animateIslandGroup(
  elements: SceneElements,
  refs: SceneRefs,
  state: AnimationState,
  time: number,
  transition: number
): void {
  const { islandGroup, pill, glow, outerGlowLayers } = elements;
  const { mouse, hoverRef } = refs;
  const { animation } = SCENE_CONFIG;

  // Reduce floating during transition
  const floatReduction = lerp(1, 0.3, transition);

  // Floating motion
  islandGroup.position.y = Math.sin(time * animation.floatSpeed) * animation.floatAmplitudeY * floatReduction;
  islandGroup.position.x = Math.cos(time * animation.floatSpeed * 0.625) * animation.floatAmplitudeX * floatReduction;

  // Mouse tilt - reduce during transition
  const tiltReduction = lerp(1, 0.1, transition);
  const mouseTiltX = mouse.y * animation.mouseTiltFactor * tiltReduction;
  const mouseTiltY = mouse.x * animation.mouseTiltFactor * tiltReduction;
  islandGroup.rotation.x += (mouseTiltX - islandGroup.rotation.x) * animation.mouseTiltSmoothing;
  islandGroup.rotation.y += (mouseTiltY - islandGroup.rotation.y) * animation.mouseTiltSmoothing;

  // ── Both rotation and scale use transitionState.current.
  // This is the value smoothly tracked by Three.js (factor=0.08)
  // from transitionRef (React eased value). Result: each 90° rotation
  // takes ~0.625s — same as the original Hero→Features speed.
  const refValue = refs.transitionState.current;

  // Rotation
  let targetRotationZ: number;
  if (refValue <= 0.5) {
    const t = refValue * 2;
    targetRotationZ = lerp(Math.PI / 2, 0, 1 - Math.pow(1 - t, 3));
  } else {
    const t = (refValue - 0.5) * 2;
    targetRotationZ = lerp(0, -Math.PI / 2, 1 - Math.pow(1 - t, 3));
  }
  islandGroup.rotation.z += (targetRotationZ - islandGroup.rotation.z) * 0.08;

  // Scale
  const hoverScale = hoverRef.current ? animation.hoverScaleTarget : 1;
  state.hoverState.current = lerp(state.hoverState.current, hoverScale, animation.hoverScaleSmoothing);
  const breathScale = 1 + Math.sin(time * animation.breathSpeed) * animation.breathAmount;
  const baseScale = breathScale * state.hoverState.current;

  let transitionScale: number;
  if (refValue <= 0.5) {
    const t = refValue * 2;
    transitionScale = lerp(1, 0.64, 1 - Math.pow(1 - t, 3));
  } else {
    const t = (refValue - 0.5) * 2;
    transitionScale = lerp(0.64, 0.195, 1 - Math.pow(1 - t, 3));
  }

  pill.scale.setScalar(baseScale * transitionScale);
  glow.scale.setScalar(state.hoverState.current * breathScale * transitionScale);
  outerGlowLayers.forEach(layer => {
    layer.mesh.scale.setScalar(state.hoverState.current * breathScale * transitionScale);
  });
}

/**
 * Animate all glow effects (inner, outer, core)
 */
function animateGlowEffects(
  elements: SceneElements,
  state: AnimationState,
  time: number,
  baseHue: number
): void {
  const { glowMat, outerGlowLayers, coreMat } = elements;
  const { rainbow } = SCENE_CONFIG;
  const transition = state.rainbowState.current;

  // Inner glow
  const innerGlowRainbow = new THREE.Color().setHSL(
    baseHue / 360,
    rainbow.innerGlow.saturation,
    rainbow.innerGlow.lightness
  );
  const innerGlowNeutral = new THREE.Color(SCENE_CONFIG.innerGlow.baseColor);
  glowMat.color.copy(lerpColor(innerGlowNeutral, innerGlowRainbow, transition));
  
  const innerGlowBreathOpacity = SCENE_CONFIG.innerGlow.baseOpacity + Math.sin(time * rainbow.innerGlow.breathSpeed) * rainbow.innerGlow.breathAmount;
  glowMat.opacity = lerp(SCENE_CONFIG.innerGlow.baseOpacity, innerGlowBreathOpacity, transition);

  // Outer glow layers
  const { colors } = SCENE_CONFIG.outerGlow;
  outerGlowLayers.forEach((layer, i) => {
    // Get target colors
    const neutralColor = getNeutralGlowColor(time, layer.phase, colors);
    const { color: rainbowColor } = getRainbowGlowColor(baseHue, i, time);
    const targetColor = lerpColor(neutralColor, rainbowColor, transition);

    // Apply color
    layer.mat.color.copy(targetColor);

    // Calculate opacity
    const neutralBreath = getBreathFactor(time, layer.speed, layer.phase, true);
    const neutralOpacity = SCENE_CONFIG.outerGlow.opacities[i] * (0.5 + neutralBreath * 0.5);
    const smoothBreath = getBreathFactor(time, layer.speed * 0.5, time * 0.3);
    const rainbowOpacity = SCENE_CONFIG.outerGlow.opacities[i] * (0.8 + smoothBreath * 0.4);
    layer.mat.opacity = lerp(neutralOpacity, rainbowOpacity, transition);
  });

  // Core glow
  const coreRainbow = new THREE.Color().setHSL(
    (baseHue + rainbow.coreGlow.hueOffset) / 360,
    rainbow.coreGlow.saturation,
    rainbow.coreGlow.lightness
  );
  const coreNeutral = new THREE.Color(SCENE_CONFIG.coreGlow.baseColor);
  coreMat.color.copy(lerpColor(coreNeutral, coreRainbow, transition));
}

/**
 * Animate particles
 */
function animateParticles(
  elements: SceneElements,
  state: AnimationState,
  time: number,
  baseHue: number
): void {
  const { particles, particleMat } = elements;
  const { rainbow, particles: particleConfig } = SCENE_CONFIG;
  const transition = state.rainbowState.current;

  // Particles color
  const particleRainbow = new THREE.Color().setHSL(
    (baseHue + rainbow.particles.hueOffset) / 360,
    rainbow.particles.saturation,
    rainbow.particles.lightness
  );
  const particleNeutral = new THREE.Color(particleConfig.baseColor);
  particleMat.color.copy(lerpColor(particleNeutral, particleRainbow, transition));

  // Particles opacity
  const particleBreath = Math.sin(time * rainbow.particles.breathSpeed) * rainbow.particles.breathAmount;
  const particleTargetOpacity = particleConfig.baseOpacity * (1 + particleBreath);
  particleMat.opacity = lerp(particleConfig.baseOpacity, particleTargetOpacity, transition);

  // Rotation
  particles.rotation.y = time * particleConfig.rotationSpeed;
}
