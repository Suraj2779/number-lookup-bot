const { Telegraf } = require('telegraf');
const config = require('../config');
const { readJSON, writeJSON, today, isPremium } = require('../utils/helpers');
const { lookupNumber } = require('../utils/api');
const { getCredits, useCredit, addCredit, removeCredit } = require('../utils/credits');
const { redeemCode, createCode, deleteCode } = require('../utils/redeem');

const bot = new Telegraf(config.BOT_TOKEN);

// ---- Helper to get user profile ----
async function getUserProfile(userId) {
  const users = readJSON('users.json');
  const user = users[userId] || { id: userId, username: 'Unknown' };
  const subs = readJSON('subscriptions.json');
  const sub = subs[userId] || null;
  const expiry = sub ? new Date(sub.expiry).toISOString() : 'None';
  const credits = getCredits(userId);
  const premium = isPremium(userId);

  return {
    id: userId,
    username: user.username,
    premium,
    expiry,
    credits
  };
}

// ---- Register user ----
function registerUser(userId, username) {
  const users = readJSON('users.json');
  if (!users[userId]) {
    users[userId] = { id: userId, username: username || 'Unknown', joined: new Date().toISOString() };
    writeJSON('users.json', users);
  }
}

// ---- Main keyboard ----
function mainKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📱 Number Search', callback_data: 'search' }],
      [{ text: '💎 Subscription', callback_data: 'subscription' }],
      [{ text: '🎟 Redeem Code', callback_data: 'redeem' }],
      [{ text: '👤 My Account', callback_data: 'account' }],
      [{ text: '📞 Contact Admin', url: config.ADMIN_LINK }]
    ]
  };
}

// ---- Start command ----
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  registerUser(userId, username);
  await ctx.reply(
    `Welcome to Number Lookup Bot!\nUse the buttons below to get started.`,
    { reply_markup: mainKeyboard() }
  );
});

// ---- Inline button handlers ----
bot.action('search', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Please send a 10-digit mobile number.');
  // We'll handle text messages with number validation in a separate handler
});

bot.action('subscription', async (ctx) => {
  await ctx.answerCbQuery();
  const plans = {
    inline_keyboard: [
      [{ text: '1 Month', callback_data: 'plan_1' }],
      [{ text: '3 Months', callback_data: 'plan_3' }],
      [{ text: '6 Months', callback_data: 'plan_6' }],
      [{ text: 'Lifetime', callback_data: 'plan_lifetime' }],
      [{ text: '🔙 Back', callback_data: 'back' }]
    ]
  };
  await ctx.reply('Choose a subscription plan:', { reply_markup: plans });
});

bot.action(/plan_(.+)/, async (ctx) => {
  const plan = ctx.match[1];
  let days;
  switch (plan) {
    case '1': days = 30; break;
    case '3': days = 90; break;
    case '6': days = 180; break;
    case 'lifetime': days = 36500; break;
    default: return ctx.reply('Invalid plan.');
  }
  const userId = ctx.from.id;
  const subs = readJSON('subscriptions.json');
  const current = subs[userId]?.expiry || Date.now();
  const newExpiry = Math.max(current, Date.now()) + days * 86400000;
  subs[userId] = { expiry: newExpiry };
  writeJSON('subscriptions.json', subs);
  await ctx.answerCbQuery('Subscription activated!');
  await ctx.reply(`✅ Subscription activated!\nExpires: ${new Date(newExpiry).toISOString()}`);
  await ctx.reply('Main menu:', { reply_markup: mainKeyboard() });
});

bot.action('redeem', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Please enter your redeem code (e.g., /redeem RGHAV30D)');
});

bot.action('account', async (ctx) => {
  await ctx.answerCbQuery();
  const profile = await getUserProfile(ctx.from.id);
  const msg = `
👤 *User Profile*
ID: \`${profile.id}\`
Username: @${profile.username}
Premium: ${profile.premium ? '✅' : '❌'}
Expiry: ${profile.expiry}
Credits: ${profile.credits}
  `;
  await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
});

bot.action('back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Main menu:', { reply_markup: mainKeyboard() });
});

// ---- Number lookup via text ----
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  // Ignore commands
  if (text.startsWith('/')) return;

  // Check if it's a 10-digit number
  if (!/^\d{10}$/.test(text)) {
    await ctx.reply('Please enter a valid 10-digit mobile number.');
    return;
  }

  // Check subscription & credits
  if (!isPremium(userId)) {
    const credits = getCredits(userId);
    if (credits <= 0) {
      await ctx.reply('❌ You have no credits left. Upgrade to premium or wait for daily reset.');
      return;
    }
    if (!useCredit(userId)) {
      await ctx.reply('❌ Insufficient credits.');
      return;
    }
  }

  // Call API
  try {
    const result = await lookupNumber(text);
    await ctx.reply(result);
  } catch (error) {
    await ctx.reply('❌ API error. Please try again later.');
    console.error(error);
  }

  // Show remaining credits for free users
  if (!isPremium(userId)) {
    const remaining = getCredits(userId);
    await ctx.reply(`Remaining credits: ${remaining}`);
  }
});

// ---- Commands ----

// /num
bot.command('num', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    await ctx.reply('Usage: /num 9876543210');
    return;
  }
  const number = args[1];
  if (!/^\d{10}$/.test(number)) {
    await ctx.reply('Please enter a valid 10-digit mobile number.');
    return;
  }
  // Reuse the same logic as text handler
  // We'll just simulate by sending the text to the handler? Better to duplicate logic.
  // For brevity, we'll call a helper.
  // Actually we can refactor, but for simplicity:
  const userId = ctx.from.id;
  if (!isPremium(userId)) {
    const credits = getCredits(userId);
    if (credits <= 0) {
      await ctx.reply('❌ You have no credits left. Upgrade to premium or wait for daily reset.');
      return;
    }
    if (!useCredit(userId)) {
      await ctx.reply('❌ Insufficient credits.');
      return;
    }
  }
  try {
    const result = await lookupNumber(number);
    await ctx.reply(result);
    if (!isPremium(userId)) {
      const remaining = getCredits(userId);
      await ctx.reply(`Remaining credits: ${remaining}`);
    }
  } catch (error) {
    await ctx.reply('❌ API error.');
  }
});

// /me
bot.command('me', async (ctx) => {
  const profile = await getUserProfile(ctx.from.id);
  const msg = `
👤 *User Profile*
ID: \`${profile.id}\`
Username: @${profile.username}
Premium: ${profile.premium ? '✅' : '❌'}
Expiry: ${profile.expiry}
Credits: ${profile.credits}
  `;
  await ctx.reply(msg, { parse_mode: 'Markdown' });
});

// /credits
bot.command('credits', async (ctx) => {
  const credits = getCredits(ctx.from.id);
  await ctx.reply(`Available Credits: ${credits}`);
});

// /redeem
bot.command('redeem', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    await ctx.reply('Usage: /redeem <code>');
    return;
  }
  const code = args[1].toUpperCase();
  const result = redeemCode(ctx.from.id, code);
  if (result.success) {
    await ctx.reply(`✅ Redeemed Successfully!\nPlan Activated\nExpires: ${new Date(result.expiry).toISOString()}`);
  } else {
    await ctx.reply(`❌ ${result.reason}`);
  }
});

// ---- Admin Commands ----
function isAdmin(ctx) {
  return ctx.from.id === config.ADMIN_ID;
}

bot.command('addcredit', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /addcredit <user_id> <amount>');
  const userId = Number(args[1]);
  const amount = Number(args[2]);
  addCredit(userId, amount);
  await ctx.reply(`Added ${amount} credits to user ${userId}.`);
});

bot.command('removecredit', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /removecredit <user_id> <amount>');
  const userId = Number(args[1]);
  const amount = Number(args[2]);
  removeCredit(userId, amount);
  await ctx.reply(`Removed ${amount} credits from user ${userId}.`);
});

bot.command('addsub', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /addsub <user_id> <days>');
  const userId = Number(args[1]);
  const days = Number(args[2]);
  const subs = readJSON('subscriptions.json');
  const current = subs[userId]?.expiry || Date.now();
  subs[userId] = { expiry: Math.max(current, Date.now()) + days * 86400000 };
  writeJSON('subscriptions.json', subs);
  await ctx.reply(`Added ${days} days subscription to user ${userId}.`);
});

bot.command('removesub', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /removesub <user_id>');
  const userId = Number(args[1]);
  const subs = readJSON('subscriptions.json');
  delete subs[userId];
  writeJSON('subscriptions.json', subs);
  await ctx.reply(`Removed subscription for user ${userId}.`);
});

bot.command('createcode', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Usage: /createcode <duration_days> <code>');
  const duration = Number(args[1]);
  const code = args[2].toUpperCase();
  const success = createCode(code, duration, ctx.from.id);
  if (success) {
    await ctx.reply(`✅ Code created: ${code} (${duration} days)`);
  } else {
    await ctx.reply('❌ Code already exists.');
  }
});

bot.command('deletecode', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /deletecode <code>');
  const code = args[1].toUpperCase();
  const success = deleteCode(code);
  if (success) {
    await ctx.reply(`✅ Code deleted: ${code}`);
  } else {
    await ctx.reply('❌ Code not found.');
  }
});

bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const users = readJSON('users.json');
  const totalUsers = Object.keys(users).length;
  const subs = readJSON('subscriptions.json');
  const premiumUsers = Object.keys(subs).filter(id => subs[id].expiry > Date.now()).length;
  const codes = readJSON('codes.json');
  const totalCodes = Object.keys(codes).length;
  // Search count not tracked in this demo; can add a counter in credits or separate file.
  // For simplicity:
  const todaySearches = 'N/A'; // implement if needed
  await ctx.reply(`
📊 *Stats*
Total Users: ${totalUsers}
Premium Users: ${premiumUsers}
Redeem Codes: ${totalCodes}
Search Count: N/A
Today's Searches: ${todaySearches}
  `, { parse_mode: 'Markdown' });
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 2) return ctx.reply('Usage: /broadcast <message>');
  const message = args.slice(1).join(' ');
  const users = readJSON('users.json');
  const userIds = Object.keys(users);
  for (const id of userIds) {
    try {
      await bot.telegram.sendMessage(id, message);
    } catch (e) {
      // ignore
    }
  }
  await ctx.reply(`Broadcast sent to ${userIds.length} users.`);
});

// ---- Webhook handler for Vercel ----
module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    res.status(200).send('OK');
  }
};
