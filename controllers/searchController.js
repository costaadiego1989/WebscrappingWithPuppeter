const { scrapeWithRetry } = require('../services/scraperService');
const { saveLog } = require('../utils/logUtils');
const NodeCache = require('node-cache');

const CACHE_TTL = 600;
const cache = new NodeCache({ stdTTL: CACHE_TTL });

exports.searchProducts = async (req, res) => {
    const { keyword, page = 1, itemsPerPage = 10, country = 'BR' } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'É necessário enviar o parâmetro Keyword.' });
    }

    const cacheKey = `${keyword}-${page}-${itemsPerPage}-${country}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return res.json(cachedResult);
    }

    try {
        const result = await scrapeWithRetry(keyword, parseInt(page), parseInt(itemsPerPage), country);
        cache.set(cacheKey, result);
        res.json(result);
    } catch (error) {
        console.error(error);
        await saveLog(`Erro ao fazer o Scrapping: ${error.message}`);
        res.status(500).json({ error: 'Ocorreu um erro ao fazer o Scrapping.' });
    }
};