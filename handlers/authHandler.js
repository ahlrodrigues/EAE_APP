// handlers/authHandler.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getUserDataPath } = require('../config/paths');

function registrarAuthHandlers(ipcMain) {
  ipcMain.handle('validar-senha', async (event, senha) => {
    const filePath = path.join(getUserDataPath(), 'usuario.json');
    const dados = JSON.parse(fs.readFileSync(filePath));
    return dados.senha === senha;
  });

  ipcMain.handle('validar-senha-hash', async (event, senha) => {
    const filePath = path.join(getUserDataPath(), 'usuario.json');
    const dados = JSON.parse(fs.readFileSync(filePath));
    return await bcrypt.compare(senha, dados.senha);
  });
}

module.exports = { registrarAuthHandlers };
