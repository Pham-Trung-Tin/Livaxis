import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeBackground } from '@imgly/background-removal';

/* ═══════════════════════════════════════════════════════════════════ */
/* Style Presets & Catalog Data */
/* ═══════════════════════════════════════════════════════════════════ */

const stylePresets: Record<string, string> = {
  modern: "Modern luxury living room, realistic lighting, keep room structure unchanged",
  scandinavian: "Scandinavian design, warm wood floor, clean cozy look, plants and natural light",
  minimalist: "Minimalist interior, clean light beige plaster walls, highly structured, minimal noise",
  industrial: "Industrial loft style, exposed red brick wall, metal elements, dark concrete floor, warm lighting",
  japandi: "Japandi interior, zen aesthetic, fusion of Japanese and Scandinavian style, clean lines, organic textures"
};

type CatalogProduct = {
  id: string;
  name: string;
  type: string;
  color: string;
  accent: string;
  baseScale: number;
  note: string;
  imagePath: string;
  removeBackground?: boolean;
  isDbProduct?: boolean;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) => void;
};

const catalog: CatalogProduct[] = [
  {
    id: "oak-table",
    name: "Oak dining table",
    type: "Table",
    color: "#8b6545",
    accent: "#4f3828",
    baseScale: 0.26,
    note: "The table sits near the strongest floor line so the room still feels open.",
    imagePath: "assets/oak_table.png",
    draw: drawTable,
  },
  {
    id: "lounge-chair",
    name: "Lounge chair",
    type: "Chair",
    color: "#8f7f72",
    accent: "#5d3f2c",
    baseScale: 0.18,
    note: "The chair adds a warm accent and faces the room center.",
    imagePath: "assets/lounge_chair.png",
    draw: drawChair,
  },
  {
    id: "linen-sofa",
    name: "Linen sofa",
    type: "Sofa",
    color: "#756a5f",
    accent: "#5b3a27",
    baseScale: 0.34,
    note: "The sofa anchors the largest wall area without covering the window.",
    imagePath: "assets/linen_sofa.png",
    draw: drawSofa,
  },
  {
    id: "coffee-table",
    name: "Round coffee table",
    type: "Table",
    color: "#7a573a",
    accent: "#4b3222",
    baseScale: 0.18,
    note: "The coffee table is placed low to preserve walking space.",
    imagePath: "assets/coffee_table.png",
    draw: drawCoffeeTable,
  },
  {
    id: "floor-lamp",
    name: "Arched floor lamp",
    type: "Lighting",
    color: "#26312f",
    accent: "#f2cf74",
    baseScale: 0.22,
    note: "The lamp creates a secondary light source for a more finished look.",
    imagePath: "assets/floor_lamp.png",
    removeBackground: true,
    draw: drawLamp,
  },
  {
    id: "leaf-plant",
    name: "Leaf plant",
    type: "Decor",
    color: "#4f7f52",
    accent: "#8b5f3b",
    baseScale: 0.16,
    note: "The plant softens the corner and balances the furniture volume.",
    imagePath: "assets/leaf_plant.png",
    removeBackground: true,
    draw: drawPlant,
  },
];

/* ═══════════════════════════════════════════════════════════════════ */
/* Helper Functions for Drawing (Ported 1:1 from EXE app.js) */
/* ═══════════════════════════════════════════════════════════════════ */

function drawTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  const w = size * 1.1;
  const h = size * 0.28;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = product.accent;
  drawTaperedLeg(ctx, -w * 0.38, -h * 0.02, -w * 0.45, size * 0.34, size * 0.035);
  drawTaperedLeg(ctx, w * 0.38, -h * 0.02, w * 0.45, size * 0.34, size * 0.035);
  drawTaperedLeg(ctx, -w * 0.18, h * 0.03, -w * 0.16, size * 0.31, size * 0.03);
  drawTaperedLeg(ctx, w * 0.18, h * 0.03, w * 0.16, size * 0.31, size * 0.03);
  ctx.fillStyle = product.color;
  roundRect(ctx, -w / 2, -h * 0.58, w, h, size * 0.04);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, -w * 0.42, -h * 0.48, w * 0.84, h * 0.16, size * 0.025);
  ctx.fill();
  ctx.restore();
}

function drawChair(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = product.accent;
  drawTaperedLeg(ctx, -size * 0.25, -size * 0.05, -size * 0.31, size * 0.42, size * 0.025);
  drawTaperedLeg(ctx, size * 0.25, -size * 0.05, size * 0.31, size * 0.42, size * 0.025);
  drawTaperedLeg(ctx, -size * 0.12, -size * 0.02, -size * 0.13, size * 0.36, size * 0.02);
  drawTaperedLeg(ctx, size * 0.12, -size * 0.02, size * 0.13, size * 0.36, size * 0.02);
  ctx.fillStyle = product.color;
  roundRect(ctx, -size * 0.34, -size * 0.48, size * 0.68, size * 0.48, size * 0.08);
  ctx.fill();
  roundRect(ctx, -size * 0.42, -size * 0.78, size * 0.84, size * 0.36, size * 0.12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  roundRect(ctx, -size * 0.25, -size * 0.7, size * 0.5, size * 0.08, size * 0.03);
  ctx.fill();
  ctx.restore();
}

function drawSofa(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = product.accent;
  drawTaperedLeg(ctx, -size * 0.52, -size * 0.03, -size * 0.56, size * 0.22, size * 0.025);
  drawTaperedLeg(ctx, size * 0.52, -size * 0.03, size * 0.56, size * 0.22, size * 0.025);
  ctx.fillStyle = product.color;
  roundRect(ctx, -size * 0.72, -size * 0.44, size * 1.44, size * 0.48, size * 0.08);
  ctx.fill();
  roundRect(ctx, -size * 0.66, -size * 0.72, size * 1.32, size * 0.34, size * 0.11);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.26)";
  roundRect(ctx, -size * 0.55, -size * 0.34, size * 0.46, size * 0.24, size * 0.06);
  ctx.fill();
  roundRect(ctx, size * 0.1, -size * 0.34, size * 0.46, size * 0.24, size * 0.06);
  ctx.fill();
  ctx.restore();
}

function drawCoffeeTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = product.accent;
  drawTaperedLeg(ctx, -size * 0.28, -size * 0.03, -size * 0.33, size * 0.24, size * 0.022);
  drawTaperedLeg(ctx, size * 0.28, -size * 0.03, size * 0.33, size * 0.24, size * 0.022);
  ctx.fillStyle = product.color;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.16, size * 0.48, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.12, -size * 0.21, size * 0.22, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = product.color;
  ctx.lineWidth = size * 0.035;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.16, -size * 1.18, size * 0.38, -size * 1.32);
  ctx.stroke();
  ctx.fillStyle = product.color;
  ctx.beginPath();
  ctx.ellipse(-size * 0.18, size * 0.08, size * 0.26, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = product.accent;
  roundRect(ctx, size * 0.2, -size * 1.36, size * 0.34, size * 0.22, size * 0.08);
  ctx.fill();
  ctx.fillStyle = "rgba(242,207,116,0.2)";
  ctx.beginPath();
  ctx.ellipse(size * 0.37, -size * 1.16, size * 0.32, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = product.accent;
  roundRect(ctx, -size * 0.2, -size * 0.18, size * 0.4, size * 0.28, size * 0.04);
  ctx.fill();
  ctx.fillStyle = product.color;
  drawLeaf(ctx, -size * 0.14, -size * 0.52, size * 0.32, -0.8);
  drawLeaf(ctx, size * 0.1, -size * 0.64, size * 0.36, 0.7);
  drawLeaf(ctx, -size * 0.02, -size * 0.84, size * 0.42, -0.1);
  drawLeaf(ctx, -size * 0.24, -size * 0.78, size * 0.34, -1.1);
  drawLeaf(ctx, size * 0.23, -size * 0.82, size * 0.33, 1.05);
  ctx.strokeStyle = "#31583a";
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.18);
  ctx.lineTo(0, -size * 0.95);
  ctx.stroke();
  ctx.restore();
}

function drawTaperedLeg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) {
  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotate: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.28, size * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

type ProductImageCacheValue = HTMLImageElement | HTMLCanvasElement | "loading" | null;
type ProductCutoutCacheValue =
  | { status: "loading"; promise: Promise<string | null> }
  | { status: "ready"; dataUrl: string }
  | { status: "failed"; reason?: string };

const imageCache: Record<string, ProductImageCacheValue> = {};
const imageLoadPromises: Record<string, Promise<void> | undefined> = {};
const productCutoutCache: Record<string, ProductCutoutCacheValue | undefined> = {};
const alphaCanvasCache = new WeakMap<HTMLImageElement | HTMLCanvasElement, HTMLCanvasElement | null>();

function getProductRatios(product: CatalogProduct) {
  const fixedRatios = ({
    "oak-table": { w: 1.2, h: 0.58, top: 0.54 },
    "lounge-chair": { w: 0.9, h: 1.08, top: 1.02 },
    "linen-sofa": { w: 1.45, h: 0.72, top: 0.64 },
    "coffee-table": { w: 1.05, h: 0.45, top: 0.38 },
    "floor-lamp": { w: 0.86, h: 1.82, top: 1.72 },
    "leaf-plant": { w: 0.9, h: 1.42, top: 1.34 },
  } as Record<string, { w: number; h: number; top: number }>)[product.id];

  if (fixedRatios) return fixedRatios;

  const descriptor = `${product.type} ${product.name}`.toLowerCase();

  if (descriptor.includes("sofa") || descriptor.includes("chaise")) {
    return { w: 1.45, h: 0.72, top: 0.64 };
  }
  if (descriptor.includes("chair") || descriptor.includes("seat") || descriptor.includes("lounge")) {
    return { w: 0.9, h: 1.08, top: 1.02 };
  }
  if (descriptor.includes("coffee")) {
    return { w: 1.05, h: 0.45, top: 0.38 };
  }
  if (descriptor.includes("table") || descriptor.includes("dining")) {
    return { w: 1.2, h: 0.58, top: 0.54 };
  }
  if (descriptor.includes("lamp") || descriptor.includes("light") || descriptor.includes("pendant")) {
    return { w: 0.86, h: 1.35, top: 1.25 };
  }
  if (descriptor.includes("plant") || descriptor.includes("decor")) {
    return { w: 0.9, h: 1.42, top: 1.34 };
  }
  if (descriptor.includes("storage") || descriptor.includes("shelf")) {
    return { w: 1.0, h: 1.35, top: 1.28 };
  }

  return { w: 1, h: 1, top: 1 };
}

function colorDistance(data: Uint8ClampedArray, index: number, sample: [number, number, number]) {
  const dr = data[index] - sample[0];
  const dg = data[index + 1] - sample[1];
  const db = data[index + 2] - sample[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function trimTransparentPixels(source: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = source.getContext("2d");
  if (!ctx) return source;

  const { width, height } = source;
  const data = ctx.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 18) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) return source;

  const padding = Math.max(4, Math.round(Math.min(width, height) * 0.025));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const trimmedWidth = right - left + 1;
  const trimmedHeight = bottom - top + 1;
  if (trimmedWidth >= width * 0.98 && trimmedHeight >= height * 0.98) return source;

  const trimmed = document.createElement("canvas");
  trimmed.width = trimmedWidth;
  trimmed.height = trimmedHeight;
  const trimmedCtx = trimmed.getContext("2d");
  if (!trimmedCtx) return source;
  trimmedCtx.drawImage(source, left, top, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
  return trimmed;
}

function getOpaquePixelRatio(source: HTMLCanvasElement): number {
  const ctx = source.getContext("2d");
  if (!ctx) return 1;

  const { width, height } = source;
  if (!width || !height) return 0;

  const data = ctx.getImageData(0, 0, width, height).data;
  let opaque = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 24) opaque += 1;
  }

  return opaque / (width * height);
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0);
  }
  return canvas;
}

function makeImageTransparent(img: HTMLImageElement): HTMLCanvasElement {
  const originalCanvas = imageToCanvas(img);
  const canvas = imageToCanvas(img);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const { width, height } = canvas;

  // ── Step 1: Collect edge samples (all 4 borders, not just 4 corners) ──
  const edgeSamples: Array<[number, number, number]> = [];
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 40));

  // Top & bottom edges
  for (let x = 0; x < width; x += sampleStep) {
    const topIdx = x * 4;
    const botIdx = ((height - 1) * width + x) * 4;
    if (data[topIdx + 3] > 20) edgeSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
    if (data[botIdx + 3] > 20) edgeSamples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
  }
  // Left & right edges
  for (let y = 0; y < height; y += sampleStep) {
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + width - 1) * 4;
    if (data[leftIdx + 3] > 20) edgeSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
    if (data[rightIdx + 3] > 20) edgeSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
  }

  if (edgeSamples.length === 0) return originalCanvas;

  // ── Step 2: K-means clustering to find dominant bg colors (max 4 clusters) ──
  const kmeansIterations = 8;
  const k = Math.min(4, edgeSamples.length);
  let centroids: Array<[number, number, number]> = edgeSamples
    .slice(0, k)
    .map((s) => [...s] as [number, number, number]);

  for (let iter = 0; iter < kmeansIterations; iter++) {
    const sums = centroids.map(() => [0, 0, 0, 0] as [number, number, number, number]); // r, g, b, count
    for (const sample of edgeSamples) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dr = sample[0] - centroids[c][0];
        const dg = sample[1] - centroids[c][1];
        const db = sample[2] - centroids[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDist) { bestDist = d; bestIdx = c; }
      }
      sums[bestIdx][0] += sample[0];
      sums[bestIdx][1] += sample[1];
      sums[bestIdx][2] += sample[2];
      sums[bestIdx][3] += 1;
    }
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c][3] > 0) {
        centroids[c] = [
          Math.round(sums[c][0] / sums[c][3]),
          Math.round(sums[c][1] / sums[c][3]),
          Math.round(sums[c][2] / sums[c][3]),
        ];
      }
    }
  }

  // Remove duplicate/near-identical centroids
  const uniqueCentroids: Array<[number, number, number]> = [centroids[0]];
  for (let c = 1; c < centroids.length; c++) {
    const isDuplicate = uniqueCentroids.some((uc) => {
      const dr = uc[0] - centroids[c][0];
      const dg = uc[1] - centroids[c][1];
      const db = uc[2] - centroids[c][2];
      return Math.sqrt(dr * dr + dg * dg + db * db) < 25;
    });
    if (!isDuplicate) uniqueCentroids.push(centroids[c]);
  }
  centroids = uniqueCentroids;

  // ── Step 3: Adaptive threshold based on edge color variance ──
  let totalVariance = 0;
  for (const sample of edgeSamples) {
    let minDist = Infinity;
    for (const c of centroids) {
      const dr = sample[0] - c[0]; const dg = sample[1] - c[1]; const db = sample[2] - c[2];
      minDist = Math.min(minDist, Math.sqrt(dr * dr + dg * dg + db * db));
    }
    totalVariance += minDist;
  }
  const avgVariance = totalVariance / edgeSamples.length;
  // Higher variance → need higher threshold, but cap it
  const baseThreshold = Math.min(72, Math.max(38, 45 + avgVariance * 0.8));

  // ── Step 4: Flood fill from edges with adaptive matching ──
  const visited = new Uint8Array(width * height);
  const background = new Uint8Array(width * height);

  const matchesBackground = (pixelIndex: number, threshold: number) => {
    const di = pixelIndex * 4;
    if (data[di + 3] < 12) return true;
    // Pure white detection
    if (data[di] > 244 && data[di + 1] > 244 && data[di + 2] > 244) return true;
    // Near-black detection (common studio background)
    if (data[di] < 12 && data[di + 1] < 12 && data[di + 2] < 12) return true;
    return centroids.some((c) => colorDistance(data, di, c) < threshold);
  };

  const stack: number[] = [];
  const pushSeed = (x: number, y: number) => {
    const index = y * width + x;
    if (!visited[index] && matchesBackground(index, baseThreshold)) stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    pushSeed(x, 0);
    pushSeed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    pushSeed(0, y);
    pushSeed(width - 1, y);
  }

  while (stack.length) {
    const pixelIndex = stack.pop()!;
    if (visited[pixelIndex]) continue;
    visited[pixelIndex] = 1;
    if (!matchesBackground(pixelIndex, baseThreshold)) continue;

    background[pixelIndex] = 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    if (x > 0) stack.push(pixelIndex - 1);
    if (x < width - 1) stack.push(pixelIndex + 1);
    if (y > 0) stack.push(pixelIndex - width);
    if (y < height - 1) stack.push(pixelIndex + width);
  }

  // ── Step 5: Set background pixels transparent ──
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    if (background[pixelIndex]) {
      data[i + 3] = 0;
    }
  }

  // ── Step 6: Multi-layer alpha matting at edges (smooth gradient, not sharp cutoff) ──
  const mattingRadius = 3;
  const alphaBuffer = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alphaBuffer[i] = data[i * 4 + 3];
  }

  for (let y = mattingRadius; y < height - mattingRadius; y++) {
    for (let x = mattingRadius; x < width - mattingRadius; x++) {
      const pixelIndex = y * width + x;
      if (background[pixelIndex]) continue; // already transparent

      // Count background neighbors in a radius
      let bgCount = 0;
      let totalCount = 0;
      for (let dy = -mattingRadius; dy <= mattingRadius; dy++) {
        for (let dx = -mattingRadius; dx <= mattingRadius; dx++) {
          const ni = (y + dy) * width + (x + dx);
          totalCount++;
          if (background[ni]) bgCount++;
        }
      }

      if (bgCount > 0) {
        // Pixel is near background edge → gradually fade alpha
        const bgRatio = bgCount / totalCount;
        const newAlpha = alphaBuffer[pixelIndex] * (1 - bgRatio * 0.85);
        alphaBuffer[pixelIndex] = Math.max(0, newAlpha);
      }
    }
  }

  // Write back smoothed alpha
  for (let i = 0; i < width * height; i++) {
    data[i * 4 + 3] = Math.round(alphaBuffer[i]);
  }

  // ── Step 7: Color decontamination at edges (remove bg color spill) ──
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = y * width + x;
      const di = pixelIndex * 4;
      const alpha = data[di + 3];
      if (alpha < 10 || alpha > 240) continue; // skip fully transparent or opaque

      // Check if this semi-transparent pixel's color is close to background
      let minBgDist = Infinity;
      for (const c of centroids) {
        minBgDist = Math.min(minBgDist, colorDistance(data, di, c));
      }

      if (minBgDist < baseThreshold * 0.7) {
        // This pixel has background color contamination; reduce its alpha further
        const factor = minBgDist / (baseThreshold * 0.7);
        data[di + 3] = Math.round(alpha * Math.max(0.1, factor));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const transparentCanvas = trimTransparentPixels(canvas);
  const opaqueRatio = getOpaquePixelRatio(transparentCanvas);

  if (opaqueRatio < 0.08 || transparentCanvas.width < 24 || transparentCanvas.height < 24) {
    return originalCanvas;
  }

  return transparentCanvas;
}

function getImageSize(image: HTMLImageElement | HTMLCanvasElement) {
  if (image instanceof HTMLCanvasElement) {
    return { width: image.width || 1, height: image.height || 1 };
  }

  return {
    width: image.naturalWidth || image.width || 1,
    height: image.naturalHeight || image.height || 1,
  };
}

function getProductImageRect(
  img: HTMLImageElement | HTMLCanvasElement,
  box: { width: number; height: number },
  offsetTop: number,
) {
  const imageSize = getImageSize(img);
  const imageRatio = imageSize.width / imageSize.height;
  const boxRatio = box.width / box.height;
  let drawW = box.width;
  let drawH = box.height;

  if (imageRatio > boxRatio) {
    drawH = drawW / imageRatio;
  } else {
    drawW = drawH * imageRatio;
  }

  return {
    x: -drawW / 2,
    y: -offsetTop + (box.height - drawH),
    width: drawW,
    height: drawH,
  };
}

function drawProductReferenceImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  box: { width: number; height: number },
  offsetTop: number,
) {
  const rect = getProductImageRect(img, box, offsetTop);
  ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
}

function getAlphaCanvas(img: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement | null {
  if (alphaCanvasCache.has(img)) return alphaCanvasCache.get(img) || null;

  if (img instanceof HTMLCanvasElement) {
    alphaCanvasCache.set(img, img);
    return img;
  }

  const size = getImageSize(img);
  if (!size.width || !size.height) {
    alphaCanvasCache.set(img, null);
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    alphaCanvasCache.set(img, null);
    return null;
  }

  try {
    ctx.drawImage(img, 0, 0, size.width, size.height);
    ctx.getImageData(0, 0, 1, 1);
    alphaCanvasCache.set(img, canvas);
    return canvas;
  } catch {
    alphaCanvasCache.set(img, null);
    return null;
  }
}

function hasVisibleProductPixel(
  img: HTMLImageElement | HTMLCanvasElement,
  sourceX: number,
  sourceY: number,
) {
  const alphaCanvas = getAlphaCanvas(img);
  if (!alphaCanvas) return true;

  const x = Math.floor(sourceX);
  const y = Math.floor(sourceY);
  if (x < 0 || y < 0 || x >= alphaCanvas.width || y >= alphaCanvas.height) return false;

  const ctx = alphaCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;

  try {
    return ctx.getImageData(x, y, 1, 1).data[3] > 48;
  } catch {
    return true;
  }
}

function shouldUseServerCutout(product: CatalogProduct) {
  return Boolean(
    product.isDbProduct &&
      product.removeBackground &&
      product.imagePath &&
      /^https?:\/\//i.test(product.imagePath)
  );
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function removeBgWithBrowserAI(imageUrl: string): Promise<string> {
  const blob = await removeBackground(imageUrl);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

function requestProductCutout(product: CatalogProduct, triggerRender: () => void): Promise<string | null> {
  const existing = productCutoutCache[product.id];
  if (existing?.status === "ready") return Promise.resolve(existing.dataUrl);
  if (existing?.status === "failed") return Promise.resolve(null);
  if (existing?.status === "loading") return existing.promise;

  const promise = (async () => {
    // Primary: Browser-based AI removal (FREE, no API credits)
    try {
      console.log(`[RemoveBG] Using browser AI for: ${product.name}`);
      const dataUrl = await removeBgWithBrowserAI(product.imagePath);
      console.log(`[RemoveBG] Browser AI success for: ${product.name}`);
      return dataUrl;
    } catch (browserErr) {
      console.warn(`[RemoveBG] Browser AI failed for ${product.name}:`, browserErr);
    }

    // Fallback: Server-side removal (uses Replicate credits)
    try {
      const response = await fetch("/api/ai-room-planner/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: product.imagePath }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success && result?.data?.imageDataUrl) {
        return result.data.imageDataUrl as string;
      }
    } catch (serverErr) {
      console.warn(`[RemoveBG] Server fallback failed for ${product.name}:`, serverErr);
    }

    throw new Error("All background removal methods failed");
  })()
    .then((dataUrl) => {
      productCutoutCache[product.id] = { status: "ready", dataUrl };
      delete imageCache[product.id];
      delete imageLoadPromises[product.id];
      return dataUrl;
    })
    .catch((error) => {
      console.warn("Product background removal failed:", error);
      productCutoutCache[product.id] = {
        status: "failed",
        reason: error instanceof Error ? error.message : "Unknown error",
      };
      return null;
    })
    .finally(() => {
      triggerRender();
    });

  productCutoutCache[product.id] = { status: "loading", promise };
  return promise;
}

function loadProductImageFromSource(
  product: CatalogProduct,
  src: string,
  triggerRender: () => void,
  useBrowserTransparency: boolean,
): Promise<void> {
  if (imageLoadPromises[product.id]) {
    return imageLoadPromises[product.id]!;
  }

  imageCache[product.id] = "loading";
  const promise = loadImageElement(src)
    .then(async (img) => {
      if (useBrowserTransparency) {
        try {
          imageCache[product.id] = makeImageTransparent(img);
        } catch (e) {
          console.warn("Failed browser transparency (likely CORS):", e);
          // If the source is a remote URL and browser transparency failed (CORS),
          // try fetching through server proxy as a last resort
          if (/^https?:\/\//i.test(src)) {
            try {
              const proxyResponse = await fetch("/api/ai-room-planner/remove-background", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: src }),
              });
              const proxyResult = await proxyResponse.json().catch(() => ({}));
              if (proxyResponse.ok && proxyResult?.success && proxyResult?.data?.imageDataUrl) {
                const cutoutImg = await loadImageElement(proxyResult.data.imageDataUrl);
                imageCache[product.id] = cutoutImg;
                return;
              }
            } catch (proxyErr) {
              console.warn("Server proxy background removal also failed:", proxyErr);
            }
          }
          imageCache[product.id] = img;
        }
      } else {
        imageCache[product.id] = img;
      }
    })
    .catch((error) => {
      console.error(error);
      imageCache[product.id] = null;
    })
    .finally(() => {
      delete imageLoadPromises[product.id];
      triggerRender();
    });

  imageLoadPromises[product.id] = promise;
  return promise;
}


async function prepareProductImageForExport(product: CatalogProduct): Promise<void> {
  if (shouldUseServerCutout(product)) {
    // Always try to get the server cutout for export (best quality bg removal)
    const cutout = productCutoutCache[product.id];
    let cutoutDataUrl: string | null = null;

    if (cutout?.status === "ready") {
      cutoutDataUrl = cutout.dataUrl;
    } else if (cutout?.status === "loading") {
      cutoutDataUrl = await cutout.promise;
    } else if (!cutout) {
      cutoutDataUrl = await requestProductCutout(product, () => {});
    }

    if (cutoutDataUrl) {
      // Force reload from the clean cutout data URL
      delete imageCache[product.id];
      delete imageLoadPromises[product.id];
      await loadProductImageFromSource(product, cutoutDataUrl, () => {}, false);
    } else if (product.imagePath) {
      // Server cutout failed → use browser-side bg removal as fallback
      delete imageCache[product.id];
      delete imageLoadPromises[product.id];
      await loadProductImageFromSource(product, product.imagePath, () => {}, Boolean(product.removeBackground));
    }
  } else {
    const cached = imageCache[product.id];
    if (cached && cached !== "loading") return;

    if (imageLoadPromises[product.id]) {
      await imageLoadPromises[product.id];
    } else if (product.imagePath) {
      await loadProductImageFromSource(product, product.imagePath, () => {}, Boolean(product.removeBackground));
    }
  }

  const prepared = imageCache[product.id];
  if (!prepared || prepared === "loading") {
    throw new Error(`Could not load the exact product image for ${product.name}`);
  }
}

function getProductImage(product: CatalogProduct, triggerRender: () => void): HTMLImageElement | HTMLCanvasElement | null {
  if (product.id in imageCache) {
    const cached = imageCache[product.id];
    return !cached || cached === "loading" ? null : cached;
  }

  if (product.imagePath) {
    if (shouldUseServerCutout(product)) {
      const cutout = productCutoutCache[product.id];
      if (cutout?.status === "ready") {
        // Server cutout ready → load the clean cutout
        loadProductImageFromSource(product, cutout.dataUrl, triggerRender, false);
      } else if (cutout?.status === "failed") {
        // Server cutout failed → load raw image with browser-side bg removal
        loadProductImageFromSource(product, product.imagePath, triggerRender, Boolean(product.removeBackground));
      } else {
        // Server cutout still loading or not started → start it AND load raw image immediately
        // so product is visible right away. Don't apply browser-side transparency on photo
        // backgrounds (Unsplash etc.) — just show original; server cutout will upgrade later.
        if (!cutout) {
          requestProductCutout(product, triggerRender);
        }
        loadProductImageFromSource(product, product.imagePath, triggerRender, false);
      }
    } else {
      loadProductImageFromSource(product, product.imagePath, triggerRender, Boolean(product.removeBackground));
    }
  }
  return null;
}

function isProductImageReady(product: CatalogProduct) {
  const cached = imageCache[product.id];
  return Boolean(cached && cached !== "loading");
}

function mapApiProductToCatalogProduct(p: any): CatalogProduct {
  const cat = p.category || "Decor";
  const lowerCat = cat.toLowerCase();

  let drawFn = drawPlant;
  if (lowerCat.includes("sofa")) drawFn = drawSofa;
  else if (lowerCat.includes("chair") || lowerCat.includes("seat") || lowerCat.includes("lounge")) drawFn = drawChair;
  else if (lowerCat.includes("table") || lowerCat.includes("dining")) {
    drawFn = String(p.name || "").toLowerCase().includes("coffee") ? drawCoffeeTable : drawTable;
  } else if (lowerCat.includes("light") || lowerCat.includes("pendant")) drawFn = drawLamp;

  return {
    id: p._id || p.id || p.name,
    name: p.name,
    type: cat,
    color: p.colorHex || "#8f7f72",
    accent: "#4b3222",
    baseScale:
      lowerCat.includes("sofa") || lowerCat.includes("chaise")
        ? 0.34
        : lowerCat.includes("table") || lowerCat.includes("dining")
          ? 0.26
          : lowerCat.includes("light") || lowerCat.includes("pendant")
            ? 0.22
            : lowerCat.includes("storage") || lowerCat.includes("shelf")
              ? 0.24
              : 0.18,
    note: p.description || `A beautiful ${p.name} from Livaxis.`,
    imagePath: p.imageUrl,
    removeBackground: true,
    isDbProduct: true,
    draw: drawFn,
  };
}

async function fetchAllPlannerProducts(): Promise<CatalogProduct[]> {
  const pageSize = 100;
  const allItems: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(`/api/products?limit=${pageSize}&page=${page}`);
    const res = await response.json();
    if (!response.ok || !res.success) {
      throw new Error(res?.error?.message || "Failed to load products");
    }

    allItems.push(...(res.data?.items || []));
    totalPages = Math.max(1, Number(res.data?.pagination?.totalPages || 1));
    page += 1;
  } while (page <= totalPages);

  return allItems.length ? allItems.map(mapApiProductToCatalogProduct) : catalog;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* React Component */
/* ═══════════════════════════════════════════════════════════════════ */

export default function AIRoomPlanner() {
  const navigate = useNavigate();

  // Elements References
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States mirroring EXE app.js
  const [productsList, setProductsList] = useState<CatalogProduct[]>(catalog);
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const [roomDataUrl, setRoomDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("Sample room");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [placements, setPlacements] = useState<Map<string, any>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState({ width: 1280, height: 800 });
  const [sourceType, setSourceType] = useState("sample");
  const [compareMode, setCompareMode] = useState("compare");
  const [sliderPos, setSliderPos] = useState(48);
  const [globalScale, setGlobalScale] = useState(1);
  const [floorDepth, setFloorDepth] = useState(0.72);
  const [lightMatch, setLightMatch] = useState(true);
  const [stylePreset, setStylePreset] = useState("modern");
  const [pipelineMode, setPipelineMode] = useState("composite");
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastProvider, setLastProvider] = useState("local");
  const [lastGenerationMode, setLastGenerationMode] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(null);
  const [aiStatus, setAiStatus] = useState("Checking API");
  const [stylePrompt, setStylePrompt] = useState(stylePresets["modern"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preparingProductIds, setPreparingProductIds] = useState<Set<string>>(new Set());
  const [designerNotes, setDesignerNotes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastShow, setToastShow] = useState(false);

  // Dragging states
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const triggerRenderRef = useRef<(() => void) | null>(null);
  const isResultLocked = Boolean(lastGenerationMode || generatedImage);
  const isPreparingProducts = preparingProductIds.size > 0;

  // Fetch real database products on mount
  useEffect(() => {
    fetchAllPlannerProducts()
      .then((products) => {
        setProductsList(products.length ? products : catalog);
      })
      .catch((err) => {
        console.error("Failed to load real products, using fallback catalog:", err);
        setProductsList(catalog);
      });
  }, []);

  // Toast Helper
  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastShow(true);
  }, []);

  useEffect(() => {
    if (toastShow) {
      const t = setTimeout(() => setToastShow(false), 1900);
      return () => clearTimeout(t);
    }
  }, [toastShow]);

  // Check Backend Status on mount
  useEffect(() => {
    fetch("/api/ai-room-planner/status")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setBackendOnline(true);
          setLastProvider(res.data.provider || "mock-preview");
          setAiStatus(res.data.label || "Backend ready");
        } else {
          throw new Error("fail");
        }
      })
      .catch(() => {
        setBackendOnline(false);
        setLastProvider("browser-fallback");
        setAiStatus("Local preview");
      });
  }, []);

  // Sync Designer Notes
  useEffect(() => {
    const selectedProducts = productsList.filter((product) => selected.has(product.id));
    if (!selectedProducts.length) {
      const emptyMessage =
        sourceType === "upload"
          ? "Old demo selections were reset for this uploaded room. Choose the exact product you want to preview."
          : "Choose a catalog product to create an after preview.";
      setDesignerNotes([emptyMessage]);
      return;
    }

    const isComposite = pipelineMode === "composite";
    const notes = [
      backendOnline
        ? `Backend connected. Mode: ${isComposite ? "Smart AI Composite" : "Generative AI"}.`
        : `Browser Mode: Local ${isComposite ? "Composite" : "Generative (requires backend)"} Preview.`,
      isComposite
        ? "Smart AI Composite Mode is active: your selected furniture is blended directly into your original room to preserve your background 100% identically."
        : "Generative AI Mode is active: the AI will attempt to generate a photorealistic room around your selected products, which may alter the background.",
      lightMatch
        ? "Lighting match is enabled, so generated products receive soft shadows and a warm floor blend."
        : "Lighting match is disabled, so the output keeps stronger product contrast.",
      ...selectedProducts.map((product) => product.note),
    ];
    setDesignerNotes(notes);
  }, [selected, sourceType, pipelineMode, backendOnline, lightMatch]);

  // Drawing helpers
  const drawRoom = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!roomImage) return;
    const { width, height } = stage;
    ctx.save();
    ctx.fillStyle = "#101615";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(roomImage, 0, 0, width, height);
    ctx.restore();
  }, [roomImage, stage]);

  const drawAiLighting = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!lightMatch) return;
    const { width, height } = stage;

    ctx.save();
    // Layer 1: Warm fill light from upper area (simulates window light)
    const warmFill = ctx.createLinearGradient(width * 0.3, 0, width * 0.7, height);
    warmFill.addColorStop(0, "rgba(255,248,230,0.06)");
    warmFill.addColorStop(0.4, "rgba(255,240,210,0.08)");
    warmFill.addColorStop(0.8, "rgba(255,235,200,0.04)");
    warmFill.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = warmFill;
    ctx.fillRect(0, 0, width, height);

    // Layer 2: Soft-light color grading (warm mid, cool shadows)
    const colorGrade = ctx.createLinearGradient(0, height * 0.3, 0, height);
    colorGrade.addColorStop(0, "rgba(255,252,245,0.03)");
    colorGrade.addColorStop(0.5, "rgba(255,244,220,0.09)");
    colorGrade.addColorStop(1, "rgba(35,25,15,0.14)");
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = colorGrade;
    ctx.fillRect(0, 0, width, height);

    // Layer 3: Subtle contrast enhancement
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(128,128,128,0.04)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }, [lightMatch, stage]);

  const drawAfterVignette = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = stage;
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.58,
      height * 0.2,
      width * 0.5,
      height * 0.58,
      width * 0.78
    );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(14,20,18,0.18)");
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }, [stage]);

  const drawFallbackBadge = useCallback((ctx: CanvasRenderingContext2D) => {
    const label = "LOCAL PLACEMENT PREVIEW - AI API NOT CONNECTED";
    const padX = 18;
    const padY = 12;
    ctx.save();
    ctx.font = "700 20px Inter, Arial, sans-serif";
    const metrics = ctx.measureText(label);
    const width = metrics.width + padX * 2;
    const height = 44;
    ctx.fillStyle = "rgba(23, 33, 31, 0.78)";
    roundRect(ctx, 24, 24, width, height, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, 24 + padX, 24 + padY + 17);
    ctx.restore();
  }, []);

  const getProductBox = useCallback((product: CatalogProduct, placement: any) => {
    const size = stage.width * product.baseScale * globalScale * placement.scale;
    const x = stage.width * placement.x;
    const y = stage.height * placement.y;
    const ratios = getProductRatios(product);

    return {
      left: x - (size * ratios.w) / 2,
      top: y - size * ratios.top,
      right: x + (size * ratios.w) / 2,
      bottom: y + size * (ratios.h - ratios.top),
      width: size * ratios.w,
      height: size * ratios.h,
      cx: x,
    };
  }, [stage, globalScale]);

  const createPlacementMask = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = stage.width;
    canvas.height = stage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, stage.width, stage.height);

    productsList
      .filter((product) => selected.has(product.id))
      .forEach((product) => {
        const placement = placements.get(product.id);
        if (!placement) return;

        const box = getProductBox(product, placement);
        ctx.save();
        ctx.filter = "blur(18px)";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(
          box.cx,
          box.bottom + box.height * 0.08,
          box.width * 0.56,
          box.height * 0.16,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.filter = "blur(8px)";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(
          box.cx,
          box.bottom,
          box.width * 0.34,
          box.height * 0.07,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });

    return canvas.toDataURL("image/png");
  }, [stage, productsList, selected, placements, getProductBox]);

  const drawSelectionRing = useCallback((ctx: CanvasRenderingContext2D, box: any) => {
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.lineWidth = 3;
    roundRect(ctx, box.left - 8, box.top - 8, box.width + 16, box.height + 16, 12);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawFloorShadow = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();
    // Layer 1: Ambient occlusion shadow (wide, soft)
    const ambientGradient = ctx.createRadialGradient(x, y + h * 0.1, 0, x, y + h * 0.1, Math.max(w * 1.2, h * 2));
    ambientGradient.addColorStop(0, "rgba(0,0,0,0.12)");
    ambientGradient.addColorStop(0.5, "rgba(0,0,0,0.06)");
    ambientGradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ambientGradient;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.1, w * 0.7, h * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Contact shadow (tight, dark - directly under the product base)
    const contactGradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
    contactGradient.addColorStop(0, "rgba(0,0,0,0.35)");
    contactGradient.addColorStop(0.4, "rgba(0,0,0,0.18)");
    contactGradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = contactGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const drawPlacedProduct = useCallback((
    ctx: CanvasRenderingContext2D,
    product: CatalogProduct,
    renderTrigger: () => void,
    showSelection = true,
  ) => {
    const placement = placements.get(product.id);
    if (!placement) return;
    const size = stage.width * product.baseScale * globalScale * placement.scale;
    const x = stage.width * placement.x;
    const y = stage.height * placement.y;
    const box = getProductBox(product, placement);

    ctx.save();
    drawFloorShadow(ctx, box.cx, box.bottom, box.width * 0.78, box.height * 0.13);

    ctx.translate(x, y);
    if (placement.flipped) {
      ctx.scale(-1, 1);
    }
    if (placement.rotation) {
      ctx.rotate((placement.rotation * Math.PI) / 180);
    }

    const img = getProductImage(product, renderTrigger);

    if (!img) {
      product.draw(ctx, 0, 0, size, product);
      ctx.restore();
      if (showSelection && activeId === product.id) drawSelectionRing(ctx, box);
      return;
    }

    const offsetTop = size * getProductRatios(product).top;
    drawProductReferenceImage(ctx, img, box, offsetTop);

    ctx.restore();

    if (showSelection && activeId === product.id) drawSelectionRing(ctx, box);
  }, [placements, stage, globalScale, activeId, drawFloorShadow, getProductBox, drawSelectionRing]);

  const drawSelectedProducts = useCallback((
    ctx: CanvasRenderingContext2D,
    showSelection = true,
    renderTrigger = () => triggerRenderRef.current?.(),
  ) => {
    productsList
      .filter((product) => selected.has(product.id))
      .sort((a, b) => {
        const pa = placements.get(a.id) || { y: 0 };
        const pb = placements.get(b.id) || { y: 0 };
        return pa.y - pb.y;
      })
      .forEach((product) => {
        drawPlacedProduct(ctx, product, renderTrigger, showSelection);
      });
  }, [productsList, selected, placements, drawPlacedProduct]);

  // Combined Render
  const renderAll = useCallback(() => {
    if (!roomImage) return;
    const beforeCtx = beforeCanvasRef.current?.getContext("2d");
    const afterCtx = afterCanvasRef.current?.getContext("2d");
    if (!beforeCtx || !afterCtx) return;

    const { width, height } = stage;
    beforeCtx.clearRect(0, 0, width, height);
    afterCtx.clearRect(0, 0, width, height);

    drawRoom(beforeCtx);

    if (generatedImage) {
      afterCtx.drawImage(generatedImage, 0, 0, width, height);
      drawAfterVignette(afterCtx);
      return;
    }

    drawRoom(afterCtx);
    drawAiLighting(afterCtx);
    drawSelectedProducts(afterCtx, !isResultLocked);

    if (lastGenerationMode === "mock-preview" && selected.size > 0) {
      drawFallbackBadge(afterCtx);
    }

    drawAfterVignette(afterCtx);
  }, [roomImage, generatedImage, stage, drawRoom, drawAiLighting, drawAfterVignette, drawFallbackBadge, drawSelectedProducts, selected, lastGenerationMode, isResultLocked]);

  triggerRenderRef.current = renderAll;

  const loadGeneratedImage = useCallback((imageDataUrl: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load generated image"));
      image.src = imageDataUrl;
    });
  }, []);

  // React to canvas sizing & background image loading
  useEffect(() => {
    if (roomImage) {
      renderAll();
    }
  }, [roomImage, stage, selected, placements, globalScale, floorDepth, lightMatch, activeId, lastGenerationMode, renderAll]);

  // Load Sample Room
  const loadSampleRoom = useCallback(() => {
    const img = new Image();
    img.src = "assets/sample_room.png";
    img.onload = () => {
      setRoomImage(img);
      
      // Convert sample room image to Base64 Data URL so backend gets a valid image payload
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          setRoomDataUrl(canvas.toDataURL("image/png"));
        } catch (e) {
          console.warn("Failed to convert sample room to DataURL:", e);
          setRoomDataUrl("assets/sample_room.png");
        }
      } else {
        setRoomDataUrl("assets/sample_room.png");
      }

      setImageName("Sample room");
      setSourceType("sample");
      setLastGenerationMode(null);
      setGeneratedImage(null);
      setSelected(new Set());
      setPlacements(new Map());
      setActiveId(null);
      setPreparingProductIds(new Set());
      toast("Sample room loaded");
    };
  }, [toast]);

  // Load Room File
  const loadRoomFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setRoomImage(img);
        setRoomDataUrl(reader.result as string);
        setImageName(file.name);
        setSourceType("upload");
        setLastGenerationMode(null);
        setGeneratedImage(null);
        setSelected(new Set());
        setPlacements(new Map());
        setActiveId(null);
        setPreparingProductIds(new Set());
        toast("Room uploaded. Choose furniture to place.");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Setup Initial Sample Room
  useEffect(() => {
    loadSampleRoom();
  }, []);

  // Update Canvas Size based on Image Ratio
  useEffect(() => {
    if (!roomImage) return;
    const ratio = roomImage.width / roomImage.height || 1.6;
    const w = 1280;
    const h = Math.round(1280 / ratio);
    setStage({ width: w, height: h });
  }, [roomImage]);

  // Manage placements helper
  const ensurePlacement = (id: string, currentSelected: Set<string>, currentPlacements: Map<string, any>) => {
    if (currentPlacements.has(id)) return currentPlacements.get(id);
    const index = [...currentSelected].indexOf(id);
    const pattern = [
      { x: 0.48, y: floorDepth, scale: 1 },
      { x: 0.66, y: floorDepth + 0.03, scale: 0.92 },
      { x: 0.38, y: floorDepth + 0.02, scale: 1.04 },
      { x: 0.52, y: floorDepth + 0.09, scale: 0.82 },
      { x: 0.79, y: floorDepth - 0.04, scale: 1.05 },
      { x: 0.19, y: floorDepth - 0.02, scale: 0.98 },
    ];
    const p = { ...pattern[index === -1 ? 0 : index % pattern.length], rotation: 0, flipped: false };
    currentPlacements.set(id, p);
    return p;
  };

  const setProductPreparing = (id: string, isPreparing: boolean) => {
    setPreparingProductIds((current) => {
      const next = new Set(current);
      if (isPreparing) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const addProductToCanvas = (product: CatalogProduct) => {
    setActiveId(product.id);
    setSelected((current) => {
      const next = new Set(current);
      next.add(product.id);
      return next;
    });
    setPlacements((current) => {
      const next = new Map(current);
      const selectionForPlacement = new Set(selected);
      selectionForPlacement.add(product.id);
      ensurePlacement(product.id, selectionForPlacement, next);
      return next;
    });
  };

  // Toggle products from catalog
  const toggleProduct = async (id: string) => {
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const product = productsList.find((item) => item.id === id);
    if (!product) return;

    if (selected.has(id)) {
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setPlacements((current) => {
        const next = new Map(current);
        next.delete(id);
        return next;
      });
      if (activeId === id) {
        setActiveId(null);
      }
      return;
    }

    if (!isProductImageReady(product)) {
      setProductPreparing(id, true);
      toast(`Preparing ${product.name} image...`);
      try {
        await prepareProductImageForExport(product);
      } catch (error) {
        console.warn("Product image preparation failed:", error);
        toast("Could not prepare this product image");
        return;
      } finally {
        setProductPreparing(id, false);
      }
    }

    addProductToCanvas(product);
    triggerRenderRef.current?.();
  };

  // Adjust placement scale
  const handlePlacementScale = (id: string, val: number) => {
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const next = new Map(placements);
    const p = next.get(id);
    if (p) {
      p.scale = val / 100;
      setPlacements(next);
      setActiveId(id);
    }
  };

  // Adjust placement rotation
  const handlePlacementRotate = (id: string, val: number) => {
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const next = new Map(placements);
    const p = next.get(id);
    if (p) {
      p.rotation = val;
      setPlacements(next);
      setActiveId(id);
    }
  };

  // Adjust placement flip
  const handlePlacementFlip = (id: string, val: boolean) => {
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const next = new Map(placements);
    const p = next.get(id);
    if (p) {
      p.flipped = val;
      setPlacements(next);
      setActiveId(id);
    }
  };

  // Drag operations
  const pointHitsProductImage = (product: CatalogProduct, placement: any, cx: number, cy: number) => {
    const box = getProductBox(product, placement);
    if (cx < box.left || cx > box.right || cy < box.top || cy > box.bottom) return false;

    const img = getProductImage(product, () => {});
    if (!img) return true;

    const size = stage.width * product.baseScale * globalScale * placement.scale;
    const x = stage.width * placement.x;
    const y = stage.height * placement.y;
    let localX = cx - x;
    let localY = cy - y;

    if (placement.flipped) {
      localX = -localX;
    }

    if (placement.rotation) {
      const angle = (-placement.rotation * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nextX = localX * cos - localY * sin;
      const nextY = localX * sin + localY * cos;
      localX = nextX;
      localY = nextY;
    }

    const rect = getProductImageRect(img, box, size * getProductRatios(product).top);
    if (
      localX < rect.x ||
      localX > rect.x + rect.width ||
      localY < rect.y ||
      localY > rect.y + rect.height
    ) {
      return false;
    }

    const imageSize = getImageSize(img);
    const sourceX = ((localX - rect.x) / rect.width) * imageSize.width;
    const sourceY = ((localY - rect.y) / rect.height) * imageSize.height;
    return hasVisibleProductPixel(img, sourceX, sourceY);
  };

  const hitTest = (cx: number, cy: number) => {
    const activeProducts = productsList.filter((product) => selected.has(product.id));
    return activeProducts
      .slice()
      .reverse()
      .map((product) => ({ product, placement: placements.get(product.id) }))
      .filter(({ placement }) => placement)
      .map(({ product, placement }) => ({ id: product.id, box: getProductBox(product, placement), product, placement }))
      .find(({ product, placement }) => pointHitsProductImage(product, placement, cx, cy));
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * stage.width,
      y: ((e.clientY - rect.top) / rect.height) * stage.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isResultLocked) return;
    const point = getCanvasPoint(e);
    const hit = hitTest(point.x, point.y);
    if (!hit) return;

    setActiveId(hit.id);
    const p = placements.get(hit.id);
    draggingRef.current = {
      id: hit.id,
      offsetX: point.x - stage.width * p.x,
      offsetY: point.y - stage.height * p.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current || isResultLocked) return;
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const point = getCanvasPoint(e);
    const next = new Map(placements);
    const p = next.get(draggingRef.current.id);
    if (p) {
      p.x = Math.min(0.94, Math.max(0.06, (point.x - draggingRef.current.offsetX) / stage.width));
      p.y = Math.min(0.94, Math.max(0.42, (point.y - draggingRef.current.offsetY) / stage.height));
      p.userMoved = true;
      setPlacements(next);
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  // Trigger real AI generation
  const handleGenerate = async () => {
    if (!roomDataUrl) {
      toast("Upload a room photo first");
      return;
    }
    if (!selected.size) {
      toast("Select at least one product");
      return;
    }
    if (isPreparingProducts) {
      toast("Wait for product images to finish loading");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const selectedCatalogProducts = productsList.filter((p) => selected.has(p.id));
      await Promise.allSettled(selectedCatalogProducts.map((product) => prepareProductImageForExport(product)));

      const selectedProducts = selectedCatalogProducts
        .map((p) => ({
          id: p.id,
          name: p.name,
          category: p.type,
          imageUrl: p.imagePath,
          placement: placements.get(p.id),
        }));

      // Send the composited preview so any AI provider sees the exact chosen products
      // already placed in the uploaded room.
      let imagePayload = roomDataUrl;
      let hasCompositePayload = false;
      if (afterCanvasRef.current) {
        try {
          const afterCtx = afterCanvasRef.current.getContext("2d");
          if (afterCtx) {
            afterCtx.clearRect(0, 0, stage.width, stage.height);
            drawRoom(afterCtx);
            drawAiLighting(afterCtx);
            drawSelectedProducts(afterCtx, false, () => {});
            drawAfterVignette(afterCtx);
          }
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
          imagePayload = afterCanvasRef.current.toDataURL("image/png");
          hasCompositePayload = true;
        } catch (err) {
          console.warn("Could not export composited canvas with product reference:", err);
        }
      }

      const maskPayload = createPlacementMask();

      if (pipelineMode === "generative" && !hasCompositePayload) {
        throw new Error("Could not export the exact product reference for AI blending");
      }

      const response = await fetch("/api/ai-room-planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomImage: imagePayload,
          maskImage: maskPayload,
          prompt: stylePrompt,
          style: stylePrompt,
          pipelineMode,
          products: selectedProducts,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const result = await response.json();
      if (result.success && result.data) {
        const generated = result.data;
        draggingRef.current = null;
        setActiveId(null);
        setLastProvider(generated.provider || "local");
        setLastGenerationMode(generated.mode || "mock-preview");

        if (generated.imageDataUrl) {
          const outputImage = await loadGeneratedImage(generated.imageDataUrl);
          setGeneratedImage(outputImage);
          setCompareMode("after");
          toast(generated.message || "Preview generated!");
        } else {
          setGeneratedImage(null);
          setCompareMode("after");
          toast(generated.message || "Preview rendered locally");
        }

        if (generated.notes) {
          setDesignerNotes(generated.notes);
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (e) {
      console.error("[AIRoomPlanner] Generate error:", e);
      draggingRef.current = null;
      setActiveId(null);
      setLastProvider("browser-fallback");
      setLastGenerationMode("mock-preview");
      setGeneratedImage(null);
      setCompareMode("after");
      toast("AI unavailable. Showing local preview.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Output Canvas
  const handleDownload = () => {
    if (!roomImage || !afterCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `livaxis-room-designer-${Date.now()}.png`;
    link.href = afterCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="room-planner-container">
      {/* Ported Styles Isolated under room-planner-container namespace */}
      <style>{`
        .room-planner-container {
          --ink: #17211f;
          --muted: #66726f;
          --line: rgba(255,255,255,0.08);
          --panel: #121615;
          --surface: #0a0d0c;
          --surface-strong: #1a2220;
          --teal: #c8b898;
          --teal-dark: #8c7b5f;
          --coral: #d66b4d;
          --gold: #c79a33;
          --leaf: #4f7f52;
          --shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
          --radius: 12px;
          min-height: 100vh;
          color: #d1d5db;
          background: #080a09;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          padding: 20px;
        }

        .room-planner-container * {
          box-sizing: border-box;
        }

        .room-planner-container input,
        .room-planner-container button,
        .room-planner-container textarea {
          font: inherit;
          color: inherit;
        }

        .room-planner-container button {
          border: 0;
          background: transparent;
        }

        .room-planner-container .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin: 0 auto 16px;
          max-width: 1480px;
        }

        .room-planner-container .topbar h1 {
          margin: 2px 0 0;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.1;
          color: #f3f4f6;
        }

        .room-planner-container .eyebrow {
          margin: 0;
          color: var(--teal);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .room-planner-container .workspace {
          display: grid;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(260px, 300px);
          gap: 16px;
          max-width: 1480px;
          margin: 0 auto;
        }

        .room-planner-container .side-panel,
        .room-planner-container .stage-panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .room-planner-container .side-panel {
          align-self: start;
          padding: 16px;
        }

        .room-planner-container .stage-panel {
          min-width: 0;
          padding: 16px;
        }

        .room-planner-container .tool-section + .tool-section {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }

        .room-planner-container .section-heading,
        .room-planner-container .stage-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .room-planner-container .section-heading {
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
        }

        .room-planner-container .status-pill {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          background: var(--surface-strong);
          color: var(--teal);
        }

        .room-planner-container .drop-zone {
          display: grid;
          place-items: center;
          min-height: 120px;
          padding: 18px;
          border: 2px dashed rgba(200, 184, 152, 0.2);
          border-radius: var(--radius);
          background: var(--surface);
          text-align: center;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .room-planner-container .drop-zone:hover {
          border-color: var(--teal);
          background: rgba(200, 184, 152, 0.04);
        }

        .room-planner-container .drop-zone input {
          display: none;
        }

        .room-planner-container .drop-zone strong {
          font-size: 13px;
          color: #e5e7eb;
        }

        .room-planner-container .drop-zone small {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .room-planner-container .drop-icon {
          font-size: 24px;
          color: var(--teal);
          margin-bottom: 6px;
        }

        .room-planner-container .catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .room-planner-container .product-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 160ms ease;
        }

        .room-planner-container .product-card:hover {
          border-color: rgba(200, 184, 152, 0.3);
          background: rgba(200, 184, 152, 0.02);
        }

        .room-planner-container .product-card.active {
          border-color: var(--teal);
          box-shadow: 0 0 0 1px var(--teal);
        }

        .room-planner-container .product-card.loading {
          cursor: wait;
          opacity: 0.72;
        }

        .room-planner-container .product-card.loading::after {
          content: "Preparing";
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 3px 6px;
          border-radius: 4px;
          background: rgba(17, 24, 39, 0.86);
          color: #f3f4f6;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .room-planner-container .product-thumb {
          width: 100%;
          height: 64px;
          border-radius: 6px;
          background: #141817;
        }

        .room-planner-container .product-name {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #f3f4f6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .room-planner-container .product-type {
          display: block;
          font-size: 9px;
          color: #9ca3af;
          text-transform: uppercase;
        }

        .room-planner-container .field-row,
        .room-planner-container .range-row,
        .room-planner-container .check-row {
          display: grid;
          gap: 6px;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #9ca3af;
        }

        .room-planner-container .field-row textarea {
          width: 100%;
          padding: 8px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 6px;
          color: #f3f4f6;
          resize: none;
        }

        .room-planner-container .field-row textarea:focus {
          outline: none;
          border-color: var(--teal);
        }

        .room-planner-container .primary-btn,
        .room-planner-container .ghost-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 180ms ease;
        }

        .room-planner-container .primary-btn {
          background: var(--teal);
          color: #0c0e0d;
        }

        .room-planner-container .primary-btn:hover {
          background: var(--teal-dark);
        }

        .room-planner-container .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .room-planner-container .ghost-btn {
          border: 1px solid var(--line);
          background: transparent;
          color: #e5e7eb;
        }

        .room-planner-container .ghost-btn:hover {
          background: var(--surface-strong);
        }

        .room-planner-container .presets-section {
          margin-top: 12px;
        }

        .room-planner-container .presets-label {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 6px;
        }

        .room-planner-container .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .room-planner-container .presets-grid button.preset-btn:last-child {
          grid-column: span 2;
        }

        .room-planner-container .preset-btn {
          padding: 6px 8px;
          font-size: 11px;
          border: 1px solid var(--line);
          border-radius: 6px;
          background: var(--surface);
          cursor: pointer;
          transition: all 180ms ease;
        }

        .room-planner-container .preset-btn.active {
          border-color: var(--teal);
          background: var(--teal);
          color: #0c0e0d;
        }

        .room-planner-container .pipeline-grid {
          display: grid;
          gap: 8px;
        }

        .room-planner-container .pipeline-card {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--surface);
          cursor: pointer;
          transition: all 180ms ease;
        }

        .room-planner-container .pipeline-card.active {
          border-color: var(--teal);
          background: rgba(200, 184, 152, 0.05);
        }

        .room-planner-container .pipeline-card input {
          margin-top: 3px;
          accent-color: var(--teal);
        }

        .room-planner-container .pipeline-card-title {
          font-size: 12px;
          font-weight: 700;
          color: #f3f4f6;
        }

        .room-planner-container .pipeline-card-desc {
          display: block;
          font-size: 10px;
          color: #9ca3af;
          margin-top: 2px;
          line-height: 1.3;
        }

        .room-planner-container .compare-frame {
          margin-top: 14px;
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .room-planner-container .compare-stage {
          --split: 48%;
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          touch-action: none;
        }

        .room-planner-container .compare-stage.after-only .before-layer,
        .room-planner-container .compare-stage.after-only .split-line,
        .room-planner-container .compare-stage.after-only .split-range {
          display: none;
        }

        .room-planner-container .compare-stage canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .room-planner-container .before-layer {
          clip-path: inset(0 calc(100% - var(--split)) 0 0);
        }

        .room-planner-container .split-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: var(--split);
          width: 2px;
          background: rgba(255, 255, 255, 0.9);
          pointer-events: none;
        }

        .room-planner-container .split-line span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30px;
          height: 30px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: rgba(12, 14, 13, 0.85);
          transform: translate(-50%, -50%);
        }

        .room-planner-container .split-range {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: ew-resize;
        }

        .room-planner-container .stage-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: #f3f4f6;
          margin: 2px 0 0;
        }

        .room-planner-container .stage-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
        }

        .room-planner-container .mode-tabs {
          display: flex;
          background: var(--surface);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--line);
        }

        .room-planner-container .tab-btn {
          height: 28px;
          padding: 0 10px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          color: #9ca3af;
        }

        .room-planner-container .tab-btn.active {
          background: var(--surface-strong);
          color: var(--teal);
        }

        .room-planner-container .legend {
          display: flex;
          gap: 12px;
        }

        .room-planner-container .legend-item {
          position: relative;
          padding-left: 14px;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 700;
        }

        .room-planner-container .legend-item::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translateY(-50%);
        }

        .room-planner-container .before-dot::before {
          background: #d66b4d;
        }

        .room-planner-container .after-dot::before {
          background: var(--teal);
        }

        .room-planner-container .selected-list {
          display: grid;
          gap: 8px;
        }

        .room-planner-container .selected-empty,
        .room-planner-container .note-empty {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          padding: 12px;
          border: 1px dashed var(--line);
          border-radius: 8px;
        }

        .room-planner-container .selected-item {
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--surface);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .room-planner-container .selected-item.active {
          border-color: var(--teal);
          background: rgba(200, 184, 152, 0.03);
        }

        .room-planner-container .selected-item strong {
          font-size: 12px;
          color: #f3f4f6;
        }

        .room-planner-container .selected-item small {
          font-size: 10px;
          color: #9ca3af;
        }

        .room-planner-container .control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          color: #9ca3af;
        }

        .room-planner-container .control-row span {
          min-width: 44px;
        }

        .room-planner-container .control-row input {
          flex: 1;
        }

        .room-planner-container .mini-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--surface-strong);
          color: #f3f4f6;
          display: grid;
          place-items: center;
          cursor: pointer;
          font-weight: 800;
          font-size: 12px;
        }

        .room-planner-container .notes {
          display: grid;
          gap: 8px;
        }

        .room-planner-container .note {
          padding: 8px 10px;
          font-size: 11px;
          line-height: 1.4;
          border-left: 3px solid var(--teal);
          background: rgba(200, 184, 152, 0.02);
          color: #9ca3af;
        }

        .room-planner-container .toast {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          padding: 12px 20px !important;
          border-radius: 8px !important;
          background: #111827 !important;
          background-color: #111827 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
          transform: translateY(10px) !important;
          opacity: 0 !important;
          transition: all 180ms ease !important;
          pointer-events: none !important;
          z-index: 99999 !important;
        }

        .room-planner-container .toast.show {
          transform: translateY(0) !important;
          opacity: 1 !important;
        }

        .room-planner-container .check-row-compact {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #9ca3af;
        }

        .room-planner-container .check-row-compact input {
          margin: 0;
        }

        @media (max-width: 1024px) {
          .room-planner-container .workspace {
            grid-template-columns: 1fr;
          }
          .room-planner-container .output-panel {
            grid-column: span 1;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="topbar">
        <div>
          <p className="eyebrow">LIVAXIS STUDIO</p>
          <h1>AI Before / After Interior Planner</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-btn" onClick={() => navigate('/')} style={{ marginRight: 8 }}>
            Back to Home
          </button>
          <button className="ghost-btn" onClick={loadSampleRoom} style={{ marginRight: 8 }}>
            Sample room
          </button>
          <button className="primary-btn" disabled={isGenerating || isPreparingProducts} onClick={handleGenerate}>
            {isGenerating ? "Processing AI..." : isPreparingProducts ? "Preparing images..." : "Generate after"}
          </button>
        </div>
      </header>

      {/* Workspace Grid */}
      <main className="workspace">
        {/* Left Side Panel (Controls) */}
        <aside className="side-panel">
          <section className="tool-section">
            <div className="section-heading">
              <span>Room image</span>
              <span className="status-pill">{imageName}</span>
            </div>

            <label className="drop-zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) loadRoomFile(file);
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadRoomFile(file);
                }}
              />
              <span className="drop-icon" onClick={() => fileInputRef.current?.click()}>+</span>
              <strong onClick={() => fileInputRef.current?.click()}>Upload room photo</strong>
              <small>JPG, PNG, or WebP</small>
            </label>
          </section>

          <section className="tool-section">
            <div className="section-heading">
              <span>Furniture catalog</span>
              <span>{selected.size} selected</span>
            </div>
            <div className="catalog-grid">
              {productsList.map((product) => {
                const isSelected = selected.has(product.id);
                const isPreparing = preparingProductIds.has(product.id);
                return (
                  <button
                    key={product.id}
                    className={`product-card ${isSelected ? "active" : ""} ${isPreparing ? "loading" : ""}`}
                    onClick={() => toggleProduct(product.id)}
                    disabled={isPreparing}
                    aria-busy={isPreparing}
                    type="button"
                  >
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      className="product-thumb object-contain p-2"
                      style={{ background: "#141817" }}
                    />
                    <span>
                      <span className="product-name">{product.name}</span>
                      <span className="product-type">{product.type}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="tool-section">
            <div className="section-heading">
              <span>Placement pipeline</span>
            </div>
            <div className="pipeline-grid">
              <label className={`pipeline-card ${pipelineMode === "composite" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="pipelineMode"
                  value="composite"
                  checked={pipelineMode === "composite"}
                  onChange={() => {
                    setPipelineMode("composite");
                    setGeneratedImage(null);
                    setLastGenerationMode(null);
                  }}
                />
                <div>
                  <span className="pipeline-card-title">Reference Placement</span>
                  <span className="pipeline-card-desc">Uses the real product image as the source, extracts the object, then overlays it into your room with matched scale, shadow, and lighting.</span>
                </div>
              </label>
              <label className={`pipeline-card ${pipelineMode === "generative" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="pipelineMode"
                  value="generative"
                  checked={pipelineMode === "generative"}
                  onChange={() => {
                    setPipelineMode("generative");
                    setGeneratedImage(null);
                    setLastGenerationMode(null);
                  }}
                />
                <div>
                  <span className="pipeline-card-title">AI Blend Enhancement</span>
                  <span className="pipeline-card-desc">Sends the reference composite to the AI provider for relighting and blending. If provider fails, the exact-product composite stays visible.</span>
                </div>
              </label>
            </div>
          </section>

          <section className="tool-section">
            <div className="section-heading">
              <span>Generation style</span>
              <span className="status-pill">{aiStatus}</span>
            </div>
            <div className="presets-section">
              <span className="presets-label">Style Preset</span>
              <div className="presets-grid">
                {Object.keys(stylePresets).map((preset) => (
                  <button
                    key={preset}
                    className={`preset-btn ${stylePreset === preset ? "active" : ""}`}
                    onClick={() => {
                      setStylePreset(preset);
                      setStylePrompt(stylePresets[preset]);
                      setGeneratedImage(null);
                      setLastGenerationMode(null);
                    }}
                    type="button"
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <label className="field-row">
              <span>Prompt</span>
              <textarea
                value={stylePrompt}
                onChange={(e) => {
                  setStylePrompt(e.target.value);
                  setGeneratedImage(null);
                  setLastGenerationMode(null);
                }}
                rows={3}
                placeholder="Modern luxury living room, realistic lighting, keep room structure unchanged"
              />
            </label>
            <label className="range-row">
              <span>Product size</span>
              <input
                type="range"
                min="70"
                max="145"
                value={globalScale * 100}
                onChange={(e) => {
                  setGlobalScale(Number(e.target.value) / 100);
                  setGeneratedImage(null);
                  setLastGenerationMode(null);
                }}
              />
            </label>
            <label className="range-row">
              <span>Floor depth</span>
              <input
                type="range"
                min="55"
                max="88"
                value={floorDepth * 100}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  setFloorDepth(val);
                  setGeneratedImage(null);
                  setLastGenerationMode(null);
                  // Update untracked placements to match floorDepth
                  const next = new Map(placements);
                  [...selected].forEach((id, idx) => {
                    const p = next.get(id);
                    if (p && !p.userMoved) {
                      p.y = val + (idx % 3) * 0.025;
                    }
                  });
                  setPlacements(next);
                }}
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={lightMatch}
                onChange={(e) => {
                  setLightMatch(e.target.checked);
                  setGeneratedImage(null);
                  setLastGenerationMode(null);
                }}
              />
              <span>Match room lighting</span>
            </label>
          </section>
        </aside>

        {/* Center Stage Panel (Preview Comparison) */}
        <section className="stage-panel">
          <div className="stage-header">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>Before / After</h2>
            </div>
            <div className="mode-tabs">
              <button
                className={`tab-btn ${compareMode === "compare" ? "active" : ""}`}
                onClick={() => setCompareMode("compare")}
                type="button"
              >
                Compare
              </button>
              <button
                className={`tab-btn ${compareMode === "after" ? "active" : ""}`}
                onClick={() => setCompareMode("after")}
                type="button"
              >
                After only
              </button>
            </div>
          </div>

          <div className="compare-frame">
            <div
              className={`compare-stage ${compareMode === "after" ? "after-only" : ""}`}
              style={{
                "--split": `${sliderPos}%`,
                "aspectRatio": `${stage.width} / ${stage.height}`
              } as any}
            >
              <canvas
                id="afterCanvas"
                ref={afterCanvasRef}
                width={stage.width}
                height={stage.height}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
              <canvas
                id="beforeCanvas"
                ref={beforeCanvasRef}
                className="before-layer"
                width={stage.width}
                height={stage.height}
              />
              <div className="split-line" style={{ left: `${sliderPos}%` }}>
                <span />
              </div>
              <input
                className="split-range"
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="stage-footer">
            <div className="legend">
              <span className="legend-item before-dot">Before</span>
              <span className="legend-item after-dot">After</span>
            </div>
            <button className="ghost-btn" onClick={handleDownload} type="button">
              Download result
            </button>
          </div>
        </section>

        {/* Right Side Panel (Selected List & Notes) */}
        <aside className="side-panel output-panel">
          <section className="tool-section">
            <div className="section-heading">
              <span>Selected items</span>
              <button className="text-btn" onClick={() => {
                setSelected(new Set());
                setPlacements(new Map());
                setActiveId(null);
                setGeneratedImage(null);
                setLastGenerationMode(null);
                toast("Selections cleared");
              }} type="button">
                Clear
              </button>
            </div>
            <div className="selected-list">
              {productsList.filter((p) => selected.has(p.id)).length === 0 ? (
                <div className="selected-empty">Select furniture from the catalog</div>
              ) : (
                productsList
                  .filter((p) => selected.has(p.id))
                  .map((product) => {
                    const p = placements.get(product.id) || { scale: 1, rotation: 0, flipped: false };
                    const isActive = activeId === product.id;
                    return (
                      <div
                        key={product.id}
                        className={`selected-item ${isActive ? "active" : ""}`}
                        onClick={() => setActiveId(product.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                          <div>
                            <strong>{product.name}</strong>
                            <small>{Math.round(p.scale * globalScale * 100)}% size, {p.rotation || 0}° rot{p.flipped ? ", flipped" : ""}</small>
                          </div>
                          <button
                            className="mini-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduct(product.id);
                            }}
                            type="button"
                          >
                            x
                          </button>
                        </div>
                        <div className="selected-controls" style={{ width: "100%", marginTop: 8 }}>
                          <label className="control-row">
                            <span>Size:</span>
                            <input
                              type="range"
                              min="60"
                              max="150"
                              value={Math.round(p.scale * 100)}
                              onChange={(e) => handlePlacementScale(product.id, Number(e.target.value))}
                            />
                          </label>
                          <label className="control-row" style={{ marginTop: 6 }}>
                            <span>Rotate:</span>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={p.rotation || 0}
                              onChange={(e) => handlePlacementRotate(product.id, Number(e.target.value))}
                            />
                          </label>
                          <div className="check-row-compact" style={{ marginTop: 6 }}>
                            <input
                              type="checkbox"
                              id={`flip-${product.id}`}
                              checked={p.flipped || false}
                              onChange={(e) => handlePlacementFlip(product.id, e.target.checked)}
                            />
                            <label htmlFor={`flip-${product.id}`} onClick={(e) => e.stopPropagation()}>
                              Flip horizontally
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </section>

          <section className="tool-section">
            <div className="section-heading">
              <span>AI designer notes</span>
            </div>
            <div className="notes">
              {designerNotes.map((note, i) => (
                <div key={i} className="note">
                  {note}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>

      {/* Floating Toast Notification */}
      <div className={`toast ${toastShow ? "show" : ""}`}>
        {toastMessage}
      </div>
    </div>
  );
}
