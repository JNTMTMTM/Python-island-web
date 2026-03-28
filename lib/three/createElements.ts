/**
 * @file createElements.ts
 * @description Three.js 场景元素创建函数
 * @description 提供创建场景、相机、渲染器、灯光、岛屿、光效、粒子等元素的函数
 * @author 鸡哥
 */

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';

/**
 * 光效层接口
 * @description 定义单个外部光效层的属性
 */
export interface GlowLayer {
  /** 光效网格对象 */
  mesh: THREE.Mesh;
  /** 光效材质 */
  mat: THREE.MeshBasicMaterial;
  /** 动画速度 */
  speed: number;
  /** 动画相位 */
  phase: number;
}

/**
 * 创建场景、相机和渲染器
 * @description 初始化 Three.js 的核心渲染环境
 * @param container - DOM 容器元素
 * @returns 包含场景、相机和渲染器的对象
 */
export function createScene(container: HTMLElement): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
} {
  const { width, height } = container.getBoundingClientRect();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    SCENE_CONFIG.camera.fov,
    width / height,
    SCENE_CONFIG.camera.near,
    SCENE_CONFIG.camera.far
  );
  camera.position.z = SCENE_CONFIG.camera.positionZ;

  const renderer = new THREE.WebGLRenderer({
    antialias: SCENE_CONFIG.renderer.antialias,
    alpha: SCENE_CONFIG.renderer.alpha,
    powerPreference: SCENE_CONFIG.renderer.powerPreference,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.renderer.maxPixelRatio));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
}

/**
 * 添加灯光到场景
 * @description 创建并添加环境光和三个点光源，提供场景照明
 * @param scene - Three.js 场景对象
 */
export function addLights(scene: THREE.Scene): void {
  const { ambient, point1, point2, point3 } = SCENE_CONFIG.lights;

  // 环境光
  const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
  scene.add(ambientLight);

  // 点光源 1
  const p1 = new THREE.PointLight(point1.color, point1.intensity, point1.distance);
  p1.position.set(...(point1.position as [number, number, number]));
  scene.add(p1);

  // 点光源 2
  const p2 = new THREE.PointLight(point2.color, point2.intensity, point2.distance);
  p2.position.set(...(point2.position as [number, number, number]));
  scene.add(p2);

  // 点光源 3
  const p3 = new THREE.PointLight(point3.color, point3.intensity, point3.distance);
  p3.position.set(...(point3.position as [number, number, number]));
  scene.add(p3);
}

/**
 * 创建岛屿组（包含胶囊体和内部光效）
 * @description 创建动态岛的主体，包含黑色胶囊体和内部发光层
 * @returns 包含组、胶囊体、光效和光效材质的对象
 */
export function createIslandGroup(): {
  group: THREE.Group;
  pill: THREE.Mesh;
  glow: THREE.Mesh;
  glowMat: THREE.MeshBasicMaterial;
} {
  const { rotationZ, scale } = SCENE_CONFIG.islandGroup;
  const group = new THREE.Group();
  group.rotation.z = rotationZ;
  group.scale.setScalar(scale);

  // 胶囊体主体
  const pillMat = new THREE.MeshStandardMaterial(SCENE_CONFIG.pill.material);
  const pill = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      SCENE_CONFIG.pill.radius,
      SCENE_CONFIG.pill.length,
      SCENE_CONFIG.pill.tubeSegments,
      SCENE_CONFIG.pill.radialSegments
    ),
    pillMat
  );
  group.add(pill);

  // 内部光效
  const glowMat = new THREE.MeshBasicMaterial({
    color: SCENE_CONFIG.innerGlow.baseColor,
    transparent: true,
    opacity: SCENE_CONFIG.innerGlow.baseOpacity,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      SCENE_CONFIG.innerGlow.radius,
      SCENE_CONFIG.innerGlow.length,
      SCENE_CONFIG.pill.tubeSegments,
      SCENE_CONFIG.pill.radialSegments
    ),
    glowMat
  );
  group.add(glow);

  return { group, pill, glow, glowMat };
}

/**
 * 创建外部光效层
 * @description 创建多层光效包围岛屿，营造发光效果
 * @param group - 要添加光效的组对象
 * @returns 光效层数组
 */
export function createOuterGlowLayers(group: THREE.Group): GlowLayer[] {
  const { colors, radii, opacities, speeds } = SCENE_CONFIG.outerGlow;
  const layers: GlowLayer[] = [];

  radii.forEach((r, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i],
      transparent: true,
      opacity: opacities[i],
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        SCENE_CONFIG.pill.radius + r,
        SCENE_CONFIG.pill.length + r * 2,
        SCENE_CONFIG.pill.tubeSegments,
        SCENE_CONFIG.pill.radialSegments
      ),
      mat
    );

    group.add(mesh);
    layers.push({
      mesh,
      mat,
      speed: speeds[i],
      phase: i * (Math.PI * 2 / radii.length),
    });
  });

  return layers;
}

/**
 * 创建核心光效球体
 * @description 在岛屿中心创建发光核心
 * @param group - 要添加核心光效的组对象
 * @returns 核心光效材质
 */
export function createCoreGlow(group: THREE.Group): THREE.MeshBasicMaterial {
  const { radius, segments, baseColor, baseOpacity } = SCENE_CONFIG.coreGlow;

  const mat = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: baseOpacity,
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    mat
  );

  group.add(mesh);
  return mat;
}

/**
 * 创建背景粒子系统
 * @description 在球体表面上随机分布粒子，营造空间感
 * @param scene - Three.js 场景对象
 * @returns 包含粒子和粒子材质的对象
 */
export function createParticles(scene: THREE.Scene): {
  points: THREE.Points;
  mat: THREE.PointsMaterial;
} {
  const { count, minRadius, maxRadius, size, baseColor, baseOpacity } = SCENE_CONFIG.particles;
  const positions = new Float32Array(count * 3);

  // 在球体表面随机分布粒子
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = minRadius + Math.random() * (maxRadius - minRadius);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: baseColor,
    size,
    transparent: true,
    opacity: baseOpacity,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return { points, mat };
}

/**
 * 创建鼠标跟踪状态
 * @description 初始化鼠标位置跟踪和移动事件处理
 * @returns 包含鼠标坐标和事件处理函数的对象
 */
export function createMouseTracker(): {
  mouse: { x: number; y: number };
  onMouseMove: (e: MouseEvent) => void;
} {
  const mouse = { x: 0, y: 0 };

  const onMouseMove = (e: MouseEvent) => {
    // 将屏幕坐标转换为归一化设备坐标（NDC，-1~1）
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  return { mouse, onMouseMove };
}

/**
 * 创建动画状态
 * @description 初始化动画所需的悬停状态和彩虹光效状态
 * @returns 初始动画状态对象
 */
export function createAnimationState(): {
  hoverState: { active: boolean; current: number };
  rainbowState: { target: number; current: number };
} {
  return {
    hoverState: { active: false, current: 0 },
    rainbowState: { target: 0, current: 0 },
  };
}
