import * as THREE from 'three';

/**
 * Small procedural canvas textures, generated at runtime: no image files to download,
 * no external hosts. Each returns a repeat-wrapped sRGB (or linear, for normals) texture.
 */

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

/** Deterministic pseudo-random generator so textures look identical on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function finish(c: HTMLCanvasElement, repeat: [number, number], color = true): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 4;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Travertine: warm stone with long horizontal veins and coursed joints. */
export function travertineTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512);
  const r = rng(7);
  g.fillStyle = '#e4d8c3';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const y = r() * 512;
    g.strokeStyle = `rgba(${150 + r() * 40}, ${125 + r() * 30}, ${95 + r() * 25}, ${0.05 + r() * 0.12})`;
    g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 1.5 + (r() - 0.5) * 2);
    g.stroke();
  }
  // Pores
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(140, 115, 85, ${0.12 + r() * 0.2})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 3, 0.6 + r());
  }
  // Coursed joints: 4 courses, staggered vertical joints
  g.strokeStyle = 'rgba(120, 100, 75, 0.45)';
  g.lineWidth = 1.5;
  for (let row = 0; row < 4; row++) {
    const y = row * 128;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
    for (let x = row % 2 ? 128 : 0; x < 512; x += 256) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x, y + 128);
      g.stroke();
    }
  }
  return finish(c, [1, 1]);
}

/** Large-format limestone paving with fine joints. */
export function pavingTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512);
  const r = rng(11);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 2; x++) {
      const tone = 222 + r() * 14;
      g.fillStyle = `rgb(${tone}, ${tone - 6}, ${tone - 16})`;
      g.fillRect(x * 256, y * 128, 256, 128);
    }
  }
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = `rgba(150, 135, 110, ${r() * 0.12})`;
    g.fillRect(r() * 512, r() * 512, 2, 2);
  }
  g.strokeStyle = 'rgba(140, 125, 100, 0.55)';
  g.lineWidth = 2;
  for (let y = 0; y <= 512; y += 128) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  }
  for (let x = 0; x <= 512; x += 256) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  return finish(c, [1, 1]);
}

/** Dry Mediterranean lawn: olive-green noise with lighter patches. */
export function lawnTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256);
  const r = rng(23);
  g.fillStyle = '#7d8a5a';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const t = r();
    g.fillStyle = t > 0.6 ? `rgba(160, 165, 105, ${r() * 0.5})` : `rgba(80, 95, 55, ${r() * 0.5})`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  return finish(c, [6, 6]);
}

/** Tileable normal map of soft crossing ripples, scrolled over time for the pool surface. */
export function waterNormalTexture(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const dx = Math.cos(u * 3 + v) * 0.35 + Math.cos(u * 5 - v * 2) * 0.15;
      const dy = Math.cos(v * 4 + u) * 0.35 + Math.sin(v * 2 - u * 3) * 0.15;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Soil strata for the cut faces of the model base. */
export function strataTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256);
  const r = rng(31);
  const bands = [
    ['#6f7350', 0.12],
    ['#8b7a5e', 0.18],
    ['#a48f70', 0.22],
    ['#bfae8f', 0.2],
    ['#cfc2a6', 0.28],
  ] as const;
  let y = 0;
  for (const [color, h] of bands) {
    const px = h * 256;
    g.fillStyle = color;
    g.fillRect(0, y, 256, px + 1);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(60, 50, 35, ${r() * 0.16})`;
      g.fillRect(r() * 256, y + r() * px, 1 + r() * 4, 1 + r() * 2);
    }
    y += px;
  }
  const tex = finish(c, [4, 1]);
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
