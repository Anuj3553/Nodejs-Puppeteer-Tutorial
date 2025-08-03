const { Cluster } = require("puppeteer-cluster");
const fs = require('fs');

const urls = [
    "https://www.flipkart.com/search?q=mobiles&as=on&as-show=on&otracker=AS_Query_TrendingAutoSuggest_2_0_na_na_na&otracker1=AS_Query_TrendingAutoSuggest_2_0_na_na_na&as-pos=2&as-type=TRENDING&suggestionId=mobiles&requestId=3f05c92e-283e-4106-8f7b-0eef3a91b899",
    "https://www.flipkart.com/search?q=gift&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off",
    "https://www.flipkart.com/search?q=laptop&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off",
    "https://www.flipkart.com/search?q=cycle&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
];

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 4,
        monitor: true,
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            userDataDir: './tmp',
        }
    })

    cluster.on('taskerror', (err, data) => {
        console.error(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.setUserAgent(
            'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; RM-1152) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15254'
        );

        await page.setExtraHTTPHeaders({
            'accept-language': 'en-US,en;q=0.9',
        });

        let items = [];
        let seenTitles = new Set();
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
                    price = await page.evaluate(el => el.querySelector('.Nx9bqj._4b5DiR')?.textContent.trim(), product);
                    image = await page.evaluate(el => el.querySelector('.DByuf4')?.src, product);
                } catch (err) {
                    console.error("Error extracting product data:", err.message);
                }

                if (title && !seenTitles.has(title)) {
                    seenTitles.add(title);
                    items.push({ title, price, image });

                    fs.appendFileSync('results.csv', `${title.replace(/,/g, '.')},${price},${image}\n`, 'utf8', err => {
                        if (err) console.error('Error writing to CSV file:', err);
                    });
                }
            }

            // Check and click on the Next button
            try {
                const nextBtn = await page.$('a._9QVEpD');
                if (nextBtn) {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle2' }),
                        await page.evaluate(() => {
                            const next = document.querySelector('a._9QVEpD');
                            if (next) next.click();
                        }),
                        await page.waitForSelector('.tUxRFH', { visible: true }),
                    ]);
                } else {
                    isLastPage = true;
                }
            } catch (error) {
                console.error('Error navigating to next page:', error);
                isLastPage = true;
            }
        }

        await page.screenshot();
    });

    for (const url of urls) {
        cluster.queue(url);
    }

    await cluster.idle();
    await cluster.close();
})();