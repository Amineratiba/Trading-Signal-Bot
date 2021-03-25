"use strict"

const publicIp = require('public-ip');
let sleep = require("sleep");
const random = require('random');
const fs = require('fs');
const internetAvailable = require("internet-available");
let unique = require('array-unique');
let delay = require('delay');

exports.goingToPage = async function (page, link)
{
	try
	{
		console.log('Going to page ...');
		await page.goto(link , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await delay(1000);
		return true;
	}
	catch (error)
	{
		console.log('ERROR goingTo Page' , error);
		return false;
	}
}

exports.internetCheck = async function()
{
	await internetAvailable(
	{
		// Provide maximum execution time for the verification
		timeout: 5000,
		// If it tries 5 times and it fails, then it will throw no internet
		retries: 5
  })
  .then(() =>
  {})
  .catch(() =>
  {
	  console.log("NO internet!");
	  process.exit(-2);
  });
}

exports.publicIP = async function()
{
	(async () =>
	{
		console.log("Our public IP is:", await publicIp.v4());
	})();
}

exports.UpdateConfigFile = async function (config, username)
{
	let jsonContent = JSON.stringify(config);
	fs.writeFile(`./users/${username}/info.json`, jsonContent, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
		console.log("JSON file has been updated.");
	});
}

exports.randomWaitfor = async function (page, min=900 , max=4000)
{
	let r = random.int(min, max)
	await page.waitFor(r)
}

exports.randomSleep = async function (min=1 , max=6)
{
	let r = random.int(min, max)
	sleep.sleep(r);
}

exports.randomWaitFull = async function (page, min=1 , max=6, pd=1000)
{
	await page.waitFor(pd)
	let r = random.int(min, max)
	sleep.sleep(r)
}

exports.scrol = async function (page)
{
	let res = await page.evaluate(_ =>
	{
		let ranNum = Math.floor((Math.random() * 65) + 20);
		window.scrollBy(0, window.innerHeight + ranNum);
		return document.body.scrollHeight;
	});
	return res;
}

exports.scrols = async function (page, time)
{
	let resS = [];
	for (let index = 0; index < time; index++)
	{
		let tmp = await exports.scrol(page);
		resS.push(tmp);
		await exports.randomWaitfor(page);
		await exports.randomWaitfor(page);
		let resSLen = resS.length;
		if(resSLen > 3)
		{
			if( (resS[resSLen-1] + resS[resSLen-2]) - (resS[resSLen-3] + resS[resSLen-4]) == 0 )
			{
				return -2;
			}
		}
	}
}

exports.subList = async function (page, username, subscriptions, subscriptionsBlackList)
{
	try
	{
		console.log('Finding subscribers ...');
		try { await page.goto(`https://www.minds.com/${username}/subscriptions`  , {waitUntil: 'networkidle0'}); }
		catch(error) { console.log('Error subList, could not fully open the page'); }
		await exports.randomWaitfor(page);
		await exports.scrols(page, 20);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		await exports.scrols(page, 20);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		await exports.scrols(page, 20);
		let subNumberSel = "body > m-app > m-body > m-channel-container > m-channel > div.mdl-grid.channel-grid > section.mdl-cell.mdl-cell--8-col > m-channel--subscriptions";
		let subNumber;
		try { subNumber = await page.$eval(subNumberSel, el => el.childElementCount ); }
		catch(error) { console.log('Error finding sun number'); }
		console.log(`${subNumber} subscribers.`);
		for (let index = 1; index < subNumber; index++)
		{
			let subNameSel = `body > m-app > m-body > m-channel-container > m-channel > div.mdl-grid.channel-grid > section.mdl-cell.mdl-cell--8-col > m-channel--subscriptions > div:nth-child(${index}) > minds-card-user > a > div.body > h3`;
			const subName = await page.$eval(subNameSel, el => el.innerText );
			subscriptions.push(subName);
			let subUsername = await page.$eval(`body > m-app > m-body > m-channel-container > m-channel > div.mdl-grid.channel-grid > section.mdl-cell.mdl-cell--8-col > m-channel--subscriptions > div:nth-child(${index}) > minds-card-user > a > div.body > span`, el => el.innerText );
			if(subUsername != null)
			{
				if(subUsername[0] == '@')
				{
					subscriptions.push(subUsername);
					subUsername = subUsername.slice(1);
				}
			}
			subscriptions.push(subUsername);
			subscriptions.push(subUsername.toLowerCase());
			console.log(subName, subUsername);
		}

		for (let i = 0; i < subscriptionsBlackList.length*7; i++)
		{
			let loc = subscriptions.indexOf(subscriptionsBlackList[i]);
			if ( loc != -1)
			{
				subscriptions.splice(loc, 1);
			}
		}
		unique(subscriptions);
		if(subscriptions.length == 0)
		{
			throw "No Sub";
		}
		return true;
	}
	catch (error)
	{
		console.log('ERROR SUBS');
		console.log(error);
		return false;
	}
}

exports.closeSession = async function (page)
{
	try
	{
		console.log('Closing Session ...');
		let sel = `body > m-app > m-v2-topbar > div.m-v2-topbar__Top > div > div.m-v2-topbar__Container--right > div.m-v2-topbar__UserMenu > m-user-menu > div.m-user-menu.m-dropdown > a`;
		await page.click(sel , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await exports.randomSleep(1,2);
		sel = `body > m-app > m-v2-topbar > div.m-v2-topbar__Top > div > div.m-v2-topbar__Container--right > div.m-v2-topbar__UserMenu > m-user-menu > div.m-user-menu.m-dropdown > ul > li:nth-child(10) > a`;
		await page.click(sel , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await exports.scrol(page);
		await exports.scrol(page);
		await exports.randomSleep(1,2);
		sel = `body > m-app > m-body > m-settings > div > div > div.m-page--main > m-settings--general > div.m-settings--section.m-border.m-settings--close-all-sessions > button`;
		await page.click(sel , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		return true;
	}
	catch (error)
	{
		console.log('ERROR closeSession');
		// console.log(error);
		return false;
	}
}

exports.loggedInCheck = async function (page, username)
{
	try
	{
		console.log(`Checking Login status as ${username} ...`);
		try{ await page.goto('https://www.minds.com/newsfeed/subscriptions' , {"waitUntil" : "networkidle0"});
		}catch(error){ console.log('Error loggedInCheck, could not fully open the page'); }
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		let sel = `body > m-app > m-body > m-newsfeed > div.mdl-grid.m-newsfeed.m-page > div.mdl-cell.mdl-cell--4-col.m-newsfeed--sidebar.m-newsfeed__sidebar > minds-card-user > a > div.body > span`;
		const UN = await page.$eval(sel, el => el.innerText );
		if (UN.slice(1) == username)
		{
			console.log('Already logged-In');
			return true;
		}
		console.log('Not logged-in');
		return false;
	}
	catch (error)
	{
		// console.log('Error loggedInCheck' , error);
      console.log('Probably not logged in before');
		return false;
	}
}

exports.login = async function (page, username, password)
{
	try
	{
		console.log(`Logging in as ${username} ...`);
		await page.goto('https://www.minds.com/login' , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 7, 7000);
		await page.type('#username' , username , {delay: 50});
		await exports.randomSleep(1,2);
		await page.type('#password' , password , {delay: 50});
		await exports.randomSleep(1,2);
		await page.click("body > m-app > m-body > m-login > div > div > div > minds-form-login > form > div.mdl-card__actions > button" , {"waitUntil" : "networkidle0"})
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 3 , 8, 4000);
		return false;
	}
	catch (error)
	{
		console.log('ERROR LOGIN');
		return true;
	}
}

exports.goingToFeedingPage = async function (page)
{
	try
	{
		console.log('Going to feed page ...');
		let newsfeedSelector = `body > m-app > m-v2-topbar > div.m-v2-topbar__Top > div > div.m-v2-topbar__Container--left > nav > a:nth-child(2)`;
		await page.click(newsfeedSelector , {"waitUntil" : "networkidle0"})
		await exports.randomWaitfor(page);
		await exports.randomWaitFull(page, 2 , 5, 10000);
		return true;
	}
	catch (error)
	{
		console.log('ERROR goingToFeedingPage');
		return false;
	}
}

exports.goingToBannedPage = async function (page)
{
	try
	{
		console.log('Going to banning page ...');
		await page.goto('https://www.minds.com/settings/blocked-channels' , {"waitUntil" : "networkidle0"});
		await exports.randomWaitfor(page);
		return false;
	}
	catch (error)
	{
		console.log('ERROR goingToBannedPage');
		return true;
	}
}

exports.closingOtherTabs = async function (browser, page)
{
	let close = true;
	// close = false;
	if(close)
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
	}
}

exports.closingBrower = async function (browser, page)
{
	let close = true;
	// close = false;
	if(close)
	{
		let brWindows = await browser.pages();
		while(brWindows.length > 0)
		{
			await exports.randomWaitFull(page, 2 , 2, 2000);
			try { await brWindows[0].close(); }
			catch(error) { console.log("Page close error"); }
			brWindows = await browser.pages();
		}
		try { await page.close(); }
		catch(error)
		{
			// console.log("Page close error");
		}
		await exports.randomWaitFull(page, 2 , 2, 2000);
		try { await browser.close(); }
		catch(error)
		{
			console.log("browser close error");
		}
	}
}

exports.trimChar = function(string, charToRemove) {
	while(string.charAt(0)==charToRemove) {
		 string = string.substring(1);
	}

	while(string.charAt(string.length-1)==charToRemove) {
		 string = string.substring(0,string.length-1);
	}

	return string;
}