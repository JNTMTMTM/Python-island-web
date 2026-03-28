/**
 * @file animate.ts
 * @description Three.js 场景动画逻辑
 * @description 处理岛屿浮动、光效动画、粒子系统、鼠标交互等所有动画效果
 * @author 鸡哥
 */

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

/**
 * 动画状态接口
 * @description 定义动画过程中需要跟踪的状态
 */
export interface AnimationState {
  /** 悬停状态：active 表示是否悬停，current 表示当前缩放值 */
  hoverState: { active: boolean; current: number };
  /** 彩虹光效状态：target 表示目标值（悬停为1，未悬停为0），current 表示当前值 */
  rainbowState: { target: number; current: number };
}

/**
 * 过渡状态接口
 * @description 定义页面过渡时的动画状态
 */
export interface TransitionState {
  /** 当前过渡进度（0~1） */
  current: number;
  /** 多视图目标位置：0=hero, 0.33=features, 0.55=branches, 0.78=develop, 1=contributors */
  multiViewTarget: number;
}

/**
 * 场景元素接口
 * @description 封装所有需要动画控制的 Three.js 对象
 */
export interface SceneElements {
  /** 岛屿组对象 */
  islandGroup: THREE.Group;
  /** 胶囊体网格 */
  pill: THREE.Mesh;
  /** 内部光效网格 */
  glow: THREE.Mesh;
  /** 内部光效材质 */
  glowMat: THREE.MeshBasicMaterial;
  /** 外部光效层数组 */
  outerGlowLayers: GlowLayer[];
  /** 核心光效材质 */
  coreMat: THREE.MeshBasicMaterial;
  /** 粒子系统 */
  particles: THREE.Points;
  /** 粒子材质 */
  particleMat: THREE.PointsMaterial;
  /** 射线检测器，用于鼠标悬停检测 */
  raycaster: THREE.Raycaster;
}

/**
 * 场景引用接口
 * @description 封装所有动画所需的 React 引用和状态
 */
export interface SceneRefs {
  /** 鼠标归一化坐标（-1~1） */
  mouse: { x: number; y: number };
  /** 悬停状态引用 */
  hoverRef: React.MutableRefObject<boolean>;
  /** 过渡进度引用（来自 React 的缓动值） */
  transitionRef: React.MutableRefObject<number>;
  /** 多视图目标位置引用：0=hero, 0.33=features, 0.55=branches, 0.78=develop, 1=contributors */
  viewTargetRef: React.MutableRefObject<number>;
  /** 过渡状态 */
  transitionState: TransitionState;
  /** 当前色相引用，用于与 CSS 同步 */
  hueRef: React.MutableRefObject<number>;
}

/**
 * 创建动画循环
 * @description 初始化 Three.js 的 requestAnimationFrame 动画循环
 * @description 每帧更新所有动画效果（浮动、光效、粒子、相机等）
 * @param renderer - WebGL 渲染器
 * @param scene - Three.js 场景
 * @param camera - 相机对象
 * @param elements - 场景元素集合
 * @param refs - 场景引用集合
 * @param state - 动画状态
 * @returns 清理函数，用于停止动画循环
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

  // 初始相机位置
  const initialCameraZ = SCENE_CONFIG.camera.positionZ;

  const animate = () => {
    if (!isRunning) return;
    animId = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // ── 射线检测：检测鼠标是否悬停在岛屿上 ─────────────────────────────
    ndc.set(refs.mouse.x, refs.mouse.y);
    elements.raycaster.setFromCamera(ndc, camera);
    const hits = elements.raycaster.intersectObject(elements.pill, false);
    refs.hoverRef.current = hits.length > 0;

    // 更新状态
    const isHovered = refs.hoverRef.current;
    state.rainbowState.target = isHovered ? 1 : 0;
    state.rainbowState.current = getTransitionFactor(
      state.rainbowState.current,
      state.rainbowState.target,
      SCENE_CONFIG.rainbow.smoothing
    );

    // 从引用更新过渡状态（0→1 过渡的平滑插值）
    refs.transitionState.current += (refs.transitionRef.current - refs.transitionState.current) * 0.14;
    const transition = refs.transitionState.current;

    // 动画化岛屿组
    animateIslandGroup(elements, refs, state, t, transition);

    // 动画化光效
    const baseHue = getBaseHue(t);
    animateGlowEffects(elements, state, t, baseHue);

    // 通过引用向 CSS 暴露当前色相（用于 useRainbowSync 和 Hero 按钮）
    refs.hueRef.current = baseHue;

    // 动画化粒子
    animateParticles(elements, state, t, baseHue);

    // 相机动画 - 过渡时靠近
    const targetCameraZ = lerp(initialCameraZ, initialCameraZ * 0.85, transition);
    camera.position.z += (targetCameraZ - camera.position.z) * 0.14;

    renderer.render(scene, camera);
  };

  // 开始动画
  animate();

  // 返回清理函数
  return () => {
    isRunning = false;
    cancelAnimationFrame(animId);
  };
}

/**
 * 获取过渡因子
 * @description 计算当前值向目标值平滑过渡的因子
 * @param current - 当前值
 * @param target - 目标值
 * @param smoothing - 平滑系数（0~1）
 * @returns 平滑过渡后的值
 */
function getTransitionFactor(current: number, target: number, smoothing: number): number {
  return current + (target - current) * smoothing;
}

/**
 * 动画化岛屿组（浮动、倾斜、缩放、过渡旋转）
 * @description 控制岛屿的所有变换动画
 * @param elements - 场景元素
 * @param refs - 场景引用
 * @param state - 动画状态
 * @param time - 当前时间（秒）
 * @param transition - 过渡进度（0~1）
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

  // 过渡时减少浮动
  const floatReduction = lerp(1, 0.3, transition);

  // 浮动动画
  islandGroup.position.y = Math.sin(time * animation.floatSpeed) * animation.floatAmplitudeY * floatReduction;
  islandGroup.position.x = Math.cos(time * animation.floatSpeed * 0.625) * animation.floatAmplitudeX * floatReduction;

  // 鼠标倾斜 - 过渡时减少
  const tiltReduction = lerp(1, 0.1, transition);
  const mouseTiltX = mouse.y * animation.mouseTiltFactor * tiltReduction;
  const mouseTiltY = mouse.x * animation.mouseTiltFactor * tiltReduction;
  islandGroup.rotation.x += (mouseTiltX - islandGroup.rotation.x) * animation.mouseTiltSmoothing;
  islandGroup.rotation.y += (mouseTiltY - islandGroup.rotation.y) * animation.mouseTiltSmoothing;

  // ── 旋转和缩放都使用 transitionState.current
  // 这是 Three.js 平滑追踪的值（系数=0.14）
  // 来自 transitionRef（React 缓动值）
  const refValue = refs.transitionState.current;

  // 过渡位置 — 第三/第四段向上移动而不是旋转
  let targetPosY: number;
  if (refValue <= 0.33) {
    targetPosY = 0;
  } else if (refValue <= 0.55) {
    targetPosY = 0;
  } else if (refValue <= 0.78) {
    const t = (refValue - 0.55) / 0.23;
    targetPosY = lerp(0, 0.6, 1 - Math.pow(1 - t, 3));
  } else {
    targetPosY = 0.6;
  }
  islandGroup.position.y += (targetPosY - islandGroup.position.y) * 0.14;

  // 旋转 — 第二段完成 -PI/2；第三/第四段保持在 -PI/2
  let targetRotationZ: number;
  if (refValue <= 0.33) {
    const t = refValue / 0.33;
    targetRotationZ = lerp(Math.PI / 2, 0, 1 - Math.pow(1 - t, 3));
  } else if (refValue <= 0.55) {
    const t = (refValue - 0.33) / 0.22;
    targetRotationZ = lerp(0, -Math.PI / 2, 1 - Math.pow(1 - t, 3));
  } else {
    targetRotationZ = -Math.PI / 2;
  }
  islandGroup.rotation.z += (targetRotationZ - islandGroup.rotation.z) * 0.14;

  // 缩放
  const hoverScale = hoverRef.current ? animation.hoverScaleTarget : 1;
  state.hoverState.current = lerp(state.hoverState.current, hoverScale, animation.hoverScaleSmoothing);
  const breathScale = 1 + Math.sin(time * animation.breathSpeed) * animation.breathAmount;
  const baseScale = breathScale * state.hoverState.current;

  let transitionScale: number;
  if (refValue <= 0.33) {
    const t = refValue / 0.33;
    transitionScale = lerp(1, 0.64, 1 - Math.pow(1 - t, 3));
  } else if (refValue <= 0.55) {
    const t = (refValue - 0.33) / 0.22;
    transitionScale = lerp(0.64, 0.195, 1 - Math.pow(1 - t, 3));
  } else if (refValue <= 0.78) {
    const t = (refValue - 0.55) / 0.23;
    transitionScale = lerp(0.195, 0.10, 1 - Math.pow(1 - t, 3));
  } else {
    transitionScale = 0.10;
  }

  pill.scale.setScalar(baseScale * transitionScale);
  glow.scale.setScalar(state.hoverState.current * breathScale * transitionScale);
  outerGlowLayers.forEach(layer => {
    layer.mesh.scale.setScalar(state.hoverState.current * breathScale * transitionScale);
  });
}

/**
 * 动画化所有光效（内部、外部、核心）
 * @description 控制光效的颜色、透明度和呼吸动画
 * @param elements - 场景元素
 * @param state - 动画状态
 * @param time - 当前时间（秒）
 * @param baseHue - 基础色相
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

  // 内部光效
  const innerGlowRainbow = new THREE.Color().setHSL(
    baseHue / 360,
    rainbow.innerGlow.saturation,
    rainbow.innerGlow.lightness
  );
  const innerGlowNeutral = new THREE.Color(SCENE_CONFIG.innerGlow.baseColor);
  glowMat.color.copy(lerpColor(innerGlowNeutral, innerGlowRainbow, transition));

  const innerGlowBreathOpacity = SCENE_CONFIG.innerGlow.baseOpacity + Math.sin(time * rainbow.innerGlow.breathSpeed) * rainbow.innerGlow.breathAmount;
  glowMat.opacity = lerp(SCENE_CONFIG.innerGlow.baseOpacity, innerGlowBreathOpacity, transition);

  // 外部光效层
  const { colors } = SCENE_CONFIG.outerGlow;
  outerGlowLayers.forEach((layer, i) => {
    // 获取目标颜色
    const neutralColor = getNeutralGlowColor(time, layer.phase, colors);
    const { color: rainbowColor } = getRainbowGlowColor(baseHue, i, time);
    const targetColor = lerpColor(neutralColor, rainbowColor, transition);

    // 应用颜色
    layer.mat.color.copy(targetColor);

    // 计算透明度
    const neutralBreath = getBreathFactor(time, layer.speed, layer.phase, true);
    const neutralOpacity = SCENE_CONFIG.outerGlow.opacities[i] * (0.5 + neutralBreath * 0.5);
    const smoothBreath = getBreathFactor(time, layer.speed * 0.5, time * 0.3);
    const rainbowOpacity = SCENE_CONFIG.outerGlow.opacities[i] * (0.8 + smoothBreath * 0.4);
    layer.mat.opacity = lerp(neutralOpacity, rainbowOpacity, transition);
  });

  // 核心光效
  const coreRainbow = new THREE.Color().setHSL(
    (baseHue + rainbow.coreGlow.hueOffset) / 360,
    rainbow.coreGlow.saturation,
    rainbow.coreGlow.lightness
  );
  const coreNeutral = new THREE.Color(SCENE_CONFIG.coreGlow.baseColor);
  coreMat.color.copy(lerpColor(coreNeutral, coreRainbow, transition));
}

/**
 * 动画化粒子系统
 * @description 控制粒子的颜色、透明度和旋转
 * @param elements - 场景元素
 * @param state - 动画状态
 * @param time - 当前时间（秒）
 * @param baseHue - 基础色相
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

  // 粒子颜色
  const particleRainbow = new THREE.Color().setHSL(
    (baseHue + rainbow.particles.hueOffset) / 360,
    rainbow.particles.saturation,
    rainbow.particles.lightness
  );
  const particleNeutral = new THREE.Color(particleConfig.baseColor);
  particleMat.color.copy(lerpColor(particleNeutral, particleRainbow, transition));

  // 粒子透明度
  const particleBreath = Math.sin(time * rainbow.particles.breathSpeed) * rainbow.particles.breathAmount;
  const particleTargetOpacity = particleConfig.baseOpacity * (1 + particleBreath);
  particleMat.opacity = lerp(particleConfig.baseOpacity, particleTargetOpacity, transition);

  // 旋转
  particles.rotation.y = time * particleConfig.rotationSpeed;
}
