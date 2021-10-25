:blush: :robot: Tradingview.com Alert Bot :robot: :blush:
---
**Advanced Bot** for **tracking technical trade pairs signals**.
The bot runs every `N` minutes and checks the pair from `www.tradingview.com` 

## Features
* Auto checking
* Triggering Signals on a Telegram Channel
* Can be deployed on Heroku
* Scheduling

# Requirements
* NodeJs
* Telegram

# Telegram Bot
1. Call `@BotFather`
2. `/newbot`
3. `BTC_ETH_TRADE_BOT`
4. `BTC_ETH_TRADE_BOT`
5. Copy the **Access Token**

# Telegram Channel ID
1. Create a channel
2. Add the bot as an admin. `@BTC_ETH_TRADE_BOT`
3. Open the channel via browser
4. https://web.telegram.org/z/#-1719438250
5. In this case `-1001719438250` is the channel ID we will use.

# Installation
```bash
# install nodejs, build-essential, make, g++
git clone https://github.com/mlibre/tradeSignalBot.git
npm install
# You also may need to run:
# npm rebuild
# nano defaults.json
mv sec.json.bak sec.json
# Copy the Access Token And ChannelID
```

# Run
```bash
node bot.js
```

* Now send `/start` message to the bot

# Donate or .... :heartpulse:
=======
ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
