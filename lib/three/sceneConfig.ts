/**
 * @file sceneConfig.ts
 * @description Three.js 场景配置常量
 * @description 定义相机、渲染器、灯光、岛屿几何、光效、粒子、动画等所有视觉参数
 * @description 所有数值集中管理，便于调优和主题切换
 * @author 鸡哥
 */

// 场景配置常量

export const SCENE_CONFIG = {
  // 相机配置
  camera: {
    fov: 30,               // 视场角度
    near: 0.1,             // 近裁剪面距离
    far: 100,              // 远裁剪面距离
    positionZ: 12,         // 相机Z轴位置
  },

  // 渲染器配置
  renderer: {
    antialias: true,                    // 启用抗锯齿
    alpha: true,                        // 启用透明背景
    powerPreference: 'high-performance' as const,  // 使用高性能GPU
    maxPixelRatio: 2,                   // 最大像素比率
  },

  // 灯光配置
  lights: {
    ambient: { color: 0x86868B, intensity: 0.4 },           // 环境光
    point1: { color: 0x1D1D1F, intensity: 0.8, distance: 50, position: [8, 8, 8] },  // 点光源1
    point2: { color: 0x86868B, intensity: 0.3, distance: 50, position: [-8, -8, -8] },  // 点光源2
    point3: { color: 0x71717a, intensity: 0.3, distance: 30, position: [0, 0, 6] },  // 点光源3
  },

  // Dynamic Island组合配置
  islandGroup: {
    rotationZ: Math.PI / 2,  // 初始水平旋转（过渡时将旋转到垂直）
    scale: 2.5,              // 缩放比例
  },

  // 胶囊体主体配置
  pill: {
    radius: 0.55,            // 半径
    length: 1.65,            // 长度
    tubeSegments: 16,        // 管道分段数
    radialSegments: 48,      // 径向分段数
    material: {
      color: 0x1D1D1F,      // 颜色
      metalness: 0.9,        // 金属度
      roughness: 0.08,       // 粗糙度
    },
  },

  // 内部发光配置
  innerGlow: {
    radius: 0.28,            // 半径
    length: 1.23,            // 长度
    baseColor: 0x86868B,     // 基础颜色
    baseOpacity: 0.25,       // 基础透明度
  },

  // 外部发光层配置（多层光晕）
  outerGlow: {
    colors: [0x71717a, 0x86868B, 0xA1A1AA, 0x71717a, 0x86868B, 0x71717a],  // 各层颜色
    radii: [0.012, 0.025, 0.04, 0.06, 0.08, 0.12],  // 各层半径
    opacities: [0.35, 0.30, 0.22, 0.16, 0.10, 0.06],  // 各层透明度
    speeds: [0.5, 0.4, 0.35, 0.3, 0.25, 0.2],        // 各层动画速度
  },

  // 轨道环配置
  orbitRings: {
    radii: [2.7, 3.3, 4.0],              // 三个环的半径
    tubeRadius: 0.007,                   // 环管半径
    tubeSegments: 8,                     // 管道分段数
    radialSegments: 180,                 // 径向分段数
    colors: [0x71717a, 0xa1a1aa, 0xd4d4d8],  // 三个环的颜色
    opacities: [0.04, 0.04, 0.04],      // 三个环的透明度
    rotations: [                        // 三个环的旋转角度
      { x: Math.PI * 0.2, y: 0, z: Math.PI * 0.15 },
      { x: Math.PI * 0.2, y: 0.7, z: Math.PI * 0.15 },
      { x: Math.PI * 0.2, y: 1.4, z: Math.PI * 0.15 },
    ],
    orbitSpeeds: [0.08, 0.14, 0.20],   // 三个环的轨道速度
    orbitZSpeeds: [0.05, 0.07, 0.09], // 三个环的Z轴旋转速度
  },

  // 浮动粒子点配置
  floatingDots: {
    colors: [0xd4d4d8, 0xa1a1aa, 0x71717a],  // 点的颜色
    baseSize: 0.01,                         // 基础大小
    sizeIncrement: 0.008,                   // 大小增量
    segments: 8,                             // 分段数
    positions: [                             // 点的位置坐标
      [1.0, 0.5, 0.3], [-0.9, -0.3, 0.25], [0.7, -0.6, 0.4],
      [-0.7, 0.6, -0.4], [0.5, 0.8, -0.5], [-0.6, -0.7, 0.4],
      [1.1, -0.25, -0.5], [-1.0, 0.3, 0.6],
    ],
  },

  // 核心发光球体配置
  coreGlow: {
    radius: 0.0,                // 半径（初始为0，悬停时显示）
    segments: 24,               // 分段数
    baseColor: 0x71717a,       // 基础颜色
    baseOpacity: 0.15,          // 基础透明度
    hoverOpacity: 0.25,         // 悬停时透明度
  },

  // 背景粒子配置
  particles: {
    count: 300,                 // 粒子数量
    minRadius: 2,               // 最小分布半径
    maxRadius: 5,               // 最大分布半径
    size: 0.01,                 // 粒子大小
    baseColor: 0x86868B,        // 基础颜色
    baseOpacity: 0.35,          // 基础透明度
    rotationSpeed: 0.012,       // 旋转速度
  },

  // 动画配置
  animation: {
    floatSpeed: 0.8,           // 浮动速度
    floatAmplitudeX: 0.04,     // X轴浮动幅度
    floatAmplitudeY: 0.08,     // Y轴浮动幅度
    mouseTiltFactor: 0.15,     // 鼠标倾斜系数
    mouseTiltSmoothing: 0.05,  // 鼠标倾斜平滑度
    hoverScaleTarget: 0.92,    // 悬停缩放目标
    hoverScaleSmoothing: 0.06, // 悬停缩放平滑度
    hoverStretchXZ: 0.0,      // 悬停XZ轴拉伸
    hoverStretchY: 0.0,        // 悬停Y轴拉伸
    breathSpeed: 1.2,          // 呼吸动画速度
    breathAmount: 0.015,      // 呼吸动画幅度
  },

  // 彩虹效果配置
  rainbow: {
    cycleSpeed: 0.25,          // 颜色循环速度
    hueMultiplier: 0.2,        // 色相乘数
    smoothing: 0.05,           // 平滑度
    innerGlow: {
      saturation: 0.9,         // 饱和度
      lightness: 0.65,         // 亮度
      breathSpeed: 1.8,        // 呼吸速度
      breathAmount: 0.08,      // 呼吸幅度
    },
    outerGlow: {
      hueOffsetBase: 25,            // 色相偏移基准值
      hueOffsetVariance: 12,        // 色相偏移变化量
      saturationBase: 0.85,         // 饱和度基准值
      saturationVariance: 0.1,      // 饱和度变化量
      lightnessBase: 0.65,          // 亮度基准值
      lightnessVariance: 0.08,      // 亮度变化量
    },
    coreGlow: {
      hueOffset: 40,          // 色相偏移
      saturation: 0.85,        // 饱和度
      lightness: 0.65,         // 亮度
      breathSpeed: 1.5,       // 呼吸速度
      breathAmount: 0.08,     // 呼吸幅度
    },
    rings: {
      hueOffsetBase: 20,            // 色相偏移基准值
      hueOffsetVariance: 10,        // 色相偏移变化量
      saturationBase: 0.8,          // 饱和度基准值
      saturationVariance: 0.1,       // 饱和度变化量
      opacityMultiplier: 2.0,       // 透明度倍数
      opacityVariance: 0.3,         // 透明度变化量
    },
    particles: {
      hueOffset: 80,          // 色相偏移
      saturation: 0.7,         // 饱和度
      lightness: 0.65,        // 亮度
      opacity: 0.6,           // 透明度
      breathSpeed: 1.2,       // 呼吸速度
      breathAmount: 0.15,     // 呼吸幅度
    },
  },
} as const;

export type SceneConfig = typeof SCENE_CONFIG;
