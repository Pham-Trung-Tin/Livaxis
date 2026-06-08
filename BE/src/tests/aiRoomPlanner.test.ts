import { describe, it, expect } from 'vitest';
import { generateInterior } from '../services/aiRoomPlanner.service';

describe('AI Room Planner Service', () => {
  it('should build a prompt with strict lighting instructions', async () => {
    const payload = {
      roomImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      products: [
        { id: '1', name: 'Linen sofa', category: 'Sofa' }
      ],
      prompt: 'scandinavian design',
      pipelineMode: 'composite' as const
    };

    const result = await generateInterior(payload);
    expect(result.prompt).toContain('You are a world-class interior designer');
    expect(result.prompt).toContain('Re-render and blend the placed product(s)');
    expect(result.prompt).toContain('PRODUCT BLENDING RULES (CRITICAL):');
    expect(result.prompt).toContain('Style: scandinavian design.');
  });
});
