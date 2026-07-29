import { ExtractTextFromImage, type OcrProvider } from '@salinaral/application';
import { describe, expect, it } from 'vitest';

class FakeOcrProvider implements OcrProvider {
  public readonly calls: Array<{ buffer: Buffer; mimeType: string }> = [];

  public async extractText(buffer: Buffer, mimeType: string): Promise<{
    extractedText: string;
    reviewRequired: boolean;
    reviewCues: readonly { kind: 'scientific_term'; startOffset: number; endOffset: number }[];
    warnings: readonly string[];
  }> {
    this.calls.push({ buffer, mimeType });
    return {
      extractedText: 'Plants use sunlight to produce food.',
      reviewRequired: true,
      reviewCues: [{ kind: 'scientific_term', startOffset: 11, endOffset: 19 }],
      warnings: [],
    };
  }
}

describe('Phase 3 image modality', () => {
  it('extracts lesson text from a validated image upload', async () => {
    const provider = new FakeOcrProvider();
    const useCase = new ExtractTextFromImage(provider);

    const result = await useCase.execute({
      buffer: Buffer.from('fake-image-bytes'),
      fileName: 'lesson.png',
      mimeType: 'image/png',
      sizeBytes: Buffer.from('fake-image-bytes').length,
      width: 1200,
      height: 800,
    });

    expect(result.extractedText).toContain('Plants');
    expect(result.reviewRequired).toBe(true);
    expect(provider.calls).toHaveLength(1);
  });

  it('rejects images that exceed the supported safety limits', async () => {
    const useCase = new ExtractTextFromImage(new FakeOcrProvider());

    await expect(
      useCase.execute({
        buffer: Buffer.alloc(6 * 1024 * 1024),
        fileName: 'lesson.png',
        mimeType: 'image/png',
        sizeBytes: 6 * 1024 * 1024,
        width: 5000,
        height: 5000,
      }),
    ).rejects.toMatchObject({ code: 'unsafe_image' });
  });
});
