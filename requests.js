const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
    });

    const page = await browser.newPage();

    page.on("request", async (request) => {
        const url = request.url();

        if (url.includes("https://imgs.search.brave.com/")) {
            console.log("Image request intercepted:", url);
        }
    });

    await page.goto('https://search.brave.com/images?q=mountains'); 
})();