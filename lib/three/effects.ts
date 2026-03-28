/**
 * @file effects.ts
 * @description Three.js 动画效果辅助函数
 * @description 提供颜色插值、数值插值、呼吸效果、彩虹光效等计算函数
 * @author 鸡哥
 */

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';

/**
 * 在两个 THREE.Color 之间进行线性插值
 * @param from - 起始颜色
 * @param to - 目标颜色
 * @param t - 插值因子（0~1）
 * @returns 插值后的颜色
 */
export function lerpColor(from: THREE.Color, to: THREE.Color, t: number): THREE.Color {
  return new THREE.Color().lerpColors(from, to, t);
}

/**
 * 数值的线性插值
 * @param a - 起始值
 * @param b - 目标值
 * @param t - 插值因子（0~1）
 * @returns 插值后的值
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * 平滑插值（缓入缓出）
 * @description 使用 Hermite 插值实现 ease-in-out 效果
 * @param edge0 - 边界下限
 * @param edge1 - 边界上限
 * @param x - 输入值
 * @returns 平滑插值结果（0~1）
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * 获取彩虹效果的当前基础色相
 * @description 根据时间计算彩虹色相循环的位置
 * @param time - 当前时间（秒）
 * @returns 当前色相值（0~360）
 */
export function getBaseHue(time: number): number {
  const { cycleSpeed, hueMultiplier } = SCENE_CONFIG.rainbow;
  const rainbowCycle = time * cycleSpeed;
  return (rainbowCycle * hueMultiplier % 1) * 360;
}

/**
 * 使用正弦波计算平滑呼吸因子
 * @description 用于实现光效的呼吸动画效果
 * @param time - 当前时间（秒）
 * @param speed - 呼吸速度
 * @param phase - 相位偏移
 * @param squared - 是否平方（使结果始终为正）
 * @returns 呼吸因子（-1~1 或 0~1）
 */
export function getBreathFactor(time: number, speed: number, phase: number = 0, squared: boolean = false): number {
  const value = Math.sin(time * speed + phase);
  return squared ? Math.pow(value, 2) : value;
}

/**
 * 计算外部光效层的主题色
 * @description 基于主题颜色计算光效层的过渡颜色
 * @param time - 当前时间（秒）
 * @param phase - 相位偏移
 * @param themeColors - 主题颜色数组（十六进制格式）
 * @returns 插值后的颜色
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
 * 获取外部光效层的彩虹颜色
 * @description 计算带渐变偏移的彩虹光效颜色
 * @param baseHue - 基础色相
 * @param index - 光效层索引
 * @param time - 当前时间（秒）
 * @returns 包含颜色、色相偏移、饱和度和亮度的对象
 */
export function getRainbowGlowColor(
  baseHue: number,
  index: number,
  time: number,
): { color: THREE.Color; hueOffset: number; saturation: number; lightness: number } {
  const { hueOffsetBase, hueOffsetVariance, saturationBase, saturationVariance, lightnessBase, lightnessVariance } = SCENE_CONFIG.rainbow.outerGlow;

  const hueOffset = index * hueOffsetBase + Math.sin(time * 0.5 + index * 0.3) * hueOffsetVariance;
  const saturation = saturationBase + Math.sin(time * 1.0 + index * 0.5) * saturationVariance;
  const lightness = lightnessBase + Math.sin(time * 1.2 + index * 0.4) * lightnessVariance;

  const color = new THREE.Color().setHSL((baseHue + hueOffset) / 360, saturation, lightness);

  return { color, hueOffset, saturation, lightness };
}
