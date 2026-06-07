import { env } from '../config/env';
import { AppError } from '../utils/appError';

export interface GeneratePayload {
  roomImage: string;
  maskImage?: string | null;
  products: Array<{
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
    placement?: {
      flipped?: boolean;
      rotation?: number;
    };
  }>;
  prompt?: string;
  style?: string;
  pipelineMode?: 'composite' | 'generative';
  floorBlend?: 'shadow' | 'rug' | 'clean';
}

export interface GenerateResult {
  mode: string;
  provider: string;
  providerLabel: string;
  realAiEnabled: boolean;
  imageDataUrl: string | null;
  prompt: string;
  message: string;
  notes: string[];
}

export interface RemoveBackgroundPayload {
  imageUrl?: string;
  imageDataUrl?: string;
}

export interface RemoveBackgroundResult {
  provider: string;
  providerLabel: string;
  realAiEnabled: boolean;
  imageDataUrl: string;
  message: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const backgroundRemovalCache = new Map<string, string>();

function getConfiguredProvider(): 'gemini' | 'stability' | 'replicate' | 'free-ai' {
  const requested = env.AI_IMAGE_PROVIDER?.toLowerCase();

  if (requested === 'gemini' && env.GEMINI_API_KEY) return 'gemini';
  if (requested === 'stability' && env.STABILITY_API_KEY) return 'stability';
  if (requested === 'replicate' && env.REPLICATE_API_TOKEN && (env.REPLICATE_MODEL || env.REPLICATE_MODEL_VERSION)) {
    return 'replicate';
  }
  if (env.STABILITY_API_KEY) return 'stability';
  if (env.REPLICATE_API_TOKEN && (env.REPLICATE_MODEL || env.REPLICATE_MODEL_VERSION)) return 'replicate';

  return 'free-ai';
}

function summarizeProviderError(reason: string): string {
  if (/insufficient credit/i.test(reason)) {
    return 'Replicate account has insufficient credit.';
  }

  if (/fetch failed|EACCES|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(reason)) {
    return 'Server could not reach the AI provider.';
  }

  return 'The AI provider returned an error.';
}

export function getAiStatus() {
  const provider = getConfiguredProvider();

  return {
    ok: true,
    provider,
    label:
      provider === 'stability'
        ? 'Stability ready'
        : provider === 'gemini'
          ? 'Gemini ready'
          : provider === 'replicate'
            ? 'Replicate ready'
            : 'Free AI ready',
    realAiEnabled: provider !== 'free-ai',
  };
}

export async function generateInterior(payload: GeneratePayload): Promise<GenerateResult> {
  validatePayload(payload);

  const pipeline = payload.pipelineMode || 'composite';

  if (pipeline === 'composite') {
    return generateWithFreeAi(payload, true);
  }

  // Generative mode: use configured provider
  const provider = getConfiguredProvider();

  if (provider === 'gemini') {
    try {
      return await generateWithGemini(payload);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Gemini error';
      console.warn(`Gemini generation failed, trying Stability fallback: ${reason}`);
      if (env.STABILITY_API_KEY) {
        try { return await generateWithStability(payload); } catch {}
      }
      return generateWithFreeAi(payload, false, reason);
    }
  }

  if (provider === 'stability') {
    // Primary: Inpaint mode — only modifies floor/shadow area around products (mask-based)
    // This preserves the original products 100% while adding natural shadows and lighting
    if (payload.maskImage) {
      try {
        return await generateWithStability(payload);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown Stability inpaint error';
        console.warn(`Stability Inpaint failed, trying Image-to-Image fallback: ${reason}`);
      }
    }
    // Fallback: Image-to-Image with low strength to preserve product appearance
    try {
      return await generateWithStabilityImg2Img(payload);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Stability error';
      console.warn(`Stability Image-to-Image also failed: ${reason}`);
      return generateWithFreeAi(payload, false, reason);
    }
  }

  if (provider === 'replicate') {
    try {
      return await generateWithReplicate(payload);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Replicate error';
      console.warn(`Replicate generation failed: ${reason}`);
      // Fallback: try Stability inpaint for at least floor blending
      if (env.STABILITY_API_KEY && payload.maskImage) {
        try {
          console.warn('Trying Stability AI inpaint as fallback...');
          return await generateWithStability(payload);
        } catch (stabError) {
          console.warn(`Stability fallback also failed: ${stabError instanceof Error ? stabError.message : stabError}`);
        }
      }
      return generateWithFreeAi(payload, false, reason);
    }
  }

  return generateWithFreeAi(payload, false);
}

function dataUrlToBlob(dataUrl: string, fallbackMime = 'image/png'): Blob {
  const match = dataUrl.match(/^data:([^;,]+)?;base64,(.+)$/);
  if (!match) {
    throw new AppError(400, 'INVALID_IMAGE_DATA', 'Expected a base64 data URL image');
  }

  const mimeType = match[1] || fallbackMime;
  const buffer = Buffer.from(match[2], 'base64');
  return new Blob([buffer], { type: mimeType });
}

function dataUrlToGeminiImageInput(dataUrl: string, fallbackMime = 'image/png') {
  const match = dataUrl.match(/^data:([^;,]+)?;base64,(.+)$/);
  if (!match) {
    throw new AppError(400, 'INVALID_IMAGE_DATA', 'Expected a base64 data URL image');
  }

  return {
    type: 'image',
    mime_type: match[1] || fallbackMime,
    data: match[2],
  };
}

async function blobToGeminiImageInput(blob: Blob) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return {
    type: 'image',
    mime_type: blob.type || 'image/jpeg',
    data: buffer.toString('base64'),
  };
}

function findGeminiImageBlock(value: unknown): { mimeType: string; data: string } | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const data = record.data;
  const type = record.type;
  const mimeType = record.mime_type || record.mimeType;

  if (
    typeof data === 'string' &&
    data.length > 0 &&
    typeof mimeType === 'string' &&
    (type === 'image' || mimeType.startsWith('image/'))
  ) {
    return { mimeType, data };
  }

  for (const item of Object.values(record)) {
    if (Array.isArray(item)) {
      for (const child of item) {
        const found = findGeminiImageBlock(child);
        if (found) return found;
      }
    } else {
      const found = findGeminiImageBlock(item);
      if (found) return found;
    }
  }

  return null;
}

async function fetchRemoteImageAsBlob(imageUrl: string): Promise<Blob> {
  let parsed: URL;

  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new AppError(400, 'INVALID_IMAGE_URL', 'Product image URL must be absolute');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new AppError(400, 'INVALID_IMAGE_URL', 'Product image URL must use HTTP or HTTPS');
  }

  const response = await fetch(parsed.toString(), {
    headers: {
      Accept: 'image/*',
      'User-Agent': 'Livaxis-AI-Room-Planner/1.0',
    },
  });

  if (!response.ok) {
    throw new AppError(502, 'IMAGE_FETCH_FAILED', `Failed to fetch product image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return new Blob([buffer], { type: contentType });
}

function validatePayload(payload: GeneratePayload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(400, 'INVALID_PAYLOAD', 'Missing request payload');
  }

  if (!payload.roomImage || typeof payload.roomImage !== 'string') {
    throw new AppError(400, 'MISSING_ROOM_IMAGE', 'Missing room image');
  }

  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new AppError(400, 'NO_PRODUCTS', 'Select at least one furniture product');
  }
}

function validateRemoveBackgroundPayload(payload: RemoveBackgroundPayload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(400, 'INVALID_PAYLOAD', 'Missing request payload');
  }

  if (!payload.imageUrl && !payload.imageDataUrl) {
    throw new AppError(400, 'MISSING_PRODUCT_IMAGE', 'Missing product image');
  }
}

export async function removeProductBackground(payload: RemoveBackgroundPayload): Promise<RemoveBackgroundResult> {
  validateRemoveBackgroundPayload(payload);

  const source = payload.imageUrl ? `URL: ${payload.imageUrl.slice(0, 80)}...` : 'DataURL (inline)';
  console.log(`[RemoveBG] Request received for: ${source}`);

  const cacheKey = payload.imageUrl || null;
  if (cacheKey && backgroundRemovalCache.has(cacheKey)) {
    console.log('[RemoveBG] Cache HIT - returning cached cutout');
    return {
      provider: 'stability',
      providerLabel: 'Stability Remove Background',
      realAiEnabled: true,
      imageDataUrl: backgroundRemovalCache.get(cacheKey)!,
      message: 'Product background removed successfully',
    };
  }

  // 1. Try Stability AI first if configured
  if (env.STABILITY_API_KEY) {
    try {
      console.log('[RemoveBG] Cache MISS - calling Stability AI API...');
      let imageBlob: Blob;
      try {
        imageBlob = payload.imageDataUrl
          ? dataUrlToBlob(payload.imageDataUrl)
          : await fetchRemoteImageAsBlob(payload.imageUrl!);
        console.log(`[RemoveBG] Image blob prepared: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
      } catch (err) {
        console.error('[RemoveBG] Failed to prepare image blob:', err);
        throw err;
      }

      const form = new FormData();
      form.append('image', imageBlob, 'product-source.png');
      form.append('output_format', 'png');

      const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/remove-background', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STABILITY_API_KEY}`,
          Accept: 'image/*',
        },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Stability remove background failed: ${response.status} ${text}`);
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = Buffer.from(await response.arrayBuffer());
      const imageDataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

      console.log(`[RemoveBG] SUCCESS (Stability) - output: ${buffer.length} bytes, type: ${contentType}`);

      if (cacheKey) {
        backgroundRemovalCache.set(cacheKey, imageDataUrl);
      }

      return {
        provider: 'stability',
        providerLabel: 'Stability Remove Background',
        realAiEnabled: true,
        imageDataUrl,
        message: 'Product background removed successfully',
      };
    } catch (error) {
      console.warn(`[RemoveBG] Stability background removal failed: ${error instanceof Error ? error.message : error}. Trying Replicate fallback...`);
    }
  }

  // 2. Fallback to Replicate if Stability failed or is not configured
  if (env.REPLICATE_API_TOKEN) {
    try {
      console.log('[RemoveBG] Calling Replicate fallback...');
      const imageInput = payload.imageUrl || payload.imageDataUrl;
      if (!imageInput) {
        throw new Error('No image URL or data URL provided');
      }

      const prediction = await createReplicateModelPrediction('lucataco/remove-bg', {
        image: imageInput
      });

      const completed = await waitForReplicatePrediction(prediction.urls.get);
      const outputUrl = Array.isArray(completed.output) ? completed.output[0] : completed.output;

      if (!outputUrl || typeof outputUrl !== 'string') {
        throw new Error('Replicate did not return an output image URL');
      }

      const imageDataUrl = await fetchImageAsDataUrl(outputUrl);
      console.log('[RemoveBG] SUCCESS (Replicate fallback)');

      if (cacheKey) {
        backgroundRemovalCache.set(cacheKey, imageDataUrl);
      }

      return {
        provider: 'replicate',
        providerLabel: 'Replicate Remove Background (Fallback)',
        realAiEnabled: true,
        imageDataUrl,
        message: 'Product background removed successfully (via Replicate)',
      };
    } catch (error) {
      console.error(`[RemoveBG] Replicate background removal failed:`, error);
      throw new AppError(502, 'BACKGROUND_REMOVAL_FAILED', `All background removal providers failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  throw new AppError(500, 'NO_PROVIDER_CONFIGURED', 'No background removal provider (Stability or Replicate) is configured or available');
}

function buildPrompt(payload: GeneratePayload): string {
  const userStyle = payload.prompt || payload.style || 'modern realistic interior design';
  const productNames = payload.products.map((p) => p.name).filter(Boolean).join(', ');

  return [
    `Photorealistic interior design photograph. Products: ${productNames}.`,
    'GOAL: Make the placed product(s) look like they BELONG in this room — as if photographed here originally. The product must appear three-dimensional, solid, and physically present in the space.',
    'PRODUCT RULES:',
    '- Keep each product\'s core identity: same shape, color, material, and design language.',
    '- You MAY make small enhancements to help the product look more realistic: add a decorative cushion on a sofa, a small book on a table, or adjust the viewing angle slightly to match room perspective.',
    '- Do NOT replace, remove, or dramatically redesign any product.',
    'BLENDING RULES:',
    '- Blend product edges seamlessly into the room environment — no hard cutout edges visible.',
    '- Match room lighting: color temperature, light direction from windows, natural highlights and reflections on the product surface.',
    '- Do NOT add dark shadows, ambient occlusion patches, or shadow blobs on the floor. Keep the floor clean and natural.',
    'DECORATION RULES:',
    '- You SHOULD add tasteful complementary items to make the scene feel lived-in: a stylish rug, potted plants, a vase with flowers, books, a throw blanket, decorative cushions, a floor lamp, or wall art.',
    '- These additions should enhance realism and make the main product look grounded and three-dimensional.',
    'OUTPUT:',
    '- Same canvas size, same crop, same camera angle as input.',
    '- Final result must look like one unified professional interior photography — not a composite.',
    '- No gray halos, rectangular borders, or UI artifacts.',
    `Style: ${userStyle}.`,
  ].join(' ');
}

function generateWithFreeAi(
  payload: GeneratePayload,
  isCompositeRequested: boolean,
  fallbackReason?: string,
): GenerateResult {
  const prompt = buildPrompt(payload);

  if (isCompositeRequested) {
    return {
      mode: 'smart-composite',
      provider: 'free-ai',
      providerLabel: 'Smart AI Composite',
      realAiEnabled: true,
      imageDataUrl: null,
      prompt,
      message: 'Furniture placed perfectly onto your room using Smart AI Composite!',
      notes: [
        'Smart AI Composite active: your chosen furniture is blended directly into your original room.',
        "This keeps your room's walls, windows, floors, and dimensions 100% original and unchanged.",
        'Lighting, shadows, and perspective are automatically adjusted to match.',
      ],
    };
  }

  return {
    mode: 'smart-composite',
    provider: 'free-ai',
    providerLabel: 'Smart AI Composite (Fallback)',
    realAiEnabled: false,
    imageDataUrl: null,
    prompt,
    message: 'Generative AI is unavailable. Showing Smart AI Composite preview.',
    notes: [
      fallbackReason
        ? `Generative AI provider failed: ${summarizeProviderError(fallbackReason)}`
        : 'Generative AI (Re-imagine) is not configured because no REPLICATE_API_TOKEN was found on the server.',
      'Fell back to Smart AI Composite to preserve your room background perfectly.',
      fallbackReason
        ? 'Check server network access and Replicate configuration to enable real AI generation.'
        : 'To enable generative re-imagining, add a valid REPLICATE_API_TOKEN in your .env file.',
    ],
  };
}

function buildReplicateInput(payload: GeneratePayload, prompt: string): Record<string, unknown> {
  const model = env.REPLICATE_MODEL || '';
  const imageField = env.REPLICATE_IMAGE_FIELD || (model.includes('flux-kontext') ? 'input_image' : 'image');
  const promptField = env.REPLICATE_PROMPT_FIELD || 'prompt';

  return {
    [promptField]: prompt,
    [imageField]: payload.roomImage,
    aspect_ratio: 'match_input_image',
    output_format: 'jpg',
    safety_tolerance: 2,
    prompt_upsampling: true,
    guidance_scale: 4.5,
  };
}

async function generateWithGemini(payload: GeneratePayload): Promise<GenerateResult> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(500, 'GEMINI_CONFIG_ERROR', 'Missing GEMINI_API_KEY');
  }

  const model = env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
  const prompt = buildPrompt(payload);
  const isMultiple = payload.products.length > 1;
  const productTerm = isMultiple ? 'catalog products' : 'catalog product';
  const productNames = payload.products.map((product) => product.name).filter(Boolean).join(', ');
  const roomInput = dataUrlToGeminiImageInput(payload.roomImage);
  const referenceInputs = (
    await Promise.all(
      payload.products.slice(0, 10).map(async (product) => {
        if (!product.imageUrl) return null;

        try {
          return blobToGeminiImageInput(await fetchRemoteImageAsBlob(product.imageUrl));
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'Unknown product reference fetch error';
          console.warn(`Gemini product reference fetch failed for ${product.name}: ${reason}`);
          return null;
        }
      }),
    )
  ).filter((item): item is { type: string; mime_type: string; data: string } => Boolean(item));

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'x-goog-api-key': env.GEMINI_API_KEY,
      'Content-Type': 'application/json',
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify({
      model,
      input: [
        { type: 'text', text: prompt },
        roomInput,
        ...referenceInputs,
      ],
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: '16:9',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(502, 'GEMINI_ERROR', `Gemini image generation failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const imageBlock = findGeminiImageBlock(data.output_image) || findGeminiImageBlock(data);

  if (!imageBlock) {
    throw new AppError(502, 'GEMINI_NO_IMAGE', 'Gemini did not return an image in the response');
  }

  return {
    mode: 'ai-generated',
    provider: 'gemini',
    providerLabel: 'Gemini Image',
    realAiEnabled: true,
    imageDataUrl: `data:${imageBlock.mimeType};base64,${imageBlock.data}`,
    prompt: prompt,
    message: 'Gemini image blend generated successfully',
    notes: [
      'Gemini used the room composite plus catalog product references.',
      'The prompt allows staging while preserving selected product identity.',
      `Prompt: ${prompt}`,
    ],
  };
}

async function generateWithStability(payload: GeneratePayload): Promise<GenerateResult> {
  if (!env.STABILITY_API_KEY) {
    throw new AppError(500, 'STABILITY_CONFIG_ERROR', 'Missing STABILITY_API_KEY');
  }

  if (!payload.maskImage) {
    throw new AppError(400, 'MISSING_MASK_IMAGE', 'Missing placement mask image');
  }

  const prompt = buildPrompt(payload);
  const form = new FormData();

  form.append('image', dataUrlToBlob(payload.roomImage), 'room-composite.png');
  form.append('mask', dataUrlToBlob(payload.maskImage), 'placement-mask.png');
  form.append(
    'prompt',
    [
      'CRITICAL: The existing furniture in the CENTER of the image must NOT be replaced, removed, or redesigned. Keep the EXACT same product — same shape, same color, same material, same style.',
      'Inside the masked area (thin edge fringe + floor): blend the product edges seamlessly into the room environment.',
      'Match room lighting direction and color temperature on the product surface.',
      'Do NOT add dark shadows, shadow blobs, dark rings, glowing edges, or any border/halo/vignette effect around the product. Keep the floor and surroundings clean and natural.',
      'You may add small decorative items (a rug, plant, cushion, book) near the product to enhance realism.',
      'Do NOT replace the product with different furniture. The product identity must be preserved exactly.',
      payload.prompt || payload.style || 'modern realistic interior design',
    ].join(' '),
  );
  form.append('output_format', 'png');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/inpaint', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(502, 'STABILITY_ERROR', `Stability inpaint failed: ${response.status} ${text}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    mode: 'ai-generated',
    provider: 'stability',
    providerLabel: 'Stability AI Inpaint',
    realAiEnabled: true,
    imageDataUrl: `data:${contentType};base64,${buffer.toString('base64')}`,
    prompt,
    message: 'AI blend generated successfully',
    notes: [
      'Stability AI blended lighting and shadows around the exact product reference.',
      'The generated image is used directly so no extra product frame is drawn on top.',
      `Prompt: ${prompt}`,
    ],
  };
}

async function generateWithStabilityImg2Img(payload: GeneratePayload): Promise<GenerateResult> {
  if (!env.STABILITY_API_KEY) {
    throw new AppError(500, 'STABILITY_CONFIG_ERROR', 'Missing STABILITY_API_KEY');
  }

  const prompt = buildPrompt(payload);
  const form = new FormData();

  form.append('image', dataUrlToBlob(payload.roomImage), 'room-composite.png');
  form.append('prompt', prompt);
  form.append('negative_prompt', 'flat cutout, pasted image, 2D sticker, floating object, no shadow, no depth, paper doll, collage, photoshop overlay, unrealistic lighting, gray halo, white border, blurry edges');
  form.append('mode', 'image-to-image');
  form.append('model', 'sd3.5-large');
  form.append('strength', '0.30');
  form.append('output_format', 'png');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STABILITY_API_KEY}`,
      Accept: 'image/*',
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(502, 'STABILITY_ERROR', `Stability SD3 image-to-image failed: ${response.status} ${text}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    mode: 'ai-generated',
    provider: 'stability',
    providerLabel: 'Stability AI SD3.5 Image-to-Image',
    realAiEnabled: true,
    imageDataUrl: `data:${contentType};base64,${buffer.toString('base64')}`,
    prompt,
    message: 'AI room design generated successfully via Stability SD3.5',
    notes: [
      'Stability SD3.5 Image-to-Image generated a photorealistic 3D staging view.',
      'Products are seamlessly blended with natural shadows, lighting, and perspective.',
      `Prompt: ${prompt}`,
    ],
  };
}

async function createReplicateModelPrediction(
  modelSlug: string,
  input: Record<string, unknown>,
): Promise<{ urls: { get: string } }> {
  const [owner, name] = modelSlug.split('/');
  if (!owner || !name) {
    throw new AppError(500, 'REPLICATE_CONFIG_ERROR', 'REPLICATE_MODEL must look like owner/model-name');
  }

  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(502, 'REPLICATE_ERROR', `Replicate model prediction failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<{ urls: { get: string } }>;
}

async function createReplicatePrediction(body: {
  version: string;
  input: Record<string, unknown>;
}): Promise<{ urls: { get: string } }> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(502, 'REPLICATE_ERROR', `Replicate create failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<{ urls: { get: string } }>;
}

async function waitForReplicatePrediction(url: string): Promise<{ output: string | string[] }> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.REPLICATE_API_TOKEN}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AppError(502, 'REPLICATE_ERROR', `Replicate poll failed: ${response.status} ${text}`);
    }

    const prediction = (await response.json()) as { status: string; output: string | string[] };

    if (prediction.status === 'succeeded') return prediction;
    if (['failed', 'canceled'].includes(prediction.status)) {
      throw new AppError(502, 'REPLICATE_ERROR', `Replicate prediction ${prediction.status}`);
    }

    await delay(1500);
  }

  throw new AppError(504, 'REPLICATE_TIMEOUT', 'Replicate prediction timed out');
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(502, 'REPLICATE_ERROR', `Failed to fetch output image: ${response.status}`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

async function generateWithReplicate(payload: GeneratePayload): Promise<GenerateResult> {
  const prompt = buildPrompt(payload);
  const input = buildReplicateInput(payload, prompt);

  const prediction = env.REPLICATE_MODEL
    ? await createReplicateModelPrediction(env.REPLICATE_MODEL, input)
    : await createReplicatePrediction({
        version: env.REPLICATE_MODEL_VERSION!,
        input,
      });

  const completed = await waitForReplicatePrediction(prediction.urls.get);
  const outputUrl = Array.isArray(completed.output) ? completed.output[0] : completed.output;

  if (!outputUrl || typeof outputUrl !== 'string') {
    throw new AppError(502, 'REPLICATE_ERROR', 'Replicate did not return an output image');
  }

  const imageDataUrl = await fetchImageAsDataUrl(outputUrl);

  return {
    mode: 'ai-generated',
    provider: 'replicate',
    providerLabel: 'Replicate AI',
    realAiEnabled: true,
    imageDataUrl,
    prompt,
    message: 'AI after image generated successfully',
    notes: [
      'Replicate returned a generated after image.',
      'Use a ControlNet or inpainting model version for best layout preservation.',
      `Prompt: ${prompt}`,
    ],
  };
}

