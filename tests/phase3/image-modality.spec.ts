import { ExtractTextFromImage, ProviderFailure, type OcrProvider } from '@salinaral/application';
import { prepareImageForOcr } from '@salinaral/infrastructure';
import { describe, expect, it } from 'vitest';

class FakeOcrProvider implements OcrProvider {
  public readonly calls: { buffer: Buffer; mimeType: string }[] = [];

  public async extractText(buffer: Buffer): Promise<{
    extractedText: string;
    reviewRequired: true;
    reviewCues: readonly { kind: 'scientific_term'; startOffset: number; endOffset: number }[];
    warnings: readonly [];
  }> {
    this.calls.push({ buffer, mimeType: 'image/png' });
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
      mimeType: 'image/png',
      originalSizeBytes: Buffer.from('fake-image-bytes').length,
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
        mimeType: 'image/png',
        originalSizeBytes: 6 * 1024 * 1024,
        width: 5000,
        height: 5000,
      }),
    ).rejects.toMatchObject({ code: 'unsafe_image' });
  });

  it('rejects a declared MIME type that does not match the decoded image', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );

    await expect(prepareImageForOcr(png, 'image/jpeg')).rejects.toMatchObject({
      code: 'unsafe_image',
    });
  });

  it('maps empty provider text to a stable invalid-response failure', async () => {
    const provider: OcrProvider = {
      async extractText() {
        return {
          extractedText: '   ',
          reviewRequired: true,
          reviewCues: [],
          warnings: [],
        };
      },
    };

    await expect(
      new ExtractTextFromImage(provider).execute({
        buffer: Buffer.from('validated-image'),
        mimeType: 'image/png',
        originalSizeBytes: 15,
        width: 100,
        height: 100,
      }),
    ).rejects.toBeInstanceOf(ProviderFailure);
  });
});
