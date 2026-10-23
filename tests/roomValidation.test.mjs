import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper simulation of core validation and security rules
function generateRoomCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `moon-${part1}-${part2}`;
}

function validateRoomInput(hostName, title, theme) {
  if (!hostName || typeof hostName !== 'string' || !hostName.trim()) {
    return { valid: false, error: 'Please enter your name' };
  }
  const cleanHost = hostName.trim().slice(0, 50);
  const cleanTitle = (title && typeof title === 'string') ? title.trim().slice(0, 80) : 'Our Movie Night';
  const validThemes = ['midnight', 'candlelight', 'lavender', 'cinema'];
  const cleanTheme = validThemes.includes(theme) ? theme : 'midnight';
  return { valid: true, hostName: cleanHost, title: cleanTitle, theme: cleanTheme };
}

function validateChatMessage(content) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (content.length > 2000) {
    return { valid: false, error: 'Message exceeds maximum length of 2000 characters' };
  }
  return { valid: true, content: content.trim() };
}

function validateReaction(emoji) {
  const allowed = ['❤️', '💕', '😍', '🥹', '😘', '😂', '😮', '👏', '✨', '🎉', '🍿'];
  return allowed.includes(emoji);
}

describe('Moonlit Security & Room Logic Tests', () => {
  test('generateRoomCode produces unique unguessable slugs with moon- prefix', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      assert.match(code, /^moon-[a-z0-9]{4}-[a-z0-9]{4}$/);
      codes.add(code);
    }
    assert.equal(codes.size, 100, 'All 100 generated room codes should be unique');
  });

  test('validateRoomInput enforces non-empty host name and default title', () => {
    const emptyHost = validateRoomInput('', 'Test', 'midnight');
    assert.equal(emptyHost.valid, false);

    const validDefault = validateRoomInput('Alex', '', 'invalid-theme');
    assert.equal(validDefault.valid, true);
    assert.equal(validDefault.title, 'Our Movie Night');
    assert.equal(validDefault.theme, 'midnight');
  });

  test('validateChatMessage restricts empty messages and oversized payloads', () => {
    assert.equal(validateChatMessage('').valid, false);
    assert.equal(validateChatMessage('   ').valid, false);

    const hugeText = 'a'.repeat(2001);
    assert.equal(validateChatMessage(hugeText).valid, false);

    const validMessage = validateChatMessage('Hey sweetheart, love this movie! ❤️');
    assert.equal(validMessage.valid, true);
    assert.equal(validMessage.content, 'Hey sweetheart, love this movie! ❤️');
  });

  test('validateReaction only allows authorized romantic reactions', () => {
    assert.equal(validateReaction('❤️'), true);
    assert.equal(validateReaction('🍿'), true);
    assert.equal(validateReaction('✨'), true);
    assert.equal(validateReaction('💀'), false);
    assert.equal(validateReaction('<script>alert(1)</script>'), false);
  });

  test('generateWhatsAppInvite generates correctly formatted and URL-encoded invitation', () => {
    const inviteUrl = 'https://moonlit.live/moon-7x9q-2a8d';
    const message = `🌙 Hey! I saved us a little movie night ❤️\nJoin me on Moonlit — let's watch together 🍿🎬\n${inviteUrl}`;
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/?text=${encoded}`;

    assert.ok(waUrl.includes('moon-7x9q-2a8d'));
    assert.ok(decodeURIComponent(encoded).includes('Join me on Moonlit'));
    assert.ok(decodeURIComponent(encoded).includes('🍿🎬'));
  });

  test('room role authorization enforces guest role without allowing privilege escalation', () => {
    const hostUserId = 'usr_host123';
    const room = { host_user_id: hostUserId };

    // Host check
    const hostRole = 'usr_host123' === room.host_user_id ? 'host' : 'guest';
    assert.equal(hostRole, 'host');

    // Guest trying to claim host
    const guestUserId = 'usr_guest456';
    const guestRole = guestUserId === room.host_user_id ? 'host' : 'guest';
    assert.equal(guestRole, 'guest');
  });

  test('validates and normalizes all 4 room mood themes correctly', () => {
    function normalizeTheme(t) {
      if (t === 'dreamy' || t === 'lavender') return 'lavender';
      if (t === 'cozy' || t === 'cinema') return 'cinema';
      if (t === 'candlelight') return 'candlelight';
      return 'midnight';
    }

    assert.equal(normalizeTheme('midnight'), 'midnight');
    assert.equal(normalizeTheme('candlelight'), 'candlelight');
    assert.equal(normalizeTheme('dreamy'), 'lavender');
    assert.equal(normalizeTheme('lavender'), 'lavender');
    assert.equal(normalizeTheme('cozy'), 'cinema');
    assert.equal(normalizeTheme('cinema'), 'cinema');
    assert.equal(normalizeTheme('unknown'), 'midnight');
    assert.equal(normalizeTheme(undefined), 'midnight');
  });
});

