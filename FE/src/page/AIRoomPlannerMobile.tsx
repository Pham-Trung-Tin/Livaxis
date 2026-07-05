import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { removeBackground } from '@imgly/background-removal';
import { getAiTurns, type TurnsInfo } from '../services/aiRoomPlannerApi';
import { saveDesign, type DesignProduct } from '../services/designApi';
import { useAuth } from '../contexts/auth-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';

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
  price?: number;
  affiliateUrl?: string;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, product: CatalogProduct) => void;
};

const catalog: CatalogProduct[] = [
  {
    id: "oak-table",
    name: "Bàn ăn gỗ sồi",
    type: "Table",
    color: "#8b6545",
    accent: "#4f3828",
    baseScale: 0.26,
    note: "Bàn được đặt gần đường sàn chính giúp căn phòng luôn có cảm giác rộng rãi.",
    imagePath: "/assets/oak_table.png",
    draw: drawTable,
  },
  {
    id: "lounge-chair",
    name: "Ghế thư giãn",
    type: "Chair",
    color: "#8f7f72",
    accent: "#5d3f2c",
    baseScale: 0.18,
    note: "Ghế tạo điểm nhấn ấm áp và hướng về phía trung tâm phòng.",
    imagePath: "/assets/lounge_chair.png",
    draw: drawChair,
  },
  {
    id: "linen-sofa",
    name: "Sofa vải lanh",
    type: "Sofa",
    color: "#756a5f",
    accent: "#5b3a27",
    baseScale: 0.34,
    note: "Sofa được đặt sát mảng tường lớn nhất mà không che khuất cửa sổ.",
    imagePath: "/assets/linen_sofa.png",
    draw: drawSofa,
  },
  {
    id: "coffee-table",
    name: "Bàn trà tròn",
    type: "Table",
    color: "#7a573a",
    accent: "#4b3222",
    baseScale: 0.18,
    note: "Bàn trà được đặt thấp để giữ lối đi thông thoáng.",
    imagePath: "/assets/coffee_table.png",
    draw: drawCoffeeTable,
  },
  {
    id: "floor-lamp",
    name: "Đèn cây uốn cong",
    type: "Lighting",
    color: "#26312f",
    accent: "#f2cf74",
    baseScale: 0.22,
    note: "Đèn tạo nguồn sáng phụ giúp không gian thêm phần hoàn thiện.",
    imagePath: "/assets/floor_lamp.png",
    removeBackground: true,
    draw: drawLamp,
  },
  {
    id: "leaf-plant",
    name: "Cây lá xanh",
    type: "Decor",
    color: "#4f7f52",
    accent: "#8b5f3b",
    baseScale: 0.16,
    note: "Cây xanh làm dịu góc phòng và cân bằng bố cục đồ nội thất.",
    imagePath: "/assets/leaf_plant.png",
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

function erodeAlpha(
  src: HTMLImageElement | HTMLCanvasElement,
  drawW: number,
  drawH: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = drawW;
  c.height = drawH;
  const cx = c.getContext("2d", { willReadFrequently: true });
  if (!cx) return c;

  cx.drawImage(src, 0, 0, drawW, drawH);

  try {
    const id = cx.getImageData(0, 0, drawW, drawH);
    const d = id.data;
    const w = drawW;
    const h = drawH;
    const alphaCopy = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alphaCopy[i] = d[i * 4 + 3];

    // 2-pixel erosion: if any neighbor within 2px is transparent, reduce alpha
    const radius = 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (alphaCopy[idx] === 0) continue;

        let minAlpha = 255;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
              minAlpha = 0;
              break;
            }
            const nIdx = ny * w + nx;
            if (alphaCopy[nIdx] < minAlpha) minAlpha = alphaCopy[nIdx];
          }
          if (minAlpha === 0) break;
        }

        d[idx * 4 + 3] = Math.min(d[idx * 4 + 3], minAlpha);
      }
    }

    cx.putImageData(id, 0, 0);
  } catch {
    // CORS — return un-eroded
  }

  return c;
}

function drawProductReferenceImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  box: { width: number; height: number },
  offsetTop: number,
) {
  const rect = getProductImageRect(img, box, offsetTop);
  const drawW = Math.ceil(rect.width);
  const drawH = Math.ceil(rect.height);

  if (drawW < 4 || drawH < 4) {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    return;
  }

  // Very subtle edge feathering — only 1px anti-alias, no aggressive bottom fade
  const feather = Math.max(1, Math.min(drawW, drawH) * 0.008);
  const off = document.createElement("canvas");
  off.width = drawW;
  off.height = drawH;
  const offCtx = off.getContext("2d");
  if (!offCtx) {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    return;
  }

  offCtx.drawImage(img, 0, 0, drawW, drawH);
  offCtx.globalCompositeOperation = "destination-out";

  // Minimal left edge softening
  const gLeft = offCtx.createLinearGradient(0, 0, feather, 0);
  gLeft.addColorStop(0, "rgba(0,0,0,0.25)");
  gLeft.addColorStop(1, "rgba(0,0,0,0)");
  offCtx.fillStyle = gLeft;
  offCtx.fillRect(0, 0, feather, drawH);

  // Minimal right edge softening
  const gRight = offCtx.createLinearGradient(drawW - feather, 0, drawW, 0);
  gRight.addColorStop(0, "rgba(0,0,0,0)");
  gRight.addColorStop(1, "rgba(0,0,0,0.25)");
  offCtx.fillStyle = gRight;
  offCtx.fillRect(drawW - feather, 0, feather, drawH);

  ctx.drawImage(off, rect.x, rect.y);
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
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = "anonymous";
    }
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
      cutoutDataUrl = await requestProductCutout(product, () => { });
    }

    if (cutoutDataUrl) {
      // Force reload from the clean cutout data URL
      delete imageCache[product.id];
      delete imageLoadPromises[product.id];
      await loadProductImageFromSource(product, cutoutDataUrl, () => { }, false);
    } else if (product.imagePath) {
      // Server cutout failed → use browser-side bg removal as fallback
      delete imageCache[product.id];
      delete imageLoadPromises[product.id];
      await loadProductImageFromSource(product, product.imagePath, () => { }, Boolean(product.removeBackground));
    }
  } else {
    const cached = imageCache[product.id];
    if (cached && cached !== "loading") return;

    if (imageLoadPromises[product.id]) {
      await imageLoadPromises[product.id];
    } else if (product.imagePath) {
      await loadProductImageFromSource(product, product.imagePath, () => { }, Boolean(product.removeBackground));
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
    note: p.description || `__DEFAULT_NOTE__:${p.name}`,
    imagePath: p.imageUrl,
    removeBackground: true,
    isDbProduct: true,
    price: p.price,
    affiliateUrl: p.affiliateUrl,
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

export function AIRoomPlannerMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Elements References
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States mirroring EXE app.js
  const [productsList, setProductsList] = useState<CatalogProduct[]>(catalog);

  const localizedProductsList = useMemo(() => {
    return productsList.map((product) => {
      if (!product.isDbProduct) {
        const keyBase = `aiRoomPlanner.catalog.${product.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`;
        return {
          ...product,
          name: t(`${keyBase}.name`),
          note: t(`${keyBase}.note`),
        };
      }
      if (product.note.startsWith('__DEFAULT_NOTE__:')) {
        const prodName = product.note.split('__DEFAULT_NOTE__:')[1];
        return {
          ...product,
          note: t('aiRoomPlanner.defaultProductNote').replace('{name}', prodName)
        };
      }
      return product;
    });
  }, [productsList, t]);

  const TYPE_KEYS: Record<string, string> = {
    Table: 'discovery.tables',
    Chair: 'discovery.chairs',
    Sofa: 'discovery.sofas',
    Bed: 'discovery.beds',
    Lighting: 'discovery.lighting',
    Storage: 'discovery.storage',
    Decor: 'discovery.decor',
  };
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const [roomDataUrl, setRoomDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("Sample room");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [placements, setPlacements] = useState<Map<string, any>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage, setStage] = useState({ width: 1280, height: 800 });
  const [sourceType, setSourceType] = useState("sample");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [sliderPos, setSliderPos] = useState(48);
  const [globalScale, setGlobalScale] = useState(1);
  const [floorDepth, setFloorDepth] = useState(0.72);
  const [lightMatch, setLightMatch] = useState(true);
  const [floorBlend, setFloorBlend] = useState<'shadow' | 'rug' | 'clean'>('shadow');
  const [stylePreset, setStylePreset] = useState("modern");
  const [pipelineMode, setPipelineMode] = useState("composite");
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastProvider, setLastProvider] = useState("local");
  const [lastGenerationMode, setLastGenerationMode] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(null);
  const [aiStatusKey, setAiStatusKey] = useState("checkingApi");
  const [stylePrompt, setStylePrompt] = useState(stylePresets["modern"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preparingProductIds, setPreparingProductIds] = useState<Set<string>>(new Set());
  const [designerNotes, setDesignerNotes] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastShow, setToastShow] = useState(false);
  const [sharpOverlay, setSharpOverlay] = useState(false);
  const [turnsInfo, setTurnsInfo] = useState<TurnsInfo | null>(null);
  const [isDetectingFloor, setIsDetectingFloor] = useState(false);

  // Save Design states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState("");
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

  // Mobile Tab state
  const [activeTab, setActiveTab] = useState<'canvas' | 'catalog' | 'settings'>('canvas');

  // Dragging states
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const prevFloorDepthRef = useRef(floorDepth);

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
          setAiStatusKey("backendReady");
          if (res.data.realAiEnabled) {
            setPipelineMode("generative");
          }
        } else {
          throw new Error("fail");
        }
      })
      .catch(() => {
        setBackendOnline(false);
        setLastProvider("browser-fallback");
        setAiStatusKey("localPreview");
      });
  }, []);

  // Fetch AI turns quota on mount
  useEffect(() => {
    if (!user) return;
    getAiTurns()
      .then((info) => setTurnsInfo(info))
      .catch(() => setTurnsInfo(null));
  }, [user]);

  // Sync showBeforeAfter when results are unlocked
  useEffect(() => {
    if (!isResultLocked) {
      setShowBeforeAfter(false);
    }
  }, [isResultLocked]);

  // Sync Designer Notes
  useEffect(() => {
    const selectedProducts = localizedProductsList.filter((product) => selected.has(product.id));
    if (!selectedProducts.length) {
      const emptyMessage =
        sourceType === "upload"
          ? t('aiRoomPlanner.resetDemoSelections')
          : t('aiRoomPlanner.chooseCatalogToCreate');
      setDesignerNotes([emptyMessage]);
      return;
    }

    const isComposite = pipelineMode === "composite";
    const modeLabel = isComposite
      ? (language === 'vi' ? 'Ghép ảnh thông minh (AI Composite)' : 'Smart AI Composite')
      : (language === 'vi' ? 'Trí tuệ nhân tạo tạo sinh (Generative AI)' : 'Generative AI');

    const notes = [
      backendOnline
        ? t('aiRoomPlanner.backendConnectedMode').replace('{mode}', modeLabel)
        : t('aiRoomPlanner.browserModeLocal').replace('{mode}', isComposite ? (language === 'vi' ? 'Ghép ảnh' : 'Composite') : (language === 'vi' ? 'Tạo sinh (yêu cầu máy chủ)' : 'Generative (requires backend)')),
      isComposite
        ? t('aiRoomPlanner.smartAiModeActive')
        : t('aiRoomPlanner.genAiModeActive'),
      lightMatch
        ? t('aiRoomPlanner.lightMatchEnabled')
        : t('aiRoomPlanner.lightMatchDisabled'),
      ...selectedProducts.map((product) => product.note),
    ];
    setDesignerNotes(notes);
  }, [selected, sourceType, pipelineMode, backendOnline, lightMatch, t, language, localizedProductsList]);

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
    const label = "XEM TRƯỚC BỐ TRÍ CỤC BỘ - CHƯA KẾT NỐI API AI";
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
    // For 'shadow' and 'clean' modes: do NOT send a mask at all.
    // The mask was causing AI to add gray halos / dark blobs around products.
    // Without a mask, the AI uses img2img which processes the entire image naturally
    // and produces much more realistic integration without artifacts.
    if (floorBlend !== 'rug') {
      return null;
    }

    // Only 'rug' mode needs a mask — to indicate the rug area for AI to blend
    const canvas = document.createElement("canvas");
    canvas.width = stage.width;
    canvas.height = stage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, stage.width, stage.height);

    const selectedProducts = productsList.filter((product) => selected.has(product.id));

    selectedProducts.forEach((product) => {
      const placement = placements.get(product.id);
      if (!placement) return;
      const box = getProductBox(product, placement);
      const rotY = (placement.rotationY || 0) * Math.PI / 180;
      const scaleX = Math.abs(Math.cos(rotY));

      // Rug area below product
      ctx.save();
      ctx.filter = "blur(10px)";
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(
        box.cx,
        box.bottom + box.height * 0.04,
        box.width * 0.5 * scaleX,
        box.height * 0.15,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });

    // Cut out product centers so AI doesn't modify the products themselves
    selectedProducts.forEach((product) => {
      const placement = placements.get(product.id);
      if (!placement) return;
      const box = getProductBox(product, placement);
      const rotY = (placement.rotationY || 0) * Math.PI / 180;
      const scaleX = Math.abs(Math.cos(rotY));

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.filter = "blur(4px)";
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(
        box.cx,
        box.top + box.height * 0.48,
        box.width * 0.46 * scaleX,
        box.height * 0.46,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });

    return canvas.toDataURL("image/png");
  }, [stage, productsList, selected, placements, getProductBox, floorBlend]);

  const drawSelectionRing = useCallback((ctx: CanvasRenderingContext2D, box: any) => {
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.lineWidth = 3;
    roundRect(ctx, box.left - 8, box.top - 8, box.width + 16, box.height + 16, 12);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawFloorShadow = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, productCount = 1) => {
    ctx.save();

    // Reduce shadow intensity when multiple products are present to avoid dark blob accumulation
    const intensityScale = productCount <= 1 ? 1 : Math.max(0.4, 1 - (productCount - 1) * 0.2);

    // Shift shadow slightly to the left to simulate directional lighting from the right/window
    const sx = x - w * 0.12;
    const sy = y + h * 0.06;

    // Layer 1: Wide ambient shadow spread — subtle presence on the floor
    const ambientGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w * 1.4, h * 2.2));
    ambientGrad.addColorStop(0, `rgba(0, 0, 0, ${(0.10 * intensityScale).toFixed(2)})`);
    ambientGrad.addColorStop(0.4, `rgba(0, 0, 0, ${(0.05 * intensityScale).toFixed(2)})`);
    ambientGrad.addColorStop(0.7, `rgba(0, 0, 0, ${(0.02 * intensityScale).toFixed(2)})`);
    ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ambientGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, w * 0.9, h * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Medium directional cast shadow
    const castGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w * 0.7, h * 0.9));
    castGrad.addColorStop(0, `rgba(0, 0, 0, ${(0.16 * intensityScale).toFixed(2)})`);
    castGrad.addColorStop(0.5, `rgba(0, 0, 0, ${(0.06 * intensityScale).toFixed(2)})`);
    castGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = castGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, w * 0.55, h * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Layer 3: Tight contact shadow — grounding layer
    const contactGrad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w * 0.35, h * 0.4));
    contactGrad.addColorStop(0, `rgba(0, 0, 0, ${(0.28 * intensityScale).toFixed(2)})`);
    contactGrad.addColorStop(0.4, `rgba(0, 0, 0, ${(0.12 * intensityScale).toFixed(2)})`);
    contactGrad.addColorStop(0.7, `rgba(0, 0, 0, ${(0.04 * intensityScale).toFixed(2)})`);
    contactGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.4, h * 0.3, 0, 0, Math.PI * 2);
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

    // 3D Y-rotation: scale horizontally by cos(rotationY)
    const rotY = (placement.rotationY || 0) * Math.PI / 180;
    const scaleX = Math.cos(rotY);
    const flipDir = placement.flipped ? -1 : 1;
    const absScaleX = Math.abs(scaleX);

    ctx.save();

    // Rug mode: draw a visual rug guide for AI to use as context
    if (floorBlend === 'rug') {
      ctx.save();
      const rx = box.width * 0.9 * absScaleX;
      const ry = box.height * 0.24;
      ctx.fillStyle = "#f4efe2";
      ctx.beginPath();
      ctx.ellipse(box.cx, box.bottom + box.height * 0.05, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d7cfbc";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(box.cx, box.bottom + box.height * 0.05, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#c6bca7";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(box.cx, box.bottom + box.height * 0.05, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#b5ab95";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.ellipse(box.cx, box.bottom + box.height * 0.05, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#c6bca7";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // ── DRAW PRODUCT (clean, no effects) ──
    ctx.translate(x, y);

    if (placement.rotation) {
      ctx.rotate((placement.rotation * Math.PI) / 180);
    }
    // Apply horizontal flip AND Y-rotation scale together
    ctx.scale(flipDir * scaleX, 1);

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
  }, [placements, stage, globalScale, activeId, getProductBox, drawSelectionRing, floorBlend]);

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
    const afterCtx = afterCanvasRef.current?.getContext("2d");
    if (!afterCtx) return;

    const { width, height } = stage;
    afterCtx.clearRect(0, 0, width, height);

    const beforeCtx = beforeCanvasRef.current?.getContext("2d");
    if (beforeCtx) {
      beforeCtx.clearRect(0, 0, width, height);
      drawRoom(beforeCtx);
    }

    if (generatedImage) {
      afterCtx.drawImage(generatedImage, 0, 0, width, height);
      // Redraw selected products on top of the generated room to keep the original product images 100% sharp and unchanged.
      // This solves the issue where AI completely distorts, alters, or erases the product.
      if (sharpOverlay) {
        drawSelectedProducts(afterCtx, false);
      }
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
  }, [roomImage, generatedImage, stage, drawRoom, drawAiLighting, drawAfterVignette, drawFallbackBadge, drawSelectedProducts, selected, lastGenerationMode, isResultLocked, sharpOverlay]);

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
  }, [roomImage, stage, selected, placements, globalScale, floorDepth, lightMatch, activeId, lastGenerationMode, sharpOverlay, renderAll]);

  // Load Sample Room
  const loadSampleRoom = useCallback(() => {
    const img = new Image();
    img.src = "/assets/sample_room.png";
    img.onload = async () => {
      setRoomImage(img);

      // Convert sample room image to Base64 Data URL so backend gets a valid image payload
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      let dataUrl = "/assets/sample_room.png";
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          dataUrl = canvas.toDataURL("image/png");
          setRoomDataUrl(dataUrl);
        } catch (e) {
          console.warn("Failed to convert sample room to DataURL:", e);
          setRoomDataUrl("/assets/sample_room.png");
        }
      } else {
        setRoomDataUrl("/assets/sample_room.png");
      }

      setImageName("Phòng mẫu");
      setSourceType("sample");
      setLastGenerationMode(null);
      setGeneratedImage(null);
      setSelected(new Set());
      setPlacements(new Map());
      setActiveId(null);
      setPreparingProductIds(new Set());
      setFloorDepth(0.60);
      prevFloorDepthRef.current = 0.60;
      toast(t('aiRoomPlanner.sampleRoomLoaded'));

      // Auto-detect floor line for this room
      setIsDetectingFloor(true);
      try {
        const response = await fetch("/api/ai-room-planner/detect-floor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomImage: dataUrl }),
        });
        const data = await response.json();
        if (data.success && data.data?.floorY) {
          setFloorDepth(data.data.floorY);
          prevFloorDepthRef.current = data.data.floorY;
        }
      } catch (e) {
        // Keep default
      } finally {
        setIsDetectingFloor(false);
      }
    };
  }, [toast, t]);

  // Load Room File
  const loadRoomFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        setRoomImage(img);
        const dataUrl = reader.result as string;
        setRoomDataUrl(dataUrl);
        setImageName(file.name);
        setSourceType("upload");
        setLastGenerationMode(null);
        setGeneratedImage(null);
        setSelected(new Set());
        setPlacements(new Map());
        setActiveId(null);
        setPreparingProductIds(new Set());

        // Start with a safe middle-ground default
        setFloorDepth(0.60);
        prevFloorDepthRef.current = 0.60;
        toast(t('aiRoomPlanner.roomUploadedToast'));

        // Auto-detect floor line for this room (blocking wait)
        setIsDetectingFloor(true);
        try {
          const response = await fetch("/api/ai-room-planner/detect-floor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomImage: dataUrl }),
          });
          const data = await response.json();
          if (data.success && data.data?.floorY) {
            setFloorDepth(data.data.floorY);
            prevFloorDepthRef.current = data.data.floorY;
          }
        } catch (e) {
          // Keep default floorDepth
        } finally {
          setIsDetectingFloor(false);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Setup Initial Room (either from location state or fallback to sample room)
  useEffect(() => {
    const state = location.state as {
      roomImageUrl?: string;
      placements?: any[];
      name?: string;
    };

    if (state && state.roomImageUrl) {
      const img = new Image();
      img.src = state.roomImageUrl;
      img.onload = () => {
        setRoomImage(img);
        setRoomDataUrl(state.roomImageUrl!);
        setImageName(state.name || "Saved design");
        setSourceType("upload");
        setLastGenerationMode(null);
        setGeneratedImage(null);
        setSelected(new Set());
        setPlacements(new Map());
        setActiveId(null);
        setPreparingProductIds(new Set());
        setFloorDepth(0.60);
        prevFloorDepthRef.current = 0.60;

        // Restore placements if they exist
        if (state.placements && Array.isArray(state.placements)) {
          const newSelected = new Set<string>();
          const newPlacements = new Map<string, any>();

          state.placements.forEach((p) => {
            const prodId = p.productId || p.id;
            if (prodId) {
              newSelected.add(prodId);
              newPlacements.set(prodId, {
                x: p.x,
                y: p.y,
                scale: p.scale,
                rotation: p.rotation,
                rotationY: p.rotationY ?? 0,
                flipped: p.flipped ?? false,
                hasManualDrag: true,
                userMoved: true,
              });
            }
          });

          setSelected(newSelected);
          setPlacements(newPlacements);
        }

        toast(language === 'vi' ? 'Đã tải thiết kế thành công' : 'Loaded saved design successfully');
      };

      // Clear location state after loading so refreshing doesn't keep reloading it
      window.history.replaceState({}, document.title);
    } else {
      loadSampleRoom();
    }
  }, [location.state, loadSampleRoom, language, toast]);

  // Update Canvas Size based on Image Ratio
  useEffect(() => {
    if (!roomImage) return;
    const ratio = roomImage.width / roomImage.height || 1.6;
    const w = 1280;
    const h = Math.round(1280 / ratio);
    setStage({ width: w, height: h });
  }, [roomImage]);

  // When floorDepth changes, update all product Y positions to match the new floor
  useEffect(() => {
    const prevFloorDepth = prevFloorDepthRef.current;
    if (prevFloorDepth === floorDepth) return;

    // Calculate the delta (how much the floor moved)
    const delta = floorDepth - prevFloorDepth;
    prevFloorDepthRef.current = floorDepth;

    // Update all placements to move products to the new floor level
    setPlacements((current) => {
      if (current.size === 0) return current;
      const next = new Map(current);
      for (const [id, placement] of next) {
        // Only adjust if user hasn't manually dragged this product
        if (!placement.hasManualDrag) {
          next.set(id, {
            ...placement,
            y: Math.max(floorDepth, Math.min(0.95, placement.y + delta)),
          });
        }
      }
      return next;
    });
    triggerRenderRef.current?.();
  }, [floorDepth]);

  // Manage placements helper
  const ensurePlacement = (id: string, currentSelected: Set<string>, currentPlacements: Map<string, any>) => {
    if (currentPlacements.has(id)) return currentPlacements.get(id);
    const index = [...currentSelected].indexOf(id);
    // Place products in the CENTER SAFE ZONE of the room (x: 0.35-0.65).
    // Avoid edges (x < 0.30 or x > 0.75) where stairs, doors, walls, and windows typically are.
    // This ensures products land on open floor area regardless of room layout.
    const pattern = [
      { x: 0.50, y: floorDepth, scale: 1 },
      { x: 0.62, y: floorDepth + 0.02, scale: 0.92 },
      { x: 0.38, y: floorDepth + 0.01, scale: 0.95 },
      { x: 0.55, y: floorDepth + 0.05, scale: 0.85 },
      { x: 0.45, y: floorDepth + 0.03, scale: 0.90 },
      { x: 0.58, y: floorDepth + 0.04, scale: 0.88 },
    ];
    const item = pattern[index === -1 ? 0 : index % pattern.length];
    // Default: no rotation/flip — show product at natural front-facing angle.
    // The AI will handle perspective correction in the final render.
    // Users can manually adjust rotationY and flip if needed.
    const p = {
      ...item,
      rotation: 0,
      rotationY: 0,
      flipped: false,
      hasManualRotationY: false,
      hasManualFlip: false
    };
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
    const newSelected = new Set(selected);
    newSelected.add(product.id);
    setSelected(newSelected);
    setPlacements((current) => {
      const next = new Map(current);
      ensurePlacement(product.id, newSelected, next);
      return next;
    });

    // Auto-reposition: ask AI to find proper room-aware positions
    // This runs in background after the product appears at its default position
    if (backendOnline && roomDataUrl) {
      const allSelectedProducts = localizedProductsList.filter((p) => newSelected.has(p.id));
      fetch("/api/ai-room-planner/auto-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomImage: roomDataUrl,
          products: allSelectedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.type,
          })),
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setPlacements((current) => {
              const next = new Map(current);
              for (const pos of data.data) {
                // Only update if user hasn't manually dragged the product
                const existing = next.get(pos.id);
                if (existing && !existing.hasManualDrag) {
                  next.set(pos.id, {
                    ...existing,
                    x: pos.x,
                    y: pos.y,
                    scale: pos.scale,
                  });
                }
              }
              return next;
            });
            triggerRenderRef.current?.();
          }
        })
        .catch(() => {
          // Silently fail — product stays at safe default position
        });
    }
  };

  // Toggle products from catalog
  const toggleProduct = async (id: string) => {
    if (generatedImage) {
      setRoomImage(generatedImage);
      if (generatedImage.src) {
        setRoomDataUrl(generatedImage.src);
      }
      setSelected(new Set());
      setPlacements(new Map());
      setActiveId(null);
      setGeneratedImage(null);
      setLastGenerationMode(null);
      setShowBeforeAfter(false);
    } else if (lastGenerationMode === "mock-preview") {
      setGeneratedImage(null);
      setLastGenerationMode(null);
      setShowBeforeAfter(false);
    } else {
      setGeneratedImage(null);
      setLastGenerationMode(null);
    }
    const product = localizedProductsList.find((item) => item.id === id);
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
      toast(t('aiRoomPlanner.preparingProductImage').replace('{name}', product.name));
      try {
        await prepareProductImageForExport(product);
      } catch (error) {
        console.warn("Product image preparation failed:", error);
        toast(t('aiRoomPlanner.couldNotPrepareImage'));
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
      p.hasManualFlip = true; // Mark as manually flipped
      setPlacements(next);
      setActiveId(id);
    }
  };

  // Adjust placement Y-rotation (3D yaw)
  const handlePlacementRotateY = (id: string, val: number) => {
    setGeneratedImage(null);
    setLastGenerationMode(null);
    const next = new Map(placements);
    const p = next.get(id);
    if (p) {
      p.rotationY = val;
      p.hasManualRotationY = true; // Mark as manually controlled
      setPlacements(next);
      setActiveId(id);
    }
  };

  // Drag operations
  const pointHitsProductImage = (product: CatalogProduct, placement: any, cx: number, cy: number) => {
    const box = getProductBox(product, placement);
    if (cx < box.left || cx > box.right || cy < box.top || cy > box.bottom) return false;

    const img = getProductImage(product, () => { });
    if (!img) return true;

    const size = stage.width * product.baseScale * globalScale * placement.scale;
    const x = stage.width * placement.x;
    const y = stage.height * placement.y;
    let localX = cx - x;
    let localY = cy - y;

    // 1. Inverse scale/flip first
    const rotY = (placement.rotationY || 0) * Math.PI / 180;
    const scaleX = Math.cos(rotY);
    const flipDir = placement.flipped ? -1 : 1;
    const combinedScaleX = flipDir * scaleX;
    if (Math.abs(combinedScaleX) > 0.01) {
      localX = localX / combinedScaleX;
    }

    // 2. Inverse 2D rotation second
    if (placement.rotation) {
      const angle = (-placement.rotation * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nextX = localX * cos - localY * sin;
      const nextY = localX * sin + localY * cos;
      localX = nextX;
      localY = nextY;
    }

    // 3. Inverse perspective vertical skew third
    const skewY = (placement.x - 0.48) * 0.15;
    localY = localY - skewY * localX;

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
      p.hasManualDrag = true;

      setPlacements(next);
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  // Trigger real AI generation
  const handleGenerate = async () => {
    if (!roomDataUrl) {
      toast(t('aiRoomPlanner.uploadPhotoFirst'));
      return;
    }
    if (!selected.size) {
      toast(t('aiRoomPlanner.selectAtLeastOneProduct'));
      return;
    }
    if (isPreparingProducts) {
      toast(t('aiRoomPlanner.waitForImages'));
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const selectedCatalogProducts = localizedProductsList.filter((p) => selected.has(p.id));
      await Promise.allSettled(selectedCatalogProducts.map((product) => prepareProductImageForExport(product)));

      // Auto-place: ask AI to analyze room and determine optimal positions
      if (pipelineMode === "auto-place") {
        try {
          const posResponse = await fetch("/api/ai-room-planner/auto-position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomImage: roomDataUrl,
              products: selectedCatalogProducts.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.type,
              })),
            }),
          });
          const posData = await posResponse.json();
          if (posData.success && Array.isArray(posData.data)) {
            for (const pos of posData.data) {
              placements.set(pos.id, {
                x: pos.x,
                y: pos.y,
                scale: pos.scale,
                rotation: 0,
                rotationY: 0,
                flipped: false,
                hasManualRotationY: false,
                hasManualFlip: false,
              });
            }
          }
        } catch (err) {
          console.warn("Auto-position AI failed, using current positions:", err);
        }
        // Update React state for UI
        setPlacements(new Map(placements));
      }

      const selectedProducts = selectedCatalogProducts
        .map((p) => ({
          id: p.id,
          name: p.name,
          category: p.type,
          imageUrl: p.imagePath,
          placement: placements.get(p.id),
        }));

      // Export composite using an OFFSCREEN canvas (avoids selection ring from main canvas)
      let imagePayload = roomDataUrl;
      let hasCompositePayload = false;

      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = stage.width;
        offscreen.height = stage.height;
        const offCtx = offscreen.getContext("2d");
        if (offCtx) {
          drawRoom(offCtx);
          drawAiLighting(offCtx);
          drawSelectedProducts(offCtx, false, () => { });
          // Skip vignette for auto-place to avoid dark borders in AI input
          if (pipelineMode !== "auto-place") {
            drawAfterVignette(offCtx);
          }
          imagePayload = offscreen.toDataURL("image/png");
          hasCompositePayload = true;
        }
      } catch (err) {
        console.warn("Could not export composited canvas with product reference:", err);
      }

      const maskPayload = createPlacementMask();

      if (pipelineMode === "generative" && !hasCompositePayload) {
        throw new Error(t('aiRoomPlanner.couldNotExportRef'));
      }

      // Auto-place sends raw clean room; other modes send composite
      const finalRoomImage = imagePayload;

      const response = await fetch("/api/ai-room-planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomImage: finalRoomImage,
          maskImage: maskPayload,
          prompt: stylePrompt,
          style: stylePrompt,
          pipelineMode,
          floorBlend,
          products: selectedProducts,
        }),
      });

      if (!response.ok) {
        // Parse error message from the server
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || 'API error';
        // Refresh turns info so the UI reflects the exhausted state
        if (response.status === 429) {
          getAiTurns().then((info) => setTurnsInfo(info)).catch(() => { });
        }
        throw new Error(errMsg);
      }

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
          setShowBeforeAfter(true);
          toast(generated.message || t('aiRoomPlanner.previewGenerated'));
        } else {
          setGeneratedImage(null);
          setShowBeforeAfter(true);
          toast(generated.message || t('aiRoomPlanner.previewRenderedLocally'));
        }

        if (generated.notes) {
          setDesignerNotes(generated.notes);
        }

        // Update turns info returned from the server
        if (generated.turnsInfo) {
          setTurnsInfo(generated.turnsInfo as TurnsInfo);
        } else {
          // Fallback: re-fetch
          getAiTurns().then((info) => setTurnsInfo(info)).catch(() => { });
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
      setShowBeforeAfter(true);
      const errMsg = e instanceof Error ? e.message : t('aiRoomPlanner.aiUnavailableLocalShow');
      toast(errMsg);
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

  // Save Design to Backend
  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast(language === 'vi' ? 'Vui lòng nhập tên thiết kế' : 'Please enter a design name');
      return;
    }

    if (!roomImage || !afterCanvasRef.current || !beforeCanvasRef.current) {
      toast(language === 'vi' ? 'Không có dữ liệu thiết kế để lưu' : 'No design data to save');
      return;
    }

    setIsSavingDesign(true);

    try {
      const beforeUrl = beforeCanvasRef.current.toDataURL("image/png");
      const afterUrl = afterCanvasRef.current.toDataURL("image/png");

      const productsPayload = [...selected].map((id) => {
        const p = placements.get(id) || {};
        return {
          productId: id,
          x: p.x || 0.5,
          y: p.y || 0.5,
          scale: p.scale || 1,
          rotation: p.rotation || 0,
          rotationY: p.rotationY || 0,
          flipped: p.flipped || false,
        };
      });

      const saved = await saveDesign({
        name: designName,
        beforeImageUrl: beforeUrl,
        afterImageUrl: afterUrl,
        products: productsPayload,
        prompt: stylePrompt,
        stylePreset: stylePreset,
      });

      toast(language === 'vi' ? 'Lưu thiết kế thành công!' : 'Design saved successfully!');
      if (saved && saved._id) {
        setSavedDesignId(saved._id);
      } else {
        setShowSaveModal(false);
      }
      setDesignName("");
    } catch (err: any) {
      console.error("Failed to save design:", err);
      toast(err.message || (language === 'vi' ? 'Không thể lưu thiết kế' : 'Failed to save design'));
    } finally {
      setIsSavingDesign(false);
    }
  };

  const canGenerateNow = !isGenerating && !isPreparingProducts && (turnsInfo === null || turnsInfo.unlimited || (turnsInfo.turnsRemaining ?? 0) > 0);

  return (
    <div className="rp-mobile">
      <style>{`
        .rp-mobile {
          --ink: #17211f;
          --muted: #66726f;
          --line: rgba(255,255,255,0.08);
          --panel: #121615;
          --surface: #0a0d0c;
          --surface-strong: #1a2220;
          --teal: #c8b898;
          --teal-dark: #8c7b5f;
          --coral: #d66b4d;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #080a09;
          color: #d1d5db;
          font-family: Inter, ui-sans-serif, sans-serif;
        }
        .rp-mobile * { box-sizing: border-box; }
        .rp-mobile button { border: 0; background: transparent; font: inherit; color: inherit; }

        /* Top Bar */
        .rp-mobile .m-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
        }
        .rp-mobile .m-topbar h1 {
          font-size: 15px;
          font-weight: 800;
          color: #f3f4f6;
          margin: 0;
        }
        .rp-mobile .m-topbar .m-eyebrow {
          font-size: 9px;
          font-weight: 700;
          color: var(--teal);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin: 0;
        }
        .rp-mobile .m-status-pill {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 8px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          background: var(--surface-strong);
          color: var(--teal);
        }

        /* Tab Content Area */
        .rp-mobile .m-content {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Canvas Tab */
        .rp-mobile .m-canvas-tab {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rp-mobile .compare-frame {
          flex: 1;
          position: relative;
          background: var(--surface);
        }
        .rp-mobile .compare-stage {
          --split: 48%;
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          touch-action: none;
        }
        .rp-mobile .compare-stage canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%; display: block;
        }
        .rp-mobile .before-layer { clip-path: inset(0 calc(100% - var(--split)) 0 0); }
        .rp-mobile .split-line {
          position: absolute; top: 0; bottom: 0;
          left: var(--split); width: 2px;
          background: rgba(255,255,255,0.9);
          pointer-events: none;
        }
        .rp-mobile .split-line span {
          position: absolute; top: 50%; left: 50%;
          width: 28px; height: 28px;
          border: 2px solid #fff; border-radius: 50%;
          background: rgba(12,14,13,0.85);
          transform: translate(-50%,-50%);
        }
        .rp-mobile .split-range {
          position: absolute; inset: 0;
          width: 100%; height: 100%; opacity: 0; cursor: ew-resize;
        }
        .rp-mobile .m-canvas-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          gap: 8px;
          background: var(--panel);
          border-top: 1px solid var(--line);
        }

        /* Catalog Tab */
        .rp-mobile .m-catalog-tab {
          padding: 16px;
        }
        .rp-mobile .m-catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .rp-mobile .m-product-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 160ms ease;
        }
        .rp-mobile .m-product-card.selected {
          border-color: var(--teal);
          background: rgba(200,184,152,0.07);
        }
        .rp-mobile .m-product-card img, .rp-mobile .m-product-card .m-thumb {
          width: 100%; aspect-ratio: 1; object-fit: contain;
          border-radius: 8px; background: var(--surface-strong);
        }
        .rp-mobile .m-product-card strong {
          font-size: 12px; font-weight: 700; color: #e5e7eb;
          display: block; line-height: 1.3;
        }
        .rp-mobile .m-product-card small {
          font-size: 10px; color: var(--muted);
        }
        .rp-mobile .m-sel-badge {
          position: absolute; top: 8px; right: 8px;
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--teal); color: var(--ink);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
        }

        /* Settings Tab */
        .rp-mobile .m-settings-tab {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .rp-mobile .m-section-label {
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #6b7280; margin-bottom: 10px;
        }
        .rp-mobile .m-drop-zone {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; min-height: 90px;
          border: 2px dashed rgba(200,184,152,0.25);
          border-radius: 12px;
          background: var(--surface);
          cursor: pointer; text-align: center; padding: 16px;
        }
        .rp-mobile .m-drop-zone:active { border-color: var(--teal); }
        .rp-mobile .m-drop-zone input { display: none; }
        .rp-mobile .m-preset-scroll {
          display: flex; gap: 8px; overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .rp-mobile .m-preset-scroll::-webkit-scrollbar { display: none; }
        .rp-mobile .m-preset-btn {
          flex-shrink: 0; padding: 7px 14px;
          font-size: 11px; font-weight: 700;
          border-radius: 20px; cursor: pointer;
          border: 1px solid var(--line);
          background: var(--surface); color: #9ca3af;
          white-space: nowrap;
          transition: all 150ms;
        }
        .rp-mobile .m-preset-btn.active {
          background: var(--teal-dark); color: #fff; border-color: var(--teal-dark);
        }
        .rp-mobile .m-textarea {
          width: 100%; background: var(--surface-strong);
          border: 1px solid var(--line); border-radius: 10px;
          padding: 10px 12px; font-size: 12px; color: #d1d5db;
          resize: vertical; min-height: 70px; font-family: inherit;
        }
        .rp-mobile .m-range-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          font-size: 11px; font-weight: 700; color: #9ca3af;
        }
        .rp-mobile .m-range-row input[type="range"] {
          flex: 1; accent-color: var(--teal);
        }
        .rp-mobile .m-pipeline-row {
          display: flex; gap: 6px;
        }
        .rp-mobile .m-pipeline-btn {
          flex: 1; padding: 8px 6px;
          font-size: 11px; font-weight: 700;
          border-radius: 8px; cursor: pointer; text-align: center;
          border: 1px solid var(--line);
          background: var(--surface); color: #9ca3af;
          transition: all 150ms;
        }
        .rp-mobile .m-pipeline-btn.active {
          background: var(--surface-strong); color: var(--teal); border-color: var(--teal-dark);
        }
        .rp-mobile .m-check-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #9ca3af;
        }
        .rp-mobile .m-check-row input { accent-color: var(--teal); }

        /* Selected Items in settings */
        .rp-mobile .m-selected-item {
          border: 1px solid var(--line); border-radius: 10px;
          background: var(--surface); padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .rp-mobile .m-selected-item.active { border-color: var(--teal); }
        .rp-mobile .m-note-item {
          font-size: 12px; color: var(--muted); line-height: 1.5;
          padding: 10px 12px; background: var(--surface);
          border-radius: 8px; border-left: 2px solid var(--teal-dark);
        }

        /* Bottom Tab Bar */
        .rp-mobile .m-tab-bar {
          display: flex;
          background: var(--panel);
          border-top: 1px solid var(--line);
          flex-shrink: 0;
        }
        .rp-mobile .m-tab-btn {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; gap: 3px;
          padding: 10px 4px 12px;
          font-size: 10px; font-weight: 700;
          color: #6b7280; cursor: pointer;
          transition: color 150ms;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .rp-mobile .m-tab-btn.active { color: var(--teal); }
        .rp-mobile .m-tab-btn svg { margin-bottom: 1px; }

        /* Floating Generate Button */
        .rp-mobile .m-gen-fab {
          position: fixed;
          bottom: 72px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex; align-items: center; gap: 8px;
          padding: 0 28px;
          height: 48px;
          border-radius: 24px;
          background: linear-gradient(135deg, #c8b898 0%, #a08c6a 100%);
          color: #17211f;
          font-size: 13px; font-weight: 800;
          letter-spacing: 0.06em;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(200,184,152,0.35), 0 2px 8px rgba(0,0,0,0.4);
          border: 0;
          transition: opacity 200ms, transform 200ms;
          white-space: nowrap;
        }
        .rp-mobile .m-gen-fab:disabled {
          opacity: 0.45; transform: translateX(-50%) scale(0.97);
          cursor: not-allowed;
        }
        .rp-mobile .m-gen-fab .m-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(23,33,31,0.3);
          border-top-color: #17211f;
          border-radius: 50%;
          animation: m-spin 0.7s linear infinite;
        }
        @keyframes m-spin { to { transform: rotate(360deg); } }

        /* Toast */
        .rp-mobile .m-toast {
          position: fixed; top: 70px; left: 50%;
          transform: translateX(-50%) translateY(-8px);
          opacity: 0;
          background: var(--surface-strong);
          color: #e5e7eb;
          font-size: 12px; font-weight: 600;
          padding: 9px 18px; border-radius: 20px;
          border: 1px solid var(--line);
          pointer-events: none; z-index: 9999;
          transition: all 200ms;
          white-space: nowrap;
        }
        .rp-mobile .m-toast.show {
          opacity: 1; transform: translateX(-50%) translateY(0);
        }

        /* Save Modal */
        .rp-mobile .m-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          display: grid; place-items: center;
          z-index: 10000; padding: 24px;
          backdrop-filter: blur(8px);
        }
        .rp-mobile .m-modal {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 24px;
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .rp-mobile .m-input {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #fff;
          width: 100%; outline: none; font-family: inherit;
        }
        .rp-mobile .m-primary-btn {
          height: 42px; padding: 0 20px;
          border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: 0;
          background: var(--teal); color: var(--ink);
        }
        .rp-mobile .m-ghost-btn {
          height: 42px; padding: 0 18px;
          border-radius: 10px; font-size: 12px; font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--line); color: #9ca3af;
          background: transparent;
        }
      `}</style>

      {/* ── TOP HEADER ── */}
      <header className="m-topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <p className="m-eyebrow">LIVAXIS STUDIO</p>
          <h1>{t('aiRoomPlanner.title')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadSampleRoom}
            style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 8 }}
          >
            {t('aiRoomPlanner.sampleRoom')}
          </button>
          <span className="m-status-pill">{t(`aiRoomPlanner.${aiStatusKey}`)}</span>
        </div>
      </header>

      {/* ── MAIN TAB CONTENT ── */}
      <div className="m-content">

        {/* ── TAB: CANVAS ── */}
        {activeTab === 'canvas' && (
          <div className="m-canvas-tab">
            {/* Canvas area */}
            <div className="compare-frame">
              <div
                className="compare-stage"
                style={{ '--split': `${sliderPos}%`, aspectRatio: `${stage.width} / ${stage.height}` } as any}
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
                {showBeforeAfter && (
                  <>
                    <canvas
                      id="beforeCanvas"
                      ref={beforeCanvasRef}
                      className="before-layer"
                      width={stage.width}
                      height={stage.height}
                    />
                    <div className="split-line" style={{ left: `${sliderPos}%` }}><span /></div>
                    <input
                      className="split-range"
                      type="range" min="0" max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Canvas footer */}
            <div className="m-canvas-footer">
              <div style={{ fontSize: 11, color: '#66726f', fontWeight: 700 }}>
                {showBeforeAfter
                  ? <span style={{ color: 'var(--teal)', fontWeight: 800 }}>← {t('aiRoomPlanner.legendBefore')} / {t('aiRoomPlanner.legendAfter')} →</span>
                  : (language === 'vi' ? 'Kéo thả đồ nội thất' : 'Drag furniture to place')}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {showBeforeAfter && (
                  <button
                    style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid var(--line)', color: 'var(--teal)', background: 'transparent', cursor: 'pointer' }}
                    onClick={() => {
                      const s = stylePreset.charAt(0).toUpperCase() + stylePreset.slice(1);
                      setDesignName(language === 'vi' ? `Thiết kế ${s}` : `${s} Design`);
                      setShowSaveModal(true);
                    }}
                    type="button"
                  >
                    {language === 'vi' ? 'Lưu' : 'Save'}
                  </button>
                )}
                <button
                  style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid var(--line)', color: '#9ca3af', background: 'transparent', cursor: 'pointer' }}
                  onClick={handleDownload}
                  type="button"
                >
                  {t('aiRoomPlanner.downloadResult')}
                </button>
              </div>
            </div>

            {/* Selected items quick list on canvas tab */}
            {selected.size > 0 && !showBeforeAfter && (
              <div style={{ padding: '12px 16px', background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
                <p className="m-section-label" style={{ marginBottom: 8 }}>{t('aiRoomPlanner.selectedItems')} ({selected.size})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {localizedProductsList.filter(p => selected.has(p.id)).map(product => {
                    const pl = placements.get(product.id) || { scale: 1, rotation: 0, rotationY: 0, flipped: false };
                    const isActive = activeId === product.id;
                    return (
                      <div
                        key={product.id}
                        className={`m-selected-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveId(product.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: 12, color: '#e5e7eb' }}>{product.name}</strong>
                          <button
                            style={{ fontSize: 12, color: '#6b7280', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 6 }}
                            onClick={(e) => { e.stopPropagation(); toggleProduct(product.id); }}
                          >×</button>
                        </div>
                        {isActive && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="m-range-row">
                              <span>{t('aiRoomPlanner.itemSizeLabel')}</span>
                              <input type="range" min="60" max="150" value={Math.round(pl.scale * 100)}
                                onChange={(e) => handlePlacementScale(product.id, Number(e.target.value))} />
                            </label>
                            <label className="m-range-row">
                              <span>{t('aiRoomPlanner.itemRotateLabel')}</span>
                              <input type="range" min="0" max="360" value={pl.rotation || 0}
                                onChange={(e) => handlePlacementRotate(product.id, Number(e.target.value))} />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CATALOG ── */}
        {activeTab === 'catalog' && (
          <div className="m-catalog-tab">
            <p className="m-section-label">{t('aiRoomPlanner.furnitureCatalog')} · {t('aiRoomPlanner.selectedCount').replace('{count}', String(selected.size))}</p>
            <div className="m-catalog-grid">
              {localizedProductsList.map((product) => {
                const isSelected = selected.has(product.id);
                const isPreparing = preparingProductIds.has(product.id);
                return (
                  <button
                    key={product.id}
                    className={`m-product-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => { toggleProduct(product.id); if (!isSelected) setActiveTab('canvas'); }}
                    type="button"
                  >
                    {isSelected && <span className="m-sel-badge">✓</span>}
                    {product.imagePath ? (
                      <img src={product.imagePath} alt={product.name} />
                    ) : (
                      <div className="m-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 28, opacity: 0.3 }}>🛋</span>
                      </div>
                    )}
                    <strong>{product.name}</strong>
                    <small>{isPreparing ? '⏳ Processing...' : product.note}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="m-settings-tab">

            {/* Upload Room Photo */}
            <div>
              <p className="m-section-label">{t('aiRoomPlanner.roomImage')}</p>
              <label
                className="m-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadRoomFile(f); }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadRoomFile(f); }} />
                <span style={{ fontSize: 24, color: 'var(--teal)' }}>+</span>
                <strong style={{ fontSize: 13, color: '#e5e7eb' }}>{t('aiRoomPlanner.uploadRoomPhoto')}</strong>
                <small style={{ fontSize: 11, color: '#6b7280' }}>{imageName}</small>
              </label>
            </div>

            {/* Pipeline Mode */}
            <div>
              <p className="m-section-label">Mode</p>
              <div className="m-pipeline-row">
                {['composite', 'generative', 'auto-place'].map(mode => (
                  <button
                    key={mode}
                    className={`m-pipeline-btn ${pipelineMode === mode ? 'active' : ''}`}
                    onClick={() => { setPipelineMode(mode); setGeneratedImage(null); setLastGenerationMode(null); }}
                    type="button"
                  >
                    {mode === 'composite' ? 'Composite' : mode === 'generative' ? 'AI Blend' : 'Auto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Presets */}
            <div>
              <p className="m-section-label">Style</p>
              <div className="m-preset-scroll">
                {Object.keys(stylePresets).map(preset => (
                  <button
                    key={preset}
                    className={`m-preset-btn ${stylePreset === preset ? 'active' : ''}`}
                    onClick={() => { setStylePreset(preset); setStylePrompt(stylePresets[preset]); setGeneratedImage(null); setLastGenerationMode(null); }}
                    type="button"
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <p className="m-section-label">Prompt</p>
              <textarea
                className="m-textarea"
                value={stylePrompt}
                rows={3}
                onChange={(e) => { setStylePrompt(e.target.value); setGeneratedImage(null); setLastGenerationMode(null); }}
                placeholder="Modern luxury living room..."
              />
            </div>

            {/* Size & Depth Sliders */}
            <div>
              <p className="m-section-label">Adjustments</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="m-range-row">
                  <span>Size</span>
                  <input type="range" min="70" max="145" value={globalScale * 100}
                    onChange={(e) => { setGlobalScale(Number(e.target.value) / 100); setGeneratedImage(null); setLastGenerationMode(null); }} />
                  <span style={{ width: 28, textAlign: 'right' }}>{Math.round(globalScale * 100)}</span>
                </label>
                <label className="m-range-row">
                  <span>Depth</span>
                  <input type="range" min="55" max="88" value={floorDepth * 100}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      setFloorDepth(val);
                      setGeneratedImage(null); setLastGenerationMode(null);
                      const next = new Map(placements);
                      [...selected].forEach((id, idx) => {
                        const p = next.get(id);
                        if (p && !p.userMoved) { p.y = val + (idx % 3) * 0.025; }
                      });
                      setPlacements(next);
                    }} />
                  <span style={{ width: 28, textAlign: 'right' }}>{Math.round(floorDepth * 100)}</span>
                </label>
                <label className="m-check-row">
                  <input type="checkbox" checked={lightMatch}
                    onChange={(e) => { setLightMatch(e.target.checked); setGeneratedImage(null); setLastGenerationMode(null); }} />
                  <span>Light Match</span>
                </label>
              </div>
            </div>

            {/* AI Notes */}
            {designerNotes.length > 0 && (
              <div>
                <p className="m-section-label">{t('aiRoomPlanner.aiNotes')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {designerNotes.map((note, i) => (
                    <div key={i} className="m-note-item">{note}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Shopping List */}
            {showBeforeAfter && selected.size > 0 && (
              <div>
                <p className="m-section-label">{language === 'vi' ? 'Sản phẩm mua sắm' : 'Shopping List'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {localizedProductsList.filter(p => selected.has(p.id)).map(product => {
                    const shopeeLink = product.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;
                    return (
                      <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-strong)', border: '1px solid var(--line)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>
                          {product.imagePath ? <img src={product.imagePath} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#f3f4f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--teal)' }}>{product.price ? `${product.price.toLocaleString('vi-VN')}₫` : (language === 'vi' ? 'Tìm trên Shopee' : 'Find on Shopee')}</p>
                        </div>
                        <a href={shopeeLink} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, background: 'linear-gradient(135deg,#ee4d2d,#ff6633)', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
                        >
                          <ShoppingBag size={11} />
                          <span>{language === 'vi' ? 'Mua' : 'Buy'}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FLOATING GENERATE BUTTON ── */}
      <button
        className="m-gen-fab"
        disabled={!canGenerateNow}
        onClick={() => {
          if (turnsInfo && !turnsInfo.unlimited && (turnsInfo.turnsRemaining ?? 0) <= 0) {
            navigate('/subscription'); return;
          }
          setActiveTab('canvas');
          handleGenerate();
        }}
        type="button"
      >
        {isGenerating ? (
          <><div className="m-spinner" /> {t('aiRoomPlanner.processingAi')}</>
        ) : isPreparingProducts ? (
          <><div className="m-spinner" /> {t('aiRoomPlanner.preparingImages')}</>
        ) : turnsInfo && !turnsInfo.unlimited && (turnsInfo.turnsRemaining ?? 0) <= 0 ? (
          t('aiRoomPlanner.upgradeToContinue')
        ) : (
          t('aiRoomPlanner.generateAfter')
        )}
      </button>

      {/* ── BOTTOM TAB BAR ── */}
      <nav className="m-tab-bar">
        <button className={`m-tab-btn ${activeTab === 'canvas' ? 'active' : ''}`} onClick={() => setActiveTab('canvas')} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
          Canvas
        </button>
        <button className={`m-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
          </svg>
          Catalog
          {selected.size > 0 && <span style={{ position: 'absolute', top: 8, right: 'calc(50% - 22px)', width: 16, height: 16, borderRadius: 8, background: 'var(--teal)', color: 'var(--ink)', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selected.size}</span>}
        </button>
        <button className={`m-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} type="button" style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          Settings
        </button>
      </nav>

      {/* ── SAVE DESIGN MODAL ── */}
      {showSaveModal && (
        <div className="m-modal-overlay" onClick={() => !isSavingDesign && setShowSaveModal(false)}>
          <div className="m-modal" onClick={(e) => e.stopPropagation()}>
            {savedDesignId ? (
              <>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f3f4f6' }}>
                  {language === 'vi' ? '✅ Đã lưu!' : '✅ Saved!'}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
                  {language === 'vi' ? `Thiết kế "${designName}" đã được lưu thành công.` : `Design "${designName}" has been saved.`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="m-ghost-btn" onClick={() => { setShowSaveModal(false); setSavedDesignId(null); }}>{t('common.close')}</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f3f4f6' }}>
                  {language === 'vi' ? 'Lưu thiết kế' : 'Save Design'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {language === 'vi' ? 'Tên thiết kế' : 'Design Name'}
                  </label>
                  <input
                    className="m-input"
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder={language === 'vi' ? 'Nhập tên thiết kế...' : 'Enter design name...'}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="m-ghost-btn" onClick={() => setShowSaveModal(false)} disabled={isSavingDesign}>{t('common.cancel')}</button>
                  <button className="m-primary-btn" onClick={handleSaveDesign} disabled={isSavingDesign}>
                    {isSavingDesign ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu ngay' : 'Save')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`m-toast ${toastShow ? 'show' : ''}`}>{toastMessage}</div>
    </div>
  );
}

