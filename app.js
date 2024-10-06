const express = require('express');
const path = require('path');
const { createDirs } = require('./utils/fileUtils');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

createDirs();

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta: http://localhost:${port}`);
});