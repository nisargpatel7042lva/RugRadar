# RugRadar

```
 ██████╗ ██╗   ██╗ ██████╗ ██████╗  █████╗ ██████╗  █████╗ ██████╗
 ██╔══██╗██║   ██║██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗
 ██████╔╝██║   ██║██║  ███╗██████╔╝███████║██║  ██║███████║██████╔╝
 ██╔══██╗██║   ██║██║   ██║██╔══██╗██╔══██║██║  ██║██╔══██║██╔══██╗
 ██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

**Catch rugs before they happen.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![Birdeye](https://img.shields.io/badge/Powered_by-Birdeye_Data-6366f1?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)

![Dashboard](./screenshot.png)

---

## What it does

RugRadar monitors every newly launched Solana token in real-time, runs each through a 6-signal risk pipeline, and computes a **RugScore™** (0–100). Tokens scoring 80+ trigger instant Telegram alerts. The Hall of Shame page tracks rugs that were called before they happened.

---

## RugScore™ Formula

| Signal | Points | Condition |
|---|---|---|
| Mint authority not revoked | +30 | `mintAuthority !== null` |
| Top 10 holders own >60% supply | +20 | `top10HolderPercent > 0.6` |
| Freeze authority enabled | +15 | `freezeAuthority !== null` |
| Liquidity below $10,000 | +15 | `liquidity < 10000` |
| Token age under 2 hours | +10 | `createdAt > now - 2h` |
| Zero 24h volume | +10 | `volume24h === 0` |

| Score | Risk Level | Color |
|---|---|---|
| 0–30 | SAFE | `#22c55e` |
| 31–60 | CAUTION | `#f59e0b` |
| 61–100 | HIGH RISK | `#ef4444` |

---

## Birdeye Endpoints Used

| Endpoint | Purpose | Calls per scan |
|---|---|---|
| `GET /defi/v3/token/new_listing` | Discover new token listings | 1 |
| `GET /defi/token_security` | Mint/freeze authority + holder concentration | 1 per token (~20) |
| `GET /defi/token_overview` | Liquidity, volume, price, market cap, age | 1 per token (~20) |
| `GET /defi/token_trending` | Trending tokens list | 1 |
| `GET /defi/price_volume/single` | Real-time price + volume data | on demand |
| `GET /defi/txs/token` | Recent transactions for wash-trade detection | on demand |

**Total: 41+ API calls per `/new-listings` request** (qualifies for Birdeye BIP 50+ call requirement)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express + Axios |
| Alerts | Telegram Bot API |
| Icons | Lucide React |
| Font | JetBrains Mono |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Birdeye API key ([get one here](https://birdeye.so))
- Telegram Bot token (optional, for alerts)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/rugradar.git
cd rugradar

# Install all workspaces (root + backend + frontend)
npm install
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
BIRDEYE_API_KEY=your_birdeye_key_here
PORT=4000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 3. Run both services

```bash
# Runs backend (port 4000) + frontend (port 5173) together
npm run dev
```

Or run separately:

```bash
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:5173
```

### 4. Verify

Open `http://localhost:5173` — you should see the Live Feed populating with tokens and RugScores.

Check `http://localhost:4000/api/new-listings` — you should see a JSON array of enriched tokens sorted by RugScore.

---

## Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_BASE=/api`
5. After deploying backend to Railway, update `frontend/vercel.json`:
   ```json
   {
     "rewrites": [{
       "source": "/api/(.*)",
       "destination": "https://YOUR_RAILWAY_URL/api/$1"
     }]
   }
   ```
6. Redeploy

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set **Root Directory** to `backend`
3. Add environment variables:
   ```
   BIRDEYE_API_KEY=...
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_CHAT_ID=...
   PORT=4000
   ```
4. Railway auto-detects `railway.toml` and runs `npm start`
5. Copy the Railway public URL → paste into `frontend/vercel.json`

---

## Telegram Alerts Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
2. Copy the bot token → `TELEGRAM_BOT_TOKEN`
3. Start a chat with your bot, then get your chat ID:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
4. Copy `chat.id` from the response → `TELEGRAM_CHAT_ID`
5. Alerts fire automatically when any token scores **80+**

---

## Built for

> **Birdeye Data BIP Competition — Sprint 4 (May 2026)**

RugRadar uses the Birdeye Data API to protect Solana traders from rug pulls through real-time on-chain analysis.

---

*Powered by [Birdeye Data API](https://birdeye.so)*
