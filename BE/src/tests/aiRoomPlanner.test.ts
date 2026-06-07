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
    expect(result.prompt).toContain('This is an interior room photograph with furniture already placed.');
    expect(result.prompt).toContain('Make MINIMAL changes to the image.');
    expect(result.prompt).toContain('Do NOT add, remove, replace, move, or redesign ANY furniture or object in the scene.');
    expect(result.prompt).toContain('Style direction for lighting ONLY: scandinavian design.');
  });
});
