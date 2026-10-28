import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_PROCESSING_MODES } from '../src/lib/types.ts';

test('Video Call Optimization & Processing Configuration', async (t) => {
  await t.test('all 4 camera processing modes are defined with distinct filter styles', () => {
    assert.strictEqual(CAMERA_PROCESSING_MODES.length, 4);

    const ids = CAMERA_PROCESSING_MODES.map((m) => m.id);
    assert.deepStrictEqual(ids, ['studio-hd', 'low-light', 'warm-glow', 'natural']);

    // Studio HD should enhance contrast, brightness and saturation for crystal-clear facial contours
    const studioHd = CAMERA_PROCESSING_MODES.find((m) => m.id === 'studio-hd');
    assert.ok(studioHd);
    assert.ok(studioHd.filterStyle.includes('contrast'));
    assert.ok(studioHd.filterStyle.includes('brightness'));
    assert.ok(studioHd.filterStyle.includes('saturate'));

    // Low-light boost should provide higher brightness lift for dark movie watching rooms
    const lowLight = CAMERA_PROCESSING_MODES.find((m) => m.id === 'low-light');
    assert.ok(lowLight);
    assert.ok(lowLight.filterStyle.includes('brightness(1.24)'));

    // Warm glow should include romantic candlelit sepia/warmth tones
    const warmGlow = CAMERA_PROCESSING_MODES.find((m) => m.id === 'warm-glow');
    assert.ok(warmGlow);
    assert.ok(warmGlow.filterStyle.includes('sepia'));

    // Natural mode should be unfiltered raw feed
    const natural = CAMERA_PROCESSING_MODES.find((m) => m.id === 'natural');
    assert.ok(natural);
    assert.strictEqual(natural.filterStyle, 'none');
  });

  await t.test('each mode provides user-friendly title, icon, and description', () => {
    for (const mode of CAMERA_PROCESSING_MODES) {
      assert.ok(mode.name && mode.name.length > 0);
      assert.ok(mode.shortName && mode.shortName.length > 0);
      assert.ok(mode.icon && mode.icon.length > 0);
      assert.ok(mode.description && mode.description.length > 0);
    }
  });
});

