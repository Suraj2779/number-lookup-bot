require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_ID: Number(process.env.ADMIN_ID),
  ADMIN_LINK: process.env.ADMIN_LINK || 'https://t.me/yourusername',
  API_URL: process.env.API_URL || 'https://example.com/api',
  FREE_DAILY_CREDITS: 5,
  DB_PATH: process.env.VERCEL ? '/tmp/database' : './database',
};
