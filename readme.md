:blush: :robot: tradingview.com Bot :robot: :blush:
---
An **advanced Bot** for **tracking technical trade pairs signals**.
The bot run every N minutes, check the pair links on `www.tradingview.com` 
Features:
* Auto checking
* Triggering Signals on your Telegram Channel
* Can be deployed on heroku
* Scheduling

# Requirements
* NodeJs
* Linux Probably

# Installation

~~~bash
# install nodejs, tor, google-chrome, build-essential, make, g++
git clone https://github.com/mlibre/tradeSignalBot.git
npm install
# You also may have to run:
# npm rebuild
nano defaults.json
mv sec.json.bak sec.json
# fill the variables
node bot.js
~~~

### Important Global options
```javascript
"headlessS": false,
```

# Run
```bash
node bot.js
```

Donate
=======
Donate or .... :heartpulse:
ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
