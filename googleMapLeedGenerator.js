const proxyChain = require('proxy-chain')
const puppeteer = require('puppeteer-extra')
const fs = require('fs')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// const proxy = "http://gate.nodemaven.com:8080:mixalisktas_gmail_com-country-us-region-new_york-city:5pyqsmquyy"

const main = async () => {
    // const newProxyUrl = await proxyChain.anonymizeProxy(proxy)

    // console.log(newProxyUrl)

    const browser = await puppeteer.launch({
        headless: false,
        // args: [`--proxy-server=${newProxyUrl}`]
    });

    const page = await browser.newPage()
    const keyword = 'lawyer'
    await page.goto(`https://www.google.com/maps/search/${keyword}/`)

    // try {
    // const acceptCookieSelector = "form:nth-child(2)"
    // await page.waitForSelector(acceptCookieSelector)
    // await page.click(acceptCookieSelector)
    // } catch (error) {

    // }

    await page.evaluate(async () => {
        const searchResultsSelector = `div[role="feed"]`;
        const wrapper = document.querySelector(searchResultsSelector);

        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 1000;
            let scrollDelay = 3000

            let timer = setInterval(async () => {
                let scrollHeightBefore = wrapper.scrollHeight;
                wrapper.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeightBefore) {
                    totalHeight = 0;
                    await new Promise(resolve => setTimeout(resolve, scrollDelay));

                    let scrollHeightAfter = wrapper.scrollHeight;

                    if (scrollHeightAfter > scrollHeightBefore) {
                        return;
                    } else {
                        clearInterval(timer);
                        resolve();
                    }
                }
            }, 200)
        })
    })

    const results = await page.evaluate(() => {
        const items = Array.from(
            document.querySelectorAll('div[role="feed"] > div > div[jsaction]')
        )

        return items.map(item => {
            let data = {}

            try {
                data.title = item.querySelector(".fontHeadlineSmall").textContent
            } catch (error) { }

            try {
                data.role = item.querySelector(".W4Efsd > span > span").textContent
            } catch (error) { }

            try {
                data.link = item.querySelector("a").getAttribute("href")
            } catch (error) { }

            try {
                data.website = item.querySelector('[data-value="Website"]').getAttribute("href")
            } catch (error) { }

            try {
                // const ratingText = item
                //     .querySelector('[.fontBodyMedium > span[role="img"]')
                //     .getAttribute("aria-label")
                //     .split(" ")
                //     .map((x) => x.replace(",", "."))
                //     .map(parseFloat)
                //     .filter((x) => !isNaN(x));

                // data.stars = ratingText[0]
                // data.reviews = ratingText[1]


                data.rating = item.querySelector(".MW4etd").textContent

                const rawReviewText = item.querySelector(".UY7F9").textContent;
                const reviewCount = rawReviewText.replace(/[()]/g, "").trim();

                data.reviews = reviewCount;
            } catch (error) { }

            try {
                // const textContent = item.innerText;

                // const phoneRegex =
                //     /((\+?\d{1,2}[ -]?)?(\(?\d{3}\)?[ -]?\d{3,4}[ -]?\d{4}|\(?\d{2,3}\)?[ -]?\d{2,3}[ -]?\d{2,3}))/g;

                // const matches = [...textContent.matchAll(phoneRegex)];

                // let phoneNumbers = matches.map(match => match[0]).filter(phone => (phone.match(/\d/g) || []).length >= 10);

                // let phoneNumber = phoneNumbers.length > 0 ? phoneNumbers[0] : null;

                // if (phoneNumber) {
                //     phoneNumber = phoneNumber.replace(/[ -]/g, "");
                // }

                // data.phone = phoneNumber;

                const rawPhoneText = item.querySelector(".UsdlK").textContent;
                const cleanPhone = rawPhoneText.replace(/\s+/g, "");

                data.phone = cleanPhone;
            } catch (error) { }


            try {
                data.address = item.querySelector('.W4Efsd > span:nth-of-type(2) > span:nth-of-type(2)').textContent
            } catch (error) { }

            return data;
        });
    });

    const filteredResults = results.filter(item => item.title && item.title.length > 0);

    fs.writeFileSync('results.json', JSON.stringify(filteredResults, null, 2));

    console.log("Completed")

    await browser.close()
}

main()