const fs = require('fs').promises;
const path = require('path');

const appDir = path.dirname(require.main.filename);
const logDir = path.join(appDir, 'logs');

async function saveLog(message) {
    const logFilePath = path.join(logDir, 'scraping.log');
    try {
        await fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`);
        console.log(`Log salvo em: ${logFilePath}`);
    } catch (error) {
        console.error(`Erro ao salvar log: ${error.message}`);
    }
}

module.exports = { saveLog };