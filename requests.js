const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
    });

    const page = await browser.newPage();

    page.on("request", async (request) => {
        const url = request.url();

        if (url.includes("https://www.google.com/log?format=json")) {
            console.log("URL:", url);
            console.log("Method:", request.method());
            console.log(`Headers:", ${JSON.stringify(request.headers())}`);
        }
    });

    await page.goto('https://www.google.com/complete/search?q&cp=0&client=mobile-gws-wiz-img&xssi=t&gs_pcrt=2&ds=i&hl=en-IN&authuser=0&pq=mountains&psi=eHCPaInDIoT5seMP0ovOiAs.1754230903858&dpr=2.0000000298023224&pfq=mountains');
})();