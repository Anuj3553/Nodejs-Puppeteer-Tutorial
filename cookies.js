const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Chrome/Application/chrome.exe",
        userDataDir: "C:/Users/anujv/AppData/Local/Google/Chrome/User",
        args: ['--start-maximized'],
        defaultViewport: null
    });

    const page = await browser.newPage();

    await page.goto('https://accounts.google.com/', {
        waitUntil: 'networkidle2'
    });

    // Email
    await page.waitForSelector('#identifierId', { visible: true });
    await page.type('#identifierId', 'example@gmail.com');
    await page.click('#identifierNext button');

    // 🔄 Wait for password field instead of navigation
    await page.waitForSelector('input[type="password"]', { visible: true });

    // Password
    await page.type('input[type="password"]', 'examplepassword');
    await page.click('#passwordNext button');

    // 🔄 Wait for logged-in element (like profile icon or Gmail redirect)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => console.log('Navigation skipped or timeout'));

    // Save cookies
    const cookies = await page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));

    await browser.close();
})();
