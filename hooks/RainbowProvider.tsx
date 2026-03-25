'use client';

import { useRainbowSync } from './useRainbowSync';

export function RainbowProvider() {
  useRainbowSync();
  return null;
}
