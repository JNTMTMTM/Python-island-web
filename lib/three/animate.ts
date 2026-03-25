// Animation logic for Three.js scene

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';
import { GlowLayer } from './createElements';
import {
  getBaseHue,
  getBreathFactor,
  getNeutralGlowColor,
  getRainbowGlowColor,
  getRainbowRingColor,
  lerp,
  lerpColor,
} from './effects';

export interface AnimationState {
  hoverState: { active: boolean; current: number };
  rainbowState: { target: number; current: number };
}

export interface TransitionState {
  current: number;
}

export interface SceneElements {
  islandGroup: THREE.Group;
  pill: THREE.Mesh;
  glow: THREE.Mesh;
  glowMat: THREE.MeshBasicMaterial;
  outerGlowLayers: GlowLayer[];
  rings: THREE.Mesh[];
  coreMat: THREE.MeshBasicMaterial;
  particles: THREE.Points;
  particleMat: THREE.PointsMaterial;
}

export interface SceneRefs {
  mouse: { x: number; y: number };
  hoverRef: React.MutableRefObject<boolean>;
  transitionRef: React.MutableRefObject<number>;
  transitionState: TransitionState;
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
  
  // Initial camera position
  const initialCameraZ = SCENE_CONFIG.camera.positionZ;
  const initialCameraY = 0;

  const animate = () => {
    if (!isRunning) return;
    animId = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // Update state
    const isHovered = refs.hoverRef.current;
    state.rainbowState.target = isHovered ? 1 : 0;
    state.rainbowState.current = getTransitionFactor(
      state.rainbowState.current,
      state.rainbowState.target,
      SCENE_CONFIG.rainbow.smoothing
    );

    // Update transition state from ref
    refs.transitionState.current += (refs.transitionRef.current - refs.transitionState.current) * 0.08;
    const transition = refs.transitionState.current;

    // Animate island group
    animateIslandGroup(elements, refs, state, t, transition);

    // Animate glow effects
    animateGlowEffects(elements, state, t);

    // Animate orbit rings
    animateOrbitRings(elements, state, t);

    // Animate particles
    animateParticles(elements, state, t);

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
  const { mouse, hoverRef, transitionRef } = refs;
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

  // Smooth rotation from horizontal (PI/2) to vertical (0) during transition
  const initialRotationZ = SCENE_CONFIG.islandGroup.rotationZ;
  const targetRotationZ = lerp(initialRotationZ, 0, transition);
  islandGroup.rotation.z += (targetRotationZ - islandGroup.rotation.z) * 0.08;

  // Hover scale
  const targetScale = hoverRef.current ? animation.hoverScaleTarget : 1;
  state.hoverState.current = lerp(state.hoverState.current, targetScale, animation.hoverScaleSmoothing);
  const breathScale = 1 + Math.sin(time * animation.breathSpeed) * animation.breathAmount;
  const baseScale = breathScale * state.hoverState.current;

  // Transition scale: pill shrinks when going to features, expands when going to hero
  const transitionScale = lerp(0.64, 1, 1 - transition);

  pill.scale.setScalar(baseScale * transitionScale);
  glow.scale.setScalar(state.hoverState.current * transitionScale);
  outerGlowLayers.forEach(layer => {
    layer.mesh.scale.setScalar(state.hoverState.current * transitionScale);
  });
}

/**
 * Animate all glow effects (inner, outer, core)
 */
function animateGlowEffects(
  elements: SceneElements,
  state: AnimationState,
  time: number
): void {
  const { glowMat, outerGlowLayers, coreMat } = elements;
  const { rainbow } = SCENE_CONFIG;
  const baseHue = getBaseHue(time);
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
 * Animate orbit rings
 */
function animateOrbitRings(
  elements: SceneElements,
  state: AnimationState,
  time: number
): void {
  const { rings } = elements;
  const { rainbow, orbitRings } = SCENE_CONFIG;
  const baseHue = getBaseHue(time);
  const transition = state.rainbowState.current;

  rings.forEach((ring, i) => {
    // Color transition
    const neutralColor = new THREE.Color(orbitRings.colors[i]);
    const { color: rainbowColor } = getRainbowRingColor(baseHue, i, time);
    const targetColor = lerpColor(neutralColor, rainbowColor, transition);
    (ring.material as THREE.MeshBasicMaterial).color.copy(targetColor);

    // Opacity transition
    const neutralOpacity = orbitRings.opacities[i];
    const breath = Math.sin(time * 1.2 + i) * rainbow.rings.opacityVariance;
    const rainbowOpacity = orbitRings.opacities[i] * (rainbow.rings.opacityMultiplier + breath);
    (ring.material as THREE.MeshBasicMaterial).opacity = lerp(neutralOpacity, rainbowOpacity, transition);

    // Rotation
    ring.rotation.y = time * orbitRings.orbitSpeeds[i];
    ring.rotation.z = time * orbitRings.orbitZSpeeds[i];
  });
}

/**
 * Animate particles
 */
function animateParticles(
  elements: SceneElements,
  state: AnimationState,
  time: number
): void {
  const { particles, particleMat } = elements;
  const { rainbow, particles: particleConfig } = SCENE_CONFIG;
  const baseHue = getBaseHue(time);
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
