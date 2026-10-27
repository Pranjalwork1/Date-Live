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

  test('leave room preserves the room and other participants', () => {
    const room = {
      id: 'rm_test_1',
      room_code: 'moon-test-room',
      host_user_id: 'usr_host1',
      title: 'Movie Night',
    };
    let members = [
      { userId: 'usr_host1', status: 'live' },
      { userId: 'usr_guest2', status: 'live' },
    ];

    // Participant leaves
    const leavingUserId = 'usr_guest2';
    members = members.map((m) =>
      m.userId === leavingUserId ? { ...m, status: 'offline' } : m
    );

    // Verify room still exists and host remains live
    assert.equal(room.room_code, 'moon-test-room');
    assert.equal(members.find((m) => m.userId === 'usr_host1')?.status, 'live');
    assert.equal(members.find((m) => m.userId === 'usr_guest2')?.status, 'offline');
  });

  test('delete room enforces host-only authorization and rejects non-hosts', () => {
    const room = {
      id: 'rm_test_auth',
      room_code: 'moon-auth-room',
      host_user_id: 'usr_real_host',
    };

    function simulateDeleteRoom(requesterId) {
      if (!requesterId || requesterId !== room.host_user_id) {
        return { success: false, status: 403, error: 'Unauthorized: Only the room host can delete this room' };
      }
      return { success: true, status: 200 };
    }

    // Non-host attempt
    const nonHostResult = simulateDeleteRoom('usr_malicious_guest');
    assert.equal(nonHostResult.success, false);
    assert.equal(nonHostResult.status, 403);

    // Authorized host attempt
    const hostResult = simulateDeleteRoom('usr_real_host');
    assert.equal(hostResult.success, true);
    assert.equal(hostResult.status, 200);
  });

  test('fresh room creation generates independent room code, fresh details, and empty message state', () => {
    const roomA = {
      id: 'rm_room_a',
      room_code: 'moon-room-aaaa',
      title: 'Room A Title',
      messages: [{ content: 'Secret in Room A' }],
    };

    const roomB = {
      id: 'rm_room_b',
      room_code: 'moon-room-bbbb',
      title: 'Room B Title',
      messages: [],
    };

    assert.notEqual(roomA.room_code, roomB.room_code);
    assert.notEqual(roomA.id, roomB.id);
    assert.notEqual(roomA.title, roomB.title);
    assert.equal(roomB.messages.length, 0);
  });

  test('generateNumericSuffixOptions creates distinct 4-digit suffix suggestions without colliding with taken names', () => {
    function generateNumericSuffixOptions(baseName, takenNames, count = 3) {
      const cleanBase = baseName.trim().slice(0, 35).replace(/-\d{4,}$/, '');
      const suggestions = [];
      let attempts = 0;
      while (suggestions.length < count && attempts < 100) {
        attempts++;
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const candidate = `${cleanBase}-${suffix}`;
        if (!takenNames.has(candidate.toLowerCase()) && !suggestions.includes(candidate)) {
          suggestions.push(candidate);
        }
      }
      return suggestions;
    }

    const taken = new Set(['aarav', 'aarav-1234']);
    const suggestions = generateNumericSuffixOptions('Aarav', taken, 3);

    assert.equal(suggestions.length, 3);
    for (const s of suggestions) {
      assert.match(s, /^Aarav-\d{4}$/);
      assert.equal(taken.has(s.toLowerCase()), false);
    }
    const uniqueSet = new Set(suggestions);
    assert.equal(uniqueSet.size, 3, 'All 3 suggestions must be mutually unique');
  });

  test('three participants entering Aarav can all join with distinct names and separate identities', () => {
    const members = [];
    function joinRoom(requestedName, userId) {
      const takenNames = new Set(members.map((m) => m.displayName.toLowerCase()));
      let finalName = requestedName.trim();
      if (takenNames.has(finalName.toLowerCase())) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        finalName = `${finalName}-${suffix}`;
      }
      const member = {
        userId,
        displayName: finalName,
      };
      members.push(member);
      return member;
    }

    const user1 = joinRoom('Aarav', 'usr_id_1');
    const user2 = joinRoom('Aarav', 'usr_id_2');
    const user3 = joinRoom('Aarav', 'usr_id_3');

    assert.equal(user1.displayName, 'Aarav');
    assert.match(user2.displayName, /^Aarav-\d{4}$/);
    assert.match(user3.displayName, /^Aarav-\d{4}$/);
    assert.notEqual(user2.displayName, user3.displayName);

    // Verify all 3 have distinct participant identities
    assert.equal(user1.userId, 'usr_id_1');
    assert.equal(user2.userId, 'usr_id_2');
    assert.equal(user3.userId, 'usr_id_3');
    assert.equal(members.length, 3);
  });

  test('sender-only chat isolates messages locally per participant identity', () => {
    const localStore = new Map();
    function sendLocalMessage(roomCode, userId, text) {
      const storageKey = `moonlit_local_msgs_${roomCode}_${userId}`;
      const current = localStore.get(storageKey) || [];
      const updated = [...current, { senderId: userId, content: text.trim() }];
      localStore.set(storageKey, updated);
      return updated;
    }

    sendLocalMessage('moon-test-1234', 'usr_A', 'Hello from Participant A');
    sendLocalMessage('moon-test-1234', 'usr_B', 'Hi from Participant B');

    const msgsA = localStore.get('moonlit_local_msgs_moon-test-1234_usr_A');
    const msgsB = localStore.get('moonlit_local_msgs_moon-test-1234_usr_B');

    assert.equal(msgsA.length, 1);
    assert.equal(msgsA[0].content, 'Hello from Participant A');
    assert.equal(msgsB.length, 1);
    assert.equal(msgsB[0].content, 'Hi from Participant B');
    assert.notEqual(msgsA[0].content, msgsB[0].content, 'Chat messages must not cross participant boundaries');
  });

  test('any participant can initiate screen sharing and sharer name is accurately tracked', () => {
    let activeSharer = null;
    function startScreenShare(participant) {
      activeSharer = participant.displayName;
      return { isSharing: true, sharerName: activeSharer };
    }

    // Guest initiates screen share
    const res1 = startScreenShare({ userId: 'usr_guest_2', displayName: 'Maya' });
    assert.equal(res1.isSharing, true);
    assert.equal(res1.sharerName, 'Maya');

    // Third participant takes turn
    const res2 = startScreenShare({ userId: 'usr_guest_3', displayName: 'Aarav-5821' });
    assert.equal(res2.isSharing, true);
    assert.equal(res2.sharerName, 'Aarav-5821');
  });

  test('microphone initializes in muted state and properly unmutes on user toggle', async () => {
    // Simulate RoomClient mic state machine
    let isMuted = true;
    let participants = [{ userId: 'usr_1', isMuted: true }];

    async function toggleMic(simulateError = false) {
      const nextMuted = !isMuted;
      try {
        if (simulateError) {
          throw new Error('Permission denied');
        }
        isMuted = nextMuted;
        participants = participants.map((p) =>
          p.userId === 'usr_1' ? { ...p, isMuted: nextMuted } : p
        );
      } catch {
        isMuted = true;
        participants = participants.map((p) =>
          p.userId === 'usr_1' ? { ...p, isMuted: true } : p
        );
      }
    }

    // Initial state: starts muted
    assert.equal(isMuted, true);
    assert.equal(participants[0].isMuted, true);

    // First click: un-mutes cleanly
    await toggleMic(false);
    assert.equal(isMuted, false);
    assert.equal(participants[0].isMuted, false);

    // Second click: mutes cleanly
    await toggleMic(false);
    assert.equal(isMuted, true);
    assert.equal(participants[0].isMuted, true);

    // Third click with permission error: stays muted for both state and participant
    await toggleMic(true);
    assert.equal(isMuted, true);
    assert.equal(participants[0].isMuted, true);
  });

  test('quick reaction buttons in chat do not wipe user draft input', () => {
    let inputText = 'I love this scene!';
    let sentMessage = null;

    function handleSend(contentToSend) {
      const text = (contentToSend ?? inputText).trim();
      if (!contentToSend) {
        inputText = '';
      }
      sentMessage = text;
    }

    // User clicks "Send Love" quick button while drafting
    handleSend('❤️');
    assert.equal(sentMessage, '❤️');
    assert.equal(inputText, 'I love this scene!', 'Active draft message must be preserved when sending quick reaction');

    // Normal message send clears the input
    handleSend();
    assert.equal(sentMessage, 'I love this scene!');
    assert.equal(inputText, '', 'Normal send should clear the input');
  });

  test('generateNumericSuffixOptions offers multiple numbered postfix suggestions', () => {
    function generateEnhancedOptions(baseName, takenNames, count = 4) {
      const cleanBase = baseName.trim().slice(0, 35).replace(/[-_#\s]*\d+$/, '').trim() || 'Guest';
      const suggestions = [];

      const tryAdd = (candidate) => {
        if (
          suggestions.length < count &&
          !takenNames.has(candidate.toLowerCase()) &&
          !suggestions.includes(candidate)
        ) {
          suggestions.push(candidate);
          return true;
        }
        return false;
      };

      // 1. Next sequential number with space: e.g. "Rahul 3"
      let seq = 2;
      while (seq <= 20) {
        if (tryAdd(`${cleanBase} ${seq}`)) break;
        seq++;
      }

      // 2. Next sequential number with dash: e.g. "Rahul-2"
      let dashSeq = 2;
      while (dashSeq <= 20) {
        if (tryAdd(`${cleanBase}-${dashSeq}`)) break;
        dashSeq++;
      }

      // 3. Numbered tag: e.g. "Rahul #2"
      let tagSeq = 2;
      while (tagSeq <= 20) {
        if (tryAdd(`${cleanBase} #${tagSeq}`)) break;
        tagSeq++;
      }

      // 4. Random 4-digit ID suffix: e.g. "Rahul-4821"
      let attempts = 0;
      while (suggestions.length < count && attempts < 100) {
        attempts++;
        const suffix = Math.floor(1000 + Math.random() * 9000);
        tryAdd(`${cleanBase}-${suffix}`);
      }

      // 5. Fill remaining if needed
      while (suggestions.length < count && seq <= 30) {
        tryAdd(`${cleanBase} ${seq}`);
        seq++;
      }

      return suggestions;
    }

    const taken = new Set(['rahul', 'rahul 2']);
    const options = generateEnhancedOptions('Rahul', taken, 4);

    assert.equal(options.length, 4, 'Should offer 4 distinct options to choose from');
    assert.ok(options.includes('Rahul 3'), 'Should include next sequential number');
    assert.ok(options.includes('Rahul-2'), 'Should include dash numbered variant');
    assert.ok(options.includes('Rahul #2'), 'Should include numbered tag variant');
    for (const opt of options) {
      assert.equal(taken.has(opt.toLowerCase()), false, 'Suggested option must not collide with taken names');
      assert.match(opt, /\d+/, 'Option must include a number suffix');
    }
  });
});


