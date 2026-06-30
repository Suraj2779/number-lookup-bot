# 📱 Indian Number Lookup Bot

A powerful Telegram bot built with **Node.js** and **Vercel** that allows users to search 10-digit mobile numbers using an external API.

Supports subscriptions, redeem codes, credits, admin tools, and webhook deployment.

---

## ✨ Features

- 🔍 10 Digit Number Search
- 🚫 Invalid Number Detection
- 📡 API Integration
- 🧹 Automatic Response Filtering
- 💎 Premium Subscription System
- 🎟 Redeem Code System
- 💳 Credit Management
- 👤 User Profile System
- 🛠 Admin Commands
- 📞 Contact Admin Button
- ⚡ Vercel Compatible
- 📂 JSON Database Support
- 🌐 Webhook Based Bot

---

# 📂 Project Structure

```bash
project/

├── api/
│   └── bot.js
├── database/
│   ├── users.json
│   ├── subscriptions.json
│   ├── codes.json
│   └── credits.json
├── utils/
│   ├── api.js
│   ├── credits.js
│   ├── redeem.js
│   └── subscription.js
├── config.js
├── package.json
└── README.md
```

---

# 🚀 Commands

### Start Bot

```bash
/start
```

Displays the main menu.

### Search Number

```bash
/num 9876543210
```

Returns formatted information from API.

### Redeem Subscription

```bash
/redeem CODE
```

Example

```bash
/redeem RAGHAV30D
```

### User Information

```bash
/me
```

Shows:

- User ID
- Username
- Subscription Status
- Expiry Date
- Credits

### Credits

```bash
/credits
```

Displays remaining credits.

---

# 💎 Subscription Plans

| Plan | Duration |
|-------|----------|
| Basic | 30 Days |
| Pro | 90 Days |
| Premium | 180 Days |
| Lifetime | Unlimited |

---

# 🎟 Redeem Codes

Admin can create redeem codes.

Example:

```text
RAGHAV30D
```

Validity:

```text
30 Days
```

Usage:

```bash
/redeem RAGHAV30D
```

---

# 📡 API Integration

Bot fetches data from external API.

Example:

```text
https://api.example.com/?number=9876543210
```

Unwanted fields are automatically removed.

Filtered keys: when if u use someone api

```json
{
 "number_info": null,
 "developer": "J€¥",
 "telegram": "@Example"
}
```

These fields are never shown to users.

---

# 📤 Response Format

Example:

```text
📱 Number : 9876543210

👤 Name : Rahul Kumar

📍 State : Bihar

🏙 City : Bhagalpur

📡 Operator : Jio

━━━━━━━━━━━━━━
Dev by Raghav~ 👈
```

---

# 👤 User System

Features:

✔ Subscription Status

✔ Credit Tracking

✔ Redeem History

✔ Usage Statistics

✔ Expiry Management

---

# 🛠 Admin Commands

```bash
/createcode

/deletecode

/addsub

/removesub

/addcredit

/removecredit

/stats

/broadcast
```

---

## Statistics

```bash
/stats
```

Shows:

```text
Total Users

Premium Users

Redeem Codes

Today's Searches

Total Searches
```

---

# 📞 Contact Admin

Inline button:

```text
📞 Contact Admin
```

Redirects to:

```text
https://t.me/yourusername
```

---

# ⚙ Configuration

config.js

```javascript
BOT_TOKEN=""

ADMIN_ID=""

ADMIN_LINK=""

API_URL=""
```

---

# 📦 Installation

Clone repository

```bash
git clone https://github.com/username/repository.git
```

Install packages

```bash
npm install
```

Run locally

```bash
npm run dev
```

---

# 🌐 Deploy on Vercel

Import repository to Vercel.

Add Environment Variables:

```env
BOT_TOKEN=

ADMIN_ID=

ADMIN_LINK=

API_URL=
```

Deploy project.

Set webhook:

```bash
https://api.telegram.org/botTOKEN/setWebhook?url=https://your-project.vercel.app/api/bot
```

Check webhook:

```bash
https://api.telegram.org/botTOKEN/getWebhookInfo
```

---

# 🔐 Requirements

- Node.js 18+
- Telegram Bot Token
- Vercel Account
- GitHub Repository
- External API Endpoint

---

# ❤️ Credits

Developed by

**Raghav**

```text
Dev by Raghav~ 👈
```
