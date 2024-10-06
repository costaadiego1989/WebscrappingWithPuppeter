const puppeteer = require('puppeteer');
const path = require('path');
const { saveSnapshot } = require('../utils/fileUtils');
const { saveLog } = require('../utils/logUtils');
const { generateUserAgent } = require('../utils/userAgentUtils');

const MAX_PRODUCTS = 50;
const WAIT_TIMEOUT = 60000;
const MAX_RETRIES = 3;
const appDir = path.dirname(require.main.filename);
const snapshotsDir = path.join(appDir, 'snapshots');

async function scrapeWithRetry(keyword, page, itemsPerPage, country) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await saveLog(`Iniciando tentativa ${attempt} de ${MAX_RETRIES} para o termo de busca "${keyword}"`);
            return await scrapeGoogleShopping(keyword, page, itemsPerPage, country);
        } catch (error) {
            await saveLog(`Erro na tentativa ${attempt}: ${error.message}`);
            if (attempt === MAX_RETRIES) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function scrapeGoogleShopping(keyword, page, itemsPerPage, country) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu']
    });
    const browserPage = await browser.newPage();

    try {
        await browserPage.setViewport({ width: 1280, height: 800 });
        await browserPage.setUserAgent(await generateUserAgent());
        
        const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(keyword)}&gl=${country}&start=${(page - 1) * itemsPerPage + 1}`;
        await browserPage.goto(url, { waitUntil: 'networkidle2', timeout: WAIT_TIMEOUT });

        await saveSnapshot(browserPage, path.join(snapshotsDir, `page-${page}.png`));

        const products = await browserPage.evaluate((MAX_PRODUCTS) => {
            const items = document.querySelectorAll('.sh-dgr__content');
            return Array.from(items).slice(0, MAX_PRODUCTS).map(item => ({
                title: item.querySelector('h3')?.textContent?.trim() || 'Não disponível',
                price: item.querySelector('.a8Pemb')?.textContent?.trim() || 'Não disponível',
                seller: item.querySelector('.aULzUe')?.textContent?.trim() || 'Não disponível',
                imageUrl: item.querySelector('img')?.src || 'Não disponível',
                link: item.querySelector('a')?.href || 'Não disponível'
            }));
        }, MAX_PRODUCTS);

        await saveLog(`Produtos extraídos na página ${page}: ${products.length}`);

        return {
            metadata: { keyword, page, itemsPerPage, country },
            products: products.slice(0, itemsPerPage)
        };
    } catch (error) {
        await saveSnapshot(browserPage, path.join(snapshotsDir, `error-page-${page}.png`));
        await saveLog(`Erro na página ${page}: ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeWithRetry };