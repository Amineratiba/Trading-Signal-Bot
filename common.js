"use strict";

const publicIp = require("public-ip");
const sleep = require("sleep");
const random = require("random");
const internetAvailable = require("internet-available");
const delay = require("delay");
const colors = require("colors");

exports.internetCheck = async function()
{
	await internetAvailable({
		timeout: 5000,
		retries: 5
	})
	.catch(() =>
	{
		console.log("NO internet!".red);
		process.exit(-2);
	});
};

exports.goingToPage = async function (page, link)
{
	try
	{
		console.log(`Opening page "${link}"`.yellow);
		await page.goto(link , exports.waitUntil);
		await delay(5000);
		return true;
	}
	catch (error)
	{
		console.log(`ERROR loading: "${link}"`.red);
		throw error;
	}
};

exports.publicIP = async function()
{
	console.log(`public IP: ${await publicIp.v4()}`.yellow);
};

exports.randomWaitfor = async function (page, min=900 , max=4000)
{
	const r = random.int(min, max);
	await page.waitForTimeout(r);
};

exports.randomSleep = function (min=1 , max=6)
{
	const r = random.int(min, max);
	sleep.sleep(r);
};

exports.randomWaitFull = async function (page, min=1 , max=6, pd=1000)
{
	await page.waitForTimeout(pd);
	const r = random.int(min, max);
	sleep.sleep(r);
};

exports.closingOtherTabs = async function (browser, page)
{
	let brWindows = await browser.pages();
	let i = 0;
	while(brWindows.length > 1)
	{
		// console.log(brWindows[i]._target._targetId);
		if(brWindows[i]._target._targetId != page._target._targetId)
		{
			await delay(1000);
			try { await brWindows[i].close(); }
			catch(error) { console.log("Page close error"); }
			brWindows = await browser.pages();
		}
		else
		{
			i++;
		}
	}
};

exports.closingBrowser = async function (browser, page)
{
	if(defaults.closeBrowser)
	{
		await exports.closingOtherTabs(browser, page);
		await delay(3000);
		try { await page.close(); }
		catch(error)
		{
			// console.log("Page close error");
		}
		await exports.randomWaitFull(page, 1 , 2, 1000);
		try { await browser.close(); }
		catch(error)
		{
			// console.log("browser close error");
		}
	}
};

exports.setWindowSize = async function (page, width, height) 
{
	const session = await page.target().createCDPSession();
	const {windowId} = await session.send("Browser.getWindowForTarget");
	await session.send("Browser.setWindowBounds", {windowId, bounds: {width, height}});
	await session.detach();
};

exports.trimChar = function(string, charToRemove) 
{
	while(string.charAt(0)==charToRemove) 
	{
		 string = string.substring(1);
	}

	while(string.charAt(string.length-1)==charToRemove) 
	{
		 string = string.substring(0,string.length-1);
	}

	return string;
};