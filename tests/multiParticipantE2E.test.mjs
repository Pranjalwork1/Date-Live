import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure integration logic simulation of Moonlit store & duplicate name resolution
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

function checkDisplayNameAvailability(members, requestedName, userId) {
  const cleanName = requestedName.trim().slice(0, 50);
  const otherMembers = members.filter((m) => m.userId !== userId);
  const takenNames = new Set(otherMembers.map((m) => m.displayName.trim().toLowerCase()));

  if (!takenNames.has(cleanName.toLowerCase())) {
    return { available: true, originalName: cleanName };
  }

  const suggestions = generateNumericSuffixOptions(cleanName, takenNames, 3);
  return { available: false, originalName: cleanName, suggestions };
}

function addRoomMember(membersMap, roomId, user) {
  const cleanName = user.displayName.trim().slice(0, 50);
  const existing = membersMap.get(roomId) || [];
  const check = checkDisplayNameAvailability(existing, cleanName, user.userId);

  if (!check.available) {
    return { nameTaken: true, suggestions: check.suggestions };
  }

  const member = {
    id: `mem_${Math.random().toString(36).substring(2, 10)}`,
    roomId,
    userId: user.userId,
    displayName: cleanName,
    role: user.role,
    joinedAt: new Date().toISOString(),
  };

  const filtered = existing.filter((m) => m.userId !== user.userId);
  filtered.push(member);
  membersMap.set(roomId, filtered);

  return { member };
}

describe('Moonlit Multi-Participant, Identity & Joining Integration Test', () => {
  test('End-to-End: 3 participants enter Aarav, resolve duplicates with suffixes, receive unique identities', () => {
    const membersMap = new Map();
    const roomId = 'rm_test_multirooom';

    // 1. Host creates room with name "Aarav"
    const hostId = 'usr_host_aarav_1';
    const hostResult = addRoomMember(membersMap, roomId, {
      userId: hostId,
      displayName: 'Aarav',
      role: 'host',
    });
    assert.ok(hostResult.member);
    assert.equal(hostResult.member.displayName, 'Aarav');
    assert.equal(hostResult.member.userId, hostId);

    // 2. Participant 2 attempts to join as "Aarav" with different userId
    const guest2Id = 'usr_guest_aarav_2';
    const joinResult2 = addRoomMember(membersMap, roomId, {
      userId: guest2Id,
      displayName: 'Aarav',
      role: 'guest',
    });

    // Expect name collision detection and suggestions
    assert.equal(joinResult2.nameTaken, true);
    assert.ok(Array.isArray(joinResult2.suggestions));
    assert.equal(joinResult2.suggestions.length, 3);
    for (const sug of joinResult2.suggestions) {
      assert.match(sug, /^Aarav-\d{4}$/);
      assert.notEqual(sug.toLowerCase(), 'aarav');
    }

    // Participant 2 picks the first suggested option
    const chosenName2 = joinResult2.suggestions[0];
    const confirmedJoin2 = addRoomMember(membersMap, roomId, {
      userId: guest2Id,
      displayName: chosenName2,
      role: 'guest',
    });
    assert.equal(confirmedJoin2.nameTaken, undefined);
    assert.ok(confirmedJoin2.member);
    assert.equal(confirmedJoin2.member.displayName, chosenName2);
    assert.equal(confirmedJoin2.member.userId, guest2Id);

    // 3. Participant 3 attempts to join as "Aarav" with yet another userId
    const guest3Id = 'usr_guest_aarav_3';
    const joinResult3 = addRoomMember(membersMap, roomId, {
      userId: guest3Id,
      displayName: 'Aarav',
      role: 'guest',
    });

    assert.equal(joinResult3.nameTaken, true);
    assert.ok(Array.isArray(joinResult3.suggestions));
    // Suggestions must not include chosenName2 or "Aarav"
    for (const sug of joinResult3.suggestions) {
      assert.notEqual(sug, chosenName2);
      assert.notEqual(sug.toLowerCase(), 'aarav');
      assert.match(sug, /^Aarav-\d{4}$/);
    }

    // Participant 3 chooses their variant
    const chosenName3 = joinResult3.suggestions[0];
    const confirmedJoin3 = addRoomMember(membersMap, roomId, {
      userId: guest3Id,
      displayName: chosenName3,
      role: 'guest',
    });
    assert.ok(confirmedJoin3.member);
    assert.equal(confirmedJoin3.member.displayName, chosenName3);
    assert.equal(confirmedJoin3.member.userId, guest3Id);

    // 4. Verify all 3 participants are in the room with distinct names and distinct identities
    const members = membersMap.get(roomId);
    assert.equal(members.length, 3);

    const names = members.map((m) => m.displayName);
    const ids = members.map((m) => m.userId);

    assert.equal(new Set(names).size, 3, 'All 3 display names must be unique');
    assert.equal(new Set(ids).size, 3, 'All 3 user identities must be unique');

    // 5. Participant 3 reconnects / refreshes with same userId -> does NOT duplicate member
    const reconnectResult = addRoomMember(membersMap, roomId, {
      userId: guest3Id,
      displayName: chosenName3,
      role: 'guest',
    });
    assert.ok(reconnectResult.member);
    const afterReconnect = membersMap.get(roomId);
    assert.equal(afterReconnect.length, 3, 'Reconnecting must not create duplicate member records');
  });
});
