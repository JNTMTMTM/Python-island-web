// Scene configuration constants

export const SCENE_CONFIG = {
  // Camera
  camera: {
    fov: 30,
    near: 0.1,
    far: 100,
    positionZ: 12,
  },

  // Renderer
  renderer: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    maxPixelRatio: 2,
  },

  // Lights
  lights: {
    ambient: { color: 0x86868B, intensity: 0.4 },
    point1: { color: 0x1D1D1F, intensity: 0.8, distance: 50, position: [8, 8, 8] },
    point2: { color: 0x86868B, intensity: 0.3, distance: 50, position: [-8, -8, -8] },
    point3: { color: 0x71717a, intensity: 0.3, distance: 30, position: [0, 0, 6] },
  },

  // Island group
  islandGroup: {
    rotationZ: Math.PI / 2, // Horizontal initially (will rotate to vertical on transition)
    scale: 2.5,
  },

  // Pill body
  pill: {
    radius: 0.55,
    length: 1.65,
    tubeSegments: 16,
    radialSegments: 48,
    material: {
      color: 0x1D1D1F,
      metalness: 0.9,
      roughness: 0.08,
    },
  },

  // Inner glow
  innerGlow: {
    radius: 0.28,
    length: 1.23,
    baseColor: 0x86868B,
    baseOpacity: 0.25,
  },

  // Outer glow layers
  outerGlow: {
    colors: [0x71717a, 0x86868B, 0xA1A1AA, 0x71717a, 0x86868B, 0x71717a],
    radii: [0.012, 0.025, 0.04, 0.06, 0.08, 0.12],
    opacities: [0.35, 0.30, 0.22, 0.16, 0.10, 0.06],
    speeds: [0.5, 0.4, 0.35, 0.3, 0.25, 0.2],
  },

  // Orbit rings
  orbitRings: {
    radii: [2.7, 3.3, 4.0],
    tubeRadius: 0.007,
    tubeSegments: 8,
    radialSegments: 180,
    colors: [0x71717a, 0xa1a1aa, 0xd4d4d8],
    opacities: [0.04, 0.04, 0.04],
    rotations: [
      { x: Math.PI * 0.2, y: 0, z: Math.PI * 0.15 },
      { x: Math.PI * 0.2, y: 0.7, z: Math.PI * 0.15 },
      { x: Math.PI * 0.2, y: 1.4, z: Math.PI * 0.15 },
    ],
    orbitSpeeds: [0.08, 0.14, 0.20],
    orbitZSpeeds: [0.05, 0.07, 0.09],
  },

  // Floating dots
  floatingDots: {
    colors: [0xd4d4d8, 0xa1a1aa, 0x71717a],
    baseSize: 0.01,
    sizeIncrement: 0.008,
    segments: 8,
    positions: [
      [1.0, 0.5, 0.3], [-0.9, -0.3, 0.25], [0.7, -0.6, 0.4],
      [-0.7, 0.6, -0.4], [0.5, 0.8, -0.5], [-0.6, -0.7, 0.4],
      [1.1, -0.25, -0.5], [-1.0, 0.3, 0.6],
    ],
  },

  // Core glow sphere
  coreGlow: {
    radius: 0.0,
    segments: 24,
    baseColor: 0x71717a,
    baseOpacity: 0.15,
    hoverOpacity: 0.25,
  },

  // Background particles
  particles: {
    count: 300,
    minRadius: 2,
    maxRadius: 5,
    size: 0.01,
    baseColor: 0x86868B,
    baseOpacity: 0.35,
    rotationSpeed: 0.012,
  },

  // Animation
  animation: {
    floatSpeed: 0.8,
    floatAmplitudeX: 0.04,
    floatAmplitudeY: 0.08,
    mouseTiltFactor: 0.15,
    mouseTiltSmoothing: 0.05,
    hoverScaleTarget: 0.92,
    hoverScaleSmoothing: 0.06,
    hoverStretchXZ: 0.0,
    hoverStretchY: 0.0,
    breathSpeed: 1.2,
    breathAmount: 0.015,
  },

  // Rainbow effect
  rainbow: {
    cycleSpeed: 0.25,
    hueMultiplier: 0.2,
    smoothing: 0.05,
    innerGlow: {
      saturation: 0.9,
      lightness: 0.65,
      breathSpeed: 1.8,
      breathAmount: 0.08,
    },
    outerGlow: {
      hueOffsetBase: 25,
      hueOffsetVariance: 12,
      saturationBase: 0.85,
      saturationVariance: 0.1,
      lightnessBase: 0.65,
      lightnessVariance: 0.08,
    },
    coreGlow: {
      hueOffset: 40,
      saturation: 0.85,
      lightness: 0.65,
      breathSpeed: 1.5,
      breathAmount: 0.08,
    },
    rings: {
      hueOffsetBase: 20,
      hueOffsetVariance: 10,
      saturationBase: 0.8,
      saturationVariance: 0.1,
      opacityMultiplier: 2.0,
      opacityVariance: 0.3,
    },
    particles: {
      hueOffset: 80,
      saturation: 0.7,
      lightness: 0.65,
      opacity: 0.6,
      breathSpeed: 1.2,
      breathAmount: 0.15,
    },
  },
} as const;

export type SceneConfig = typeof SCENE_CONFIG;
