// Element creation functions for Three.js scene

import * as THREE from 'three';
import { SCENE_CONFIG } from './sceneConfig';

export interface GlowLayer {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  speed: number;
  phase: number;
}

/**
 * Create the scene with camera and renderer
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
 * Add lights to the scene
 */
export function addLights(scene: THREE.Scene): void {
  const { ambient, point1, point2, point3 } = SCENE_CONFIG.lights;
  
  const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
  scene.add(ambientLight);
  
  const p1 = new THREE.PointLight(point1.color, point1.intensity, point1.distance);
  p1.position.set(...(point1.position as [number, number, number]));
  scene.add(p1);
  
  const p2 = new THREE.PointLight(point2.color, point2.intensity, point2.distance);
  p2.position.set(...(point2.position as [number, number, number]));
  scene.add(p2);
  
  const p3 = new THREE.PointLight(point3.color, point3.intensity, point3.distance);
  p3.position.set(...(point3.position as [number, number, number]));
  scene.add(p3);
}

/**
 * Create the island group with pill body and inner glow
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
  
  // Pill body
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
  
  // Inner glow
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
 * Create outer glow layers
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
 * Create orbit rings
 */
export function createOrbitRings(group: THREE.Group): THREE.Mesh[] {
  const { radii, colors, opacities, rotations } = SCENE_CONFIG.orbitRings;
  const rings: THREE.Mesh[] = [];
  
  radii.forEach((radius, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i],
      transparent: true,
      opacity: opacities[i],
    });
    
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        radius,
        SCENE_CONFIG.orbitRings.tubeRadius,
        SCENE_CONFIG.orbitRings.tubeSegments,
        SCENE_CONFIG.orbitRings.radialSegments
      ),
      mat
    );
    
    ring.rotation.set(rotations[i].x, rotations[i].y, rotations[i].z);
    group.add(ring);
    rings.push(ring);
  });
  
  return rings;
}

/**
 * Create floating accent dots
 */
export function createFloatingDots(group: THREE.Group): void {
  const { colors, baseSize, sizeIncrement, segments, positions } = SCENE_CONFIG.floatingDots;
  
  positions.forEach((pos, i) => {
    const geo = new THREE.SphereGeometry(baseSize + (i % 3) * sizeIncrement, segments, segments);
    const mat = new THREE.MeshBasicMaterial({ color: colors[i % 3] });
    const dot = new THREE.Mesh(geo, mat);
    dot.position.set(pos[0], pos[1], pos[2]);
    group.add(dot);
  });
}

/**
 * Create core glow sphere
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
 * Create background particles
 */
export function createParticles(scene: THREE.Scene): {
  points: THREE.Points;
  mat: THREE.PointsMaterial;
} {
  const { count, minRadius, maxRadius, size, baseColor, baseOpacity } = SCENE_CONFIG.particles;
  const positions = new Float32Array(count * 3);
  
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
 * Create mouse tracking state
 */
export function createMouseTracker(): {
  mouse: { x: number; y: number };
  onMouseMove: (e: MouseEvent) => void;
} {
  const mouse = { x: 0, y: 0 };
  
  const onMouseMove = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  
  return { mouse, onMouseMove };
}

/**
 * Create animation state
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
