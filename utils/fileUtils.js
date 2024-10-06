const fs = require('fs');
const path = require('path');

const appDir = path.dirname(require.main.filename);
const logDir = path.join(appDir, 'logs');
const snapshotsDir = path.join(appDir, 'snapshots');

function createDirs() {
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
        if (!fs.existsSync(snapshotsDir)) {
            fs.mkdirSync(snapshotsDir);
        }
    } catch (err) {
        console.error('Erro ao criar os diretórios:', err);
    }
}

async function saveSnapshot(page, filePath) {
    try {
        await page.screenshot({ path: filePath });
        console.log(`Snapshot salvo em: ${filePath}`);
    } catch (error) {
        console.error(`Erro ao salvar snapshot: ${error.message}`);
    }
}

module.exports = { createDirs, saveSnapshot };