import * as THREE from 'three';

/**
 * Procedural texture generator for Pathein, Myanmar
 * Generates Burmese signboards, authentic Pathein umbrella canopies, pagoda gold leaf, and pavements.
 */

// Cache textures to prevent repeated canvas drawing
const textureCache = new Map<string, THREE.Texture>();

/**
 * Creates authentic Pathein Umbrella (ပုသိမ်ထီး) canopy texture
 * Traditional Pathein umbrellas feature vibrant radial flower patterns, lotus motifs, and golden leaf accents.
 */
export function createPatheinUmbrellaTexture(colorTheme: 'ruby' | 'gold' | 'emerald' | 'sapphire' | 'violet' = 'ruby'): THREE.CanvasTexture {
  const cacheKey = `umbrella_${colorTheme}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;

  // Color schemes
  const themes = {
    ruby: { base: '#b91c1c', sec: '#ef4444', ring: '#f59e0b', petal: '#fde047', rim: '#7f1d1d' },
    gold: { base: '#d97706', sec: '#f59e0b', ring: '#fef08a', petal: '#ffffff', rim: '#92400e' },
    emerald: { base: '#047857', sec: '#10b981', ring: '#fde047', petal: '#a7f3d0', rim: '#064e3b' },
    sapphire: { base: '#1d4ed8', sec: '#3b82f6', ring: '#fbbf24', petal: '#93c5fd', rim: '#1e3a8a' },
    violet: { base: '#7c3aed', sec: '#a855f7', ring: '#facc15', petal: '#e9d5ff', rim: '#581c87' },
  };
  const theme = themes[colorTheme];

  // Base background
  ctx.fillStyle = theme.base;
  ctx.fillRect(0, 0, 512, 512);

  // Radial spokes / ribs
  const spokes = 24;
  for (let i = 0; i < spokes; i++) {
    const angle = (i * Math.PI * 2) / spokes;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 256, cy + Math.sin(angle) * 256);
    ctx.stroke();

    // Bamboo rib highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 256, cy + Math.sin(angle) * 256);
    ctx.stroke();
  }

  // Concentric colored rings
  const rings = [240, 200, 150, 95, 45];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? theme.ring : theme.sec;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Lotus petal ring (traditional Myanmar kanote motif)
  const petals = 16;
  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    const px = cx + Math.cos(angle) * 125;
    const py = cy + Math.sin(angle) * 125;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);

    ctx.fillStyle = theme.petal;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = theme.ring;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Outer border scallops
  const outerPetals = 32;
  for (let i = 0; i < outerPetals; i++) {
    const angle = (i * Math.PI * 2) / outerPetals;
    const px = cx + Math.cos(angle) * 220;
    const py = cy + Math.sin(angle) * 220;

    ctx.fillStyle = theme.ring;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center hub ornament (traditional wooden finial top)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates authentic Myanmar Signboards with Burmese script and decorative borders
 */
export function createBurmeseSignboardTexture(
  mainText: string,
  subText: string,
  bgColor: string = '#851c1c',
  textColor: string = '#fef08a',
  borderColor: string = '#fbbf24'
): THREE.CanvasTexture {
  const cacheKey = `sign_${mainText}_${bgColor}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1024, 320);

  // Traditional Myanmar decorative double border with ornamental corners
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 1024 - 32, 320 - 32);

  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 1024 - 56, 320 - 56);

  // Corner floral accents
  const corners = [
    { x: 30, y: 30 },
    { x: 1024 - 30, y: 30 },
    { x: 30, y: 320 - 30 },
    { x: 1024 - 30, y: 320 - 30 },
  ];
  corners.forEach(c => {
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  // Text Rendering
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Burmese Main Text
  ctx.font = 'bold 56px "Noto Sans Myanmar", "Padauk", sans-serif';
  ctx.fillStyle = textColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.shadowBlur = 6;
  ctx.fillText(mainText, 512, 125);

  // Subtext / English or secondary detail
  ctx.font = '600 32px "Plus Jakarta Sans", "Noto Sans Myanmar", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText(subText, 512, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Pagoda Golden Leaf & Kanote relief pattern texture
 */
export function createPagodaGoldTexture(): THREE.CanvasTexture {
  const cacheKey = 'pagoda_gold';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Gold gradient background
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#fcd34d');
  grad.addColorStop(0.3, '#fbbf24');
  grad.addColorStop(0.7, '#d97706');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle gold leaf tile grid (traditional shwe-chaing leaves)
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.35)';
  ctx.lineWidth = 2;
  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      ctx.strokeRect(x, y, tileSize, tileSize);
      // Small sparkle in each leaf
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x + 4, y + 4, tileSize / 2, tileSize / 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Walkway Stone Tile Texture (used for Pagoda Courtyard and Riverfront Promenade)
 */
export function createStonePavingTexture(isMarble: boolean = false): THREE.CanvasTexture {
  const cacheKey = `stone_${isMarble ? 'marble' : 'granite'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isMarble ? '#f8fafc' : '#71717a';
  ctx.fillRect(0, 0, 512, 512);

  const size = 64;
  for (let x = 0; x < 512; x += size) {
    for (let y = 0; y < 512; y += size) {
      // Subtle color variation per tile
      const variance = (Math.random() - 0.5) * 15;
      if (isMarble) {
        ctx.fillStyle = `rgb(${245 + variance}, ${245 + variance}, ${240 + variance})`;
      } else {
        ctx.fillStyle = `rgb(${110 + variance}, ${110 + variance}, ${115 + variance})`;
      }
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

      // Mortar seam
      ctx.strokeStyle = isMarble ? '#cbd5e1' : '#3f3f46';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);

      // Lotus petal corner stamp for Pagoda marble tiles
      if (isMarble && (x / size + y / size) % 2 === 0) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Longyi / Myanmar traditional textile pattern
 */
export function createLongyiTexture(colorBase: string = '#1e3a8a'): THREE.CanvasTexture {
  const cacheKey = `longyi_${colorBase}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorBase;
  ctx.fillRect(0, 0, 256, 256);

  // Traditional Myanmar check / stripe pattern (လုံချည် ကွက်စိပ်)
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 256; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}
