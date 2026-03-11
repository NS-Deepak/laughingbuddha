 README for **laughingbuddha** project. I have added the GitHub Actions workflow configuration and instructions on how to trigger it manually or on a schedule.

---
#Laughing Buddha is now crafting and adding new features, so new setup code will be added later


#  laughingbuddha

**A lightweight Python bot for real-time market updates.**

`laughingbuddha` is a custom-built automation tool designed to fetch the latest prices for stocks, cryptocurrencies, and commodities, delivering updates directly to your preferred notification channels (Telegram and WhatsApp).

## 🚀 Setup Instructions

### 1. Prerequisites

* **Python 3.10+**
* **API Keys:** You will need access to:
* **Financial Data:** Yahoo Finance / Alpha Vantage.
* **Telegram:** Bot Token from [@BotFather](https://t.me/botfather).
* **Telegram:** Chat ID from [@userinfobot](https://t.me/userinfobot).

### 2. Installation

```bash
git clone https://github.com/NS-Deepak/laughingbuddha.git
cd laughingbuddha
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
WHATSAPP_API_KEY=your_key_here
FINANCE_API_KEY=your_key_here

```

---

## 📈 Tracked Assets

This bot is currently configured to monitor the following high-priority assets:

### 🏢 Favorite Companies (Stocks)

* **Swiggy (SWIGGY.NS)**
* **Reliance Industries (RELIANCE.NS)**
* **Tata Consultancy Services (TCS.NS)**
* **HDFC Bank (HDFCBANK.NS)**

### 🪙 Crypto

* **Bitcoin (BTC)**, **Ethereum (ETH)**, **Solana (SOL)**

### 🛠️ Commodities

* **Gold**, **Silver**

---

## 🤖 Running Workflows (GitHub Actions)

You can automate this bot for scheduled time using GitHub Actions file at `.github/workflows/main.yml`:

```yaml
name: Market Update Bot
on:
  schedule:
    - cron: '0 4 * * 1-5' # Runs at 9:30 AM IST (04:00 UTC) Mon-Fri
  workflow_dispatch:      # Allows manual trigger

jobs:
  run-bot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Bot
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: python main.py

```

### How to Trigger Manually:

1. Go to your GitHub repository.
2. Click on the **Actions** tab.
3. Select **Market Bot** from the left sidebar.
4. Click the **Run workflow** dropdown and press the green button.

### How to Setup Secrets:

To keep your keys safe, go to **Settings > Secrets and variables > Actions** and add your `.env` variables as "Repository secrets."

---

*Built by [Deepak G*](https://me-deepakg.vercel.app/)

[Manually Trigger GitHub Actions Workflows](https://www.youtube.com/watch?v=nQRgTUwGBBA)

This video explains how to use the `workflow_dispatch` event to manually run your GitHub Actions directly from the repository UI.

---

## Windows Prisma Build Stability

If you hit recurring `EPERM ... query_engine-windows...` errors on Windows:

1. Local safe build (no Prisma generate in normal local build):
```bash
npm run build
```

2. Deploy/CI build (always regenerate Prisma client):
```bash
npm run build:deploy
```

3. Use the safe generator wrapper manually when needed:
```bash
npm run prisma:generate:safe
```

4. Apply DB schema changes separately from build:
```bash
npx prisma migrate status
npx prisma migrate deploy
```

5. If Windows still throws Prisma `EPERM`, stop dev/watch processes before running Prisma commands.

6. Add Windows Defender exclusion for this repo and `node_modules/.prisma` to reduce file lock contention.

7. Vercel is configured to run `npm run build:deploy` via `vercel.json`.
