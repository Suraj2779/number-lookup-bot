const { readJSON, writeJSON, today, isPremium } = require('./helpers');
const config = require('../config');

function getCredits(userId) {
  const credits = readJSON('credits.json');
  const record = credits[userId] || { balance: config.FREE_DAILY_CREDITS, lastReset: today() };
  
  // Reset if new day
  if (record.lastReset !== today()) {
    record.balance = config.FREE_DAILY_CREDITS;
    record.lastReset = today();
    credits[userId] = record;
    writeJSON('credits.json', credits);
  }
  return record.balance;
}

function useCredit(userId) {
  if (isPremium(userId)) return true; // unlimited
  const credits = readJSON('credits.json');
  let record = credits[userId] || { balance: config.FREE_DAILY_CREDITS, lastReset: today() };
  
  if (record.lastReset !== today()) {
    record.balance = config.FREE_DAILY_CREDITS;
    record.lastReset = today();
  }
  
  if (record.balance <= 0) return false;
  record.balance -= 1;
  credits[userId] = record;
  writeJSON('credits.json', credits);
  return true;
}

function addCredit(userId, amount) {
  const credits = readJSON('credits.json');
  const record = credits[userId] || { balance: 0, lastReset: today() };
  record.balance += amount;
  credits[userId] = record;
  writeJSON('credits.json', credits);
}

function removeCredit(userId, amount) {
  const credits = readJSON('credits.json');
  const record = credits[userId] || { balance: 0, lastReset: today() };
  record.balance = Math.max(0, record.balance - amount);
  credits[userId] = record;
  writeJSON('credits.json', credits);
}

module.exports = { getCredits, useCredit, addCredit, removeCredit };
