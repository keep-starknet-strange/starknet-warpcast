const fs = require('fs');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const { generateSHA256Hash, sleep } = require('./utils');

dotenv.config();

const sync = async () => {
    const browser = await getBrowser();

    const frenList = await fetchFrenList(browser);
    fs.writeFileSync('./data/frenList.json', JSON.stringify(frenList));

    for (let i = 0; i < frenList.length; i++) {
        let fren = frenList[i];
        let frenFarCasterProfileUrl = fren.frenFarCasterProfileUrl;
        await takeScreenShot(browser, frenFarCasterProfileUrl);
    }

}

const getBrowser = async () => {
    const options = process.env.PROD == "true" ? {
        executablePath: process.env.CHROMIUM_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    } : {
    }

    const browser = await puppeteer.launch({
        ...options,
        headless: true,
        defaultViewport: {
            width: 542,
            height: 284,
            isLandscape: true
        }
    });
    return browser;
}

const takeScreenShot = async (browser, frenFarCasterProfileUrl) => {
    const clipRegion = {
        x: 0,    // The x-coordinate of the top-left corner of the clip area
        y: 0,    // The y-coordinate of the top-left corner of the clip area
        width: 542,  // The width of the clip area
        height: 284  // The height of the clip area
    };
    const page = await browser.newPage();
    await page.goto(frenFarCasterProfileUrl, { waitUntil: 'networkidle2' });
    await sleep(5000);

    await page.screenshot({ path: `./data/${generateSHA256Hash(frenFarCasterProfileUrl)}.png`, clip: clipRegion });
    await page.close();
}

const fetchFrenList = async (browser) => {
    const page = await browser.newPage();
    await page.goto("https://github.com/keep-starknet-strange/starknet-warpcast/blob/main/builder_follow_builder.md", { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    let result = await page.evaluate(() => {
        const arr = [];
        let table = document.getElementsByTagName('table')[0];
        let tableBody = table.children[1];

        for (let i = 0; i < tableBody.children.length; i++) {
            let row = tableBody.children[i];
            let frenName = row.children[0].innerText;
            let frenFarCasterProfileUrl = row.children[1].children[0].href;

            arr.push({ frenName, frenFarCasterProfileUrl });
        }

        return arr;
    });

    await page.close();

    return result;
}

module.exports = {
    sync
}
