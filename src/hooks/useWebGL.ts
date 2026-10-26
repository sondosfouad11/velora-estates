import { useEffect, useState } from 'react';

let cached: boolean | null = null;

/** True when a WebGL2 (or WebGL1) context can be created. Cached after the first check. */
export function detectWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

/** null while unknown (first render), then true/false. URL flag ?webgl=off forces the fallback for testing. */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const forcedOff = new URLSearchParams(window.location.search).get('webgl') === 'off';
    setSupported(forcedOff ? false : detectWebGL());
  }, []);
  return supported;
}
