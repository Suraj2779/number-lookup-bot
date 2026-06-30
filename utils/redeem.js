const { readJSON, writeJSON } = require('./helpers');

function validateCode(code) {
  const codes = readJSON('codes.json');
  const entry = codes[code];
  if (!entry) return { valid: false, reason: 'Invalid code.' };
  if (entry.used) return { valid: false, reason: 'Code already used.' };
  return { valid: true, entry };
}

function redeemCode(userId, code) {
  const { valid, entry, reason } = validateCode(code);
  if (!valid) return { success: false, reason };

  // Mark code as used
  const codes = readJSON('codes.json');
  codes[code].used = true;
  writeJSON('codes.json', codes);

  // Add subscription days
  const subs = readJSON('subscriptions.json');
  const current = subs[userId]?.expiry || Date.now();
  const newExpiry = Math.max(current, Date.now()) + entry.duration * 86400000;
  subs[userId] = { expiry: newExpiry };
  writeJSON('subscriptions.json', subs);

  return { success: true, expiry: newExpiry };
}

function createCode(code, duration, creatorId) {
  const codes = readJSON('codes.json');
  if (codes[code]) return false;
  codes[code] = {
    duration,
    used: false,
    createdBy: creatorId,
    createdAt: new Date().toISOString()
  };
  writeJSON('codes.json', codes);
  return true;
}

function deleteCode(code) {
  const codes = readJSON('codes.json');
  if (!codes[code]) return false;
  delete codes[code];
  writeJSON('codes.json', codes);
  return true;
}

module.exports = { validateCode, redeemCode, createCode, deleteCode };
