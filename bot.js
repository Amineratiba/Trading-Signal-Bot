"use strict";
const https = require("https");
var express = require("express");
const puppeteer = require("puppeteer");
var { CronJob } = require("cron");
const common = require("./common");
const defaults = require("./defaults.json");
const delay = require("delay");
const date = require("date-and-time");
const { Telegraf } = require("telegraf");
const sec = require("./sec.json");

const bot = new Telegraf(sec.telegramBotToken);

let isRunning = false;
const {userAgent} = defaults;
const port = process.env.PORT || defaults.expressPort;

bot.start(function (ctx)
{
	try 
	{
		run(ctx);
	}
	catch (error) 
	{
		console.error(error);
	}
	ctx.reply("Bot is starting");
});
bot.help(function (res)
{
	res.reply("No Help :)");
});
bot.on("sticker", function (res)
{
	res.reply("Nice Sticker");
});
bot.hears("hi", function (res)
{
	res.reply("Hey");
});
bot.launch();

if(defaults.useExpress)
{
	expressServer();
}
process.once("SIGINT", () => {return bot.stop("SIGINT");});
process.once("SIGTERM", () => {return bot.stop("SIGTERM");});

console.log("\n", date.format(new Date(), "YYYY/MM/DD HH:mm:ss"), "\n");

async function run (ctx)
{
	if (isRunning == false)
	{
		isRunning = true;
		console.log("Initializing");
	}
	else
	{
		console.log("Bot is already running.");
		return;
	}
	const args =
		[
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-infobars",
			"--window-position=0,0",
			"--ignore-certifcate-errors",
			"--ignore-certifcate-errors-spki-list",
			`--user-agent=${ userAgent }`,
			"--noerrordialogs",
			"--disable-web-security",
			"--allow-file-access-from-file",
			"--start-maximized"
		];
	const options =
	{
		args,
		// executablePath: "/usr/bin/google-chrome-stable",
		headless: defaults.headlessS,
		ignoreHTTPSErrors: true,
		userDataDir: "./chromData/",
		defaultViewport: null,
		appMode: true
	};
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();
	await page.evaluateOnNewDocument(preload);
	await page.setDefaultNavigationTimeout(50000);
	await common.setWindowSize(page, defaults.viewport.width , defaults.viewport.height);
	await page.setViewport(defaults.viewport);
	await common.closingOtherTabs(browser, page);
	await crypto(page, sec.pairURL, sec.telegramChannelID);
	// await page.screenshot({path: 'screenshot.png'});
	console.log("closing browser ... ");
	await common.closingBrowser(browser, page);
	isRunning = false;
	return;
}

async function crypto (page, coinPairLink, chat_id)
{
	await delay(4000);
	const possiblities = ["strong sell", "sell", "neutral", "buy", "strong buy"];
	await common.goingToPage(page, coinPairLink);
	await delay(4000);
	const changeSelVal = "div > div > div > div.tv-symbol-price-quote__row.js-last-price-block-value-row > div.js-symbol-change-direction.tv-symbol-price-quote__change.tv-symbol-price-quote__change--growing > span.js-symbol-change.tv-symbol-price-quote__change-value";
	const changeSelPer = "div > div > div > div.tv-symbol-price-quote__row.js-last-price-block-value-row > div.js-symbol-change-direction.tv-symbol-price-quote__change.tv-symbol-price-quote__change--growing > span.js-symbol-change-pt.tv-symbol-price-quote__change-value";
	const changeVal = await page.$eval(changeSelVal, el => {return el.innerHTML;});
	let changePer = await page.$eval(changeSelPer, el => {return el.innerHTML;});
	if (changePer[0] == "(" && changePer[changePer.length - 1] == ")")
	{
		changePer = changePer.substring(1, changePer.length - 1);
	}
	const coinPairNameSel = "div.tv-category-header__title > div:nth-child(1) > span > span.tv-symbol-header__second-line--text";
	const coinpairName = await page.$eval(coinPairNameSel, el => {return el.innerHTML;});
	const currentPriceSel = "div.tv-category-header__main-price.js-scroll-container > div > div > div > div.tv-symbol-price-quote__row.js-last-price-block-value-row > div.tv-symbol-price-quote__value.js-symbol-last";
	const currentPrice = await page.$eval(currentPriceSel, el => {return el.textContent;});
	await bot.telegram.sendMessage(
		chat_id, 
		`==== ${ coinpairName } | ${ changePer } | ${ changeVal } | ${ currentPrice } ====`
	);
	const sels = [
		"[id=\"1W\"]",
		"[id=\"1M\"]"
	];
	for (let index = 0;index < Object.keys(sels).length;index++)
	{
		const sel = sels[index];
		await common.waitAndClick(page, sel);
		const priod = await page.$eval(sel, el => {return el.innerHTML;}); // 1 week
		const SumSel = "#technicals-root > div > div > div:nth-child(2) > div:nth-child(2) > span:nth-child(3)";
		const SUMRes = await page.$eval(SumSel, el => {return el.innerHTML;});
		const MASel = "#technicals-root > div > div > div:nth-child(2) > div:nth-child(3) > span";
		const MARes = await page.$eval(MASel, el => {return el.innerHTML;});
		const OSSel = "#technicals-root > div > div > div:nth-child(2) > div:nth-child(1) > span";
		const OSRes = await page.$eval(OSSel, el => {return el.innerHTML;});
		await checkRes(possiblities, [SUMRes, MARes, OSRes], chat_id);
		await sendToTel(possiblities, [SUMRes, MARes, OSRes], `${ priod }`, chat_id);
	}
}

function checkRes (possiblities, params, chat_id)
{
	params.forEach(element =>
	{
		if (possiblities.indexOf(element.toLowerCase()) == -1)
		{
			console.log("Sometinhs is wrong", element);
			bot.telegram.sendMessage(chat_id, `Sometinhs is wrong + ${ element }`);
		}
	});
}

async function sendToTel (possiblities, params, name, chat_id)
{
	let sell = 0;
	let buy = 0;
	let sellC = 0;
	let buyC = 0;
	params.forEach(element =>
	{
		const loc = possiblities.indexOf(element.toLowerCase());
		if (loc > 2)
		{
			buy = buy + loc;
			buyC++;
		}
		if (loc < 2)
		{
			sell = sell + loc;
			sellC++;
		}
	});
	if (buy > 10 && buyC == 3 || sell < 2 && sellC == 3)
	{
		let sign = "";
		if (buy > 10 && buyC == 3)
		{
			sign = "↗️";
		}
		else if (sell < 2 && sellC == 3)
		{
			sign = "🔻";
		}
		const message = `${ name } ${ sign }\nSummary: ${ params[0] }\nMoving Averages: ${ params[1] }\nOscillators: ${ params[2] }`;
		console.log(message);
		await bot.telegram.sendMessage(chat_id, message);
	}
}

function expressServer() 
{
	try
	{
		var app = express();
		setInterval(function ()
		{
			try
			{
				https.get(defaults.herokoAppAddress);
			}
			catch (error)
			{
				console.log("Could not send the request", error);
			}
		}, 300000); // every 5 minutes (300000)
	
		app.get("/", (req, res) => {return res.send("hi");});
		app.listen(port, () => {return console.log(`Listening on port: ${ port }!`);});
		if (defaults.useCron)
		{
			var job = new CronJob(`*/${ defaults.cronEveryMin } * * * *`, async function cl ()
			// let job = new CronJob(`0 */1 * * *`, async function cl()
			{
				if (typeof cl.counter == "undefined")
				{
					cl.counter = 0;
				}
				console.log("Run number:", cl.counter++);
				console.log("Chanced");
				await run();
			}, null, true, "Asia/Tehran");
			job.start();
			// cron.schedule(`*/${defaults.cronEveryMin} * * * *`, async function cl()
			// {
			// 	if( typeof cl.counter == 'undefined' )
			// 	{
			// 		cl.counter = 0;
			// 	}
			// 	console.log('Run number:', cl.counter++);
			// 	console.log('Chanced');
			// 	await run();
			// });
		}
		run();
		return;
	}
	catch (error)
	{
		console.log(error);
		isRunning = false;
		// process.exit(-2);
	}
	
}

function preload ()
{
	// Object.defineProperty(navigator, "languages",
	// {
	// 	get: function () {
	// 		return ["en-US", "en"];
	// 	},
	// });
	// Object.defineProperty(navigator, 'webdriver',
	// {
	// 	get: () => false,
	// });
	delete navigator.__proto__.webdriver;
	delete navigator.__proto__.webdriver;
	delete navigator.webdriver;
	window.navigator.chrome =
	{
		"app":
		{
			"isInstalled": false,
			"InstallState":
			{
				"DISABLED": "disabled",
				"INSTALLED": "installed", "NOT_INSTALLED": "not_installed"
			},
			"RunningState":
			{
				"CANNOT_RUN": "cannot_run", "READY_TO_RUN": "ready_to_run", "RUNNING": "running"
			}
		},
		"runtime":
		{
			"OnInstalledReason":
			{
				"CHROME_UPDATE": "chrome_update", "INSTALL": "install", "SHARED_MODULE_UPDATE": "shared_module_update", "UPDATE": "update"
			},
			"OnRestartRequiredReason":
			{
				"APP_UPDATE": "app_update", "OS_UPDATE": "os_update", "PERIODIC": "periodic"
			},
			"PlatformArch":
			{
				"ARM": "arm", "MIPS": "mips", "MIPS64": "mips64", "X86_32": "x86-32", "X86_64": "x86-64"
			},
			"PlatformNaclArch":
			{
				"ARM": "arm", "MIPS": "mips", "MIPS64": "mips64", "X86_32": "x86-32", "X86_64": "x86-64"
			},
			"PlatformOs":
			{
				"ANDROID": "android", "CROS": "cros", "LINUX": "linux", "MAC": "mac", "OPENBSD": "openbsd", "WIN": "win"
			},
			"RequestUpdateCheckStatus":
			{
				"NO_UPDATE": "no_update", "THROTTLED": "throttled", "UPDATE_AVAILABLE": "update_available"
			}
		}
	};
	window.navigator.languages = [ "en-US", "en" ];
}
