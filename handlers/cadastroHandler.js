// handlers/cadastroHandler.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getUserDataPath } = require('../config/paths');

function registrarCadastroHandlers(ipcMain) {
  ipcMain.handle('salvar-cadastro', async (event, dados) => {
    const dir = getUserDataPath();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, 'usuario.json');
    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
  });
}

module.exports = { registrarCadastroHandlers };
