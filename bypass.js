const { executablePath } = require('puppeteer');
const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files/Chrome/Application/chrome.exe",
    userDataDir: "C:/Users/anujv/AppData/Local/Google/Chrome/User Data",
    // args: ['--proxy-server=http://162.23.125.34:8080']
}).then(async browser => {
    console.log('Running tests...')

    const page = await browser.newPage();
    await page.goto('https://bot.sannysoft.com');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.screenshot({ path: 'testresult.png', fullPage: true });
    await browser.close();
    console.log(`All done, check the screenshot. ✨`)
})