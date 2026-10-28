import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_PROCESSING_MODES, SCREEN_PROCESSING_MODES } from '../src/lib/types.ts';

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

  await t.test('all 4 screen processing modes are defined with calibrated filters', () => {
    assert.strictEqual(SCREEN_PROCESSING_MODES.length, 4);

    const ids = SCREEN_PROCESSING_MODES.map((m) => m.id);
    assert.deepStrictEqual(ids, ['cinema-true', 'vivid-crisp', 'night-cinema', 'source-pure']);

    // Cinema True Tone should have subtle contrast & saturation boost
    const cinemaTrue = SCREEN_PROCESSING_MODES.find((m) => m.id === 'cinema-true');
    assert.ok(cinemaTrue);
    assert.ok(cinemaTrue.filterStyle.includes('contrast(1.08)'));
    assert.ok(cinemaTrue.filterStyle.includes('saturate(1.10)'));

    // Vivid Ultra Clarity should have high saturation boost
    const vivid = SCREEN_PROCESSING_MODES.find((m) => m.id === 'vivid-crisp');
    assert.ok(vivid);
    assert.ok(vivid.filterStyle.includes('saturate(1.22)'));

    // Night Shadow Boost should lift shadow details with brightness(1.15)
    const shadowBoost = SCREEN_PROCESSING_MODES.find((m) => m.id === 'night-cinema');
    assert.ok(shadowBoost);
    assert.ok(shadowBoost.filterStyle.includes('brightness(1.15)'));

    // Direct Source should be raw unmodified output
    const rawDirect = SCREEN_PROCESSING_MODES.find((m) => m.id === 'source-pure');
    assert.ok(rawDirect);
    assert.strictEqual(rawDirect.filterStyle, 'none');
  });

  await t.test('each mode provides user-friendly title, icon, and description', () => {
    for (const mode of [...CAMERA_PROCESSING_MODES, ...SCREEN_PROCESSING_MODES]) {
      assert.ok(mode.name && mode.name.length > 0);
      assert.ok(mode.shortName && mode.shortName.length > 0);
      assert.ok(mode.icon && mode.icon.length > 0);
      assert.ok(mode.description && mode.description.length > 0);
    }
  });

  await t.test('screen share presets verify high-quality 1080p motion encoding and stereo audio', async () => {
    const lk = await import('livekit-client');
    assert.ok(lk.ScreenSharePresets.h1080fps30);
    assert.strictEqual(lk.ScreenSharePresets.h1080fps30.width, 1920);
    assert.strictEqual(lk.ScreenSharePresets.h1080fps30.height, 1080);
    assert.ok(lk.ScreenSharePresets.h1080fps30.encoding.maxBitrate >= 5000000);
    assert.ok(lk.AudioPresets.musicHighQualityStereo.maxBitrate >= 128000);
  });
});

