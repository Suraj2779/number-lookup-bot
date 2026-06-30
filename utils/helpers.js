const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure DB directory exists
function ensureDB() {
  const dir = config.DB_PATH;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Read JSON file
function readJSON(file) {
  ensureDB();
  const filePath = path.join(config.DB_PATH, file);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Write JSON file
function writeJSON(file, data) {
  ensureDB();
  const filePath = path.join(config.DB_PATH, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get current date string for daily reset
function today() {
  return new Date().toISOString().split('T')[0];
}

// Check if user is premium
function isPremium(userId) {
  const subs = readJSON('subscriptions.json');
  const record = subs[userId];
  return record && record.expiry > Date.now();
}

module.exports = { readJSON, writeJSON, today, isPremium };
