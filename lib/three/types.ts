export interface ThreeSceneHandle {
  setHover: (active: boolean) => void;
  setTransition: (progress: number) => void;
  /** Set the raw multi-view target: 0=hero, 0.5=features, 1=branches */
  setViewTarget: (target: number) => void;
  hueRef: React.MutableRefObject<number>;
}
