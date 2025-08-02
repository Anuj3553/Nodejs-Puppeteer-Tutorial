const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // Headeless mode because we want to see the browser actions
        defaultViewport: false, // Disable default viewport to use full screen
    });
    const page = await browser.newPage();
    await page.goto('https://www.flipkart.com/search?q=iphone&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&page=1', {
        waitUntil: 'load'
    });

    const is_disabled = await page.$('._9QVEpD') !== null;

    console.log('is_disabled:', is_disabled);

    await browser.close();
})();