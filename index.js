const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
            args: ['--start-maximized']
        });
        const page = await browser.newPage();

        await page.goto('https://www.flipkart.com/search?q=iphone&page=1', {
            waitUntil: 'networkidle2'
        });

        let items = [];
        let isLastPage = false;

        while (!isLastPage) {
            await page.waitForSelector('.tUxRFH', { visible: true });

            const products = await page.$$('.tUxRFH');

            for (const product of products) {
                let title = null;
                let price = null;
                let image = null;

                try {
                    title = await page.evaluate(el => el.querySelector('.KzDlHZ')?.textContent, product);
                } catch { }

                try {
                    price = await page.evaluate(el => el.querySelector('.Nx9bqj._4b5DiR')?.textContent.trim(), product);
                } catch { }

                try {
                    image = await page.evaluate(el => el.querySelector('.DByuf4')?.src, product);
                } catch { }

                if (title) {
                    items.push({ title, price, image });

                    fs.appendFileSync('results.csv', `${title.replace(/,/g, '.' )},${price},${image}\n`, 'utf8', function (err) {
                        if (err) {
                            console.error('Error writing to CSV file:', err);
                        }
                    });
                }
            }

            // Check and click on the Next button
            try {
                const nextBtn = await page.$('a._9QVEpD');
                if (nextBtn) {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle2' }),
                        nextBtn.click()
                    ]);
                } else {
                    isLastPage = true;
                }
            } catch (error) {
                console.error('Error navigating to next page:', error);
                isLastPage = true;
            }
        }

        console.log('items:', items);
        console.log("\nLength: " + items.length + ' items found');
        await browser.close();
    } catch (error) {
        console.error('Error in main script:', error);
    }
})();
