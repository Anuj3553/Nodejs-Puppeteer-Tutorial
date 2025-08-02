const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp'
    })
    const page = await browser.newPage();
    await page.goto('https://www.flipkart.com/search?q=iphone&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off');

    const products = await page.$$('.tUxRFH');

    let items = [];

    for (const product of products) {
        let title = null
        let price = null
        let image = null

        try {
            title = await page.evaluate(el => el.querySelector('.KzDlHZ').textContent, product);
        } catch (error) {
            console.error('Error fetching title:', error);
        }

        try {
            price = await page.evaluate(el => el.querySelector('.Nx9bqj._4b5DiR').textContent.trim(), product);
        } catch (error) {
            console.error('Error fetching price:', error);
        }

        try {
            image = await page.evaluate(el => el.querySelector('.DByuf4').src, product);
        } catch (error) {
            console.error('Error fetching image:', error);
        }

        if (title !== "Null") {
            items.push({ title, price, image });
        }

    }

    console.log('items:', items);

    console.log("\nLength: " + items.length + ' items found');

    await browser.close();
})();