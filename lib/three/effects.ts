// Effect helper functions for Three.js animations

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';

/**
 * Lerp between two THREE.Colors
 */
export function lerpColor(from: THREE.Color, to: THREE.Color, t: number): THREE.Color {
  return new THREE.Color().lerpColors(from, to, t);
}

/**
 * Linear interpolation for numbers
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smoothstep interpolation (ease-in-out)
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Get the current base hue for rainbow effect
 */
export function getBaseHue(time: number): number {
  const { cycleSpeed, hueMultiplier } = SCENE_CONFIG.rainbow;
  const rainbowCycle = time * cycleSpeed;
  return (rainbowCycle * hueMultiplier % 1) * 360;
}

/**
 * Calculate smooth breathing factor using sine wave
 */
export function getBreathFactor(time: number, speed: number, phase: number = 0, squared: boolean = false): number {
  const value = Math.sin(time * speed + phase);
  return squared ? Math.pow(value, 2) : value;
}

/**
 * Get the transition factor for hover effect (0 = neutral, 1 = full rainbow)
 */
export function getTransitionFactor(
  current: number,
  target: number,
  smoothing: number
): number {
  return current + (target - current) * smoothing;
}

/**
 * Create a color that interpolates between neutral and rainbow based on transition factor
 */
export function getInterpolatedColor(
  neutralColor: number,
  baseHue: number,
  saturation: number,
  lightness: number,
  transitionFactor: number
): THREE.Color {
  const neutral = new THREE.Color(neutralColor);
  const rainbow = new THREE.Color().setHSL(baseHue / 360, saturation, lightness);
  return lerpColor(neutral, rainbow, transitionFactor);
}

/**
 * Interpolate opacity between neutral and hover states
 */
export function getInterpolatedOpacity(
  neutralOpacity: number,
  hoverOpacity: number,
  breathAmount: number,
  time: number,
  breathSpeed: number,
  transitionFactor: number
): number {
  const breath = Math.sin(time * breathSpeed) * breathAmount;
  const targetOpacity = hoverOpacity + breath;
  return lerp(neutralOpacity, targetOpacity, transitionFactor);
}

/**
 * Calculate neutral color for outer glow layers (based on theme colors)
 */
export function getNeutralGlowColor(time: number, phase: number, themeColors: readonly number[]): THREE.Color {
  const colorShift = Math.sin(time * 0.25 + phase * 0.5);
  const t = (colorShift + 1) / 2;
  
  const color0 = themeColors[0];
  const color2 = themeColors[2];
  const r0 = (color0 >> 16) & 0xff;
  const g0 = (color0 >> 8) & 0xff;
  const b0 = color0 & 0xff;
  const r1 = (color2 >> 16) & 0xff;
  const g1 = (color2 >> 8) & 0xff;
  const b1 = color2 & 0xff;
  
  const r = Math.round(r0 * (1 - t) + r1 * t) / 255;
  const g = Math.round(g0 * (1 - t) + g1 * t) / 255;
  const b = Math.round(b0 * (1 - t) + b1 * t) / 255;
  
  return new THREE.Color(r, g, b);
}

/**
 * Get rainbow color for outer glow layers with gradient offset
 */
export function getRainbowGlowColor(
  baseHue: number,
  index: number,
  time: number
): { color: THREE.Color; hueOffset: number; saturation: number; lightness: number } {
  const { hueOffsetBase, hueOffsetVariance, saturationBase, saturationVariance, lightnessBase, lightnessVariance } = SCENE_CONFIG.rainbow.outerGlow;
  
  const hueOffset = index * hueOffsetBase + Math.sin(time * 0.5 + index * 0.3) * hueOffsetVariance;
  const saturation = saturationBase + Math.sin(time * 1.0 + index * 0.5) * saturationVariance;
  const lightness = lightnessBase + Math.sin(time * 1.2 + index * 0.4) * lightnessVariance;
  
  const color = new THREE.Color().setHSL((baseHue + hueOffset) / 360, saturation, lightness);
  
  return { color, hueOffset, saturation, lightness };
}

/**
 * Get rainbow color for orbit rings
 */
export function getRainbowRingColor(
  baseHue: number,
  index: number,
  time: number
): { color: THREE.Color; saturation: number } {
  const { hueOffsetBase, hueOffsetVariance, saturationBase, saturationVariance } = SCENE_CONFIG.rainbow.rings;
  
  const hueOffset = index * 40 + hueOffsetBase + Math.sin(time * 0.5 + index * 0.3) * hueOffsetVariance;
  const saturation = saturationBase + Math.sin(time * 1.0 + index) * saturationVariance;
  
  const color = new THREE.Color().setHSL((baseHue + hueOffset) / 360, saturation, 0.6);
  
  return { color, saturation };
}
