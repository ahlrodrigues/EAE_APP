// handlers/notasHandler.js

const fs = require('fs');
const path = require('path');
const { getUserDataPath } = require('../config/paths');

function registrarNotasHandlers(ipcMain) {
  ipcMain.handle('salvar-nota', async (event, nome, conteudo) => {
    const notasDir = path.join(getUserDataPath(), 'notas');
    if (!fs.existsSync(notasDir)) fs.mkdirSync(notasDir, { recursive: true });

    const filePath = path.join(notasDir, nome);
    fs.writeFileSync(filePath, conteudo);
  });

  ipcMain.handle('listar-notas', async () => {
    const notasDir = path.join(getUserDataPath(), 'notas');
    if (!fs.existsSync(notasDir)) return [];
    return fs.readdirSync(notasDir);
  });

  ipcMain.handle('ler-nota', async (event, nome) => {
    const filePath = path.join(getUserDataPath(), 'notas', nome);
    if (!fs.existsSync(filePath)) throw new Error('Nota não encontrada');
    return fs.readFileSync(filePath, 'utf-8');
  });
}

module.exports = { registrarNotasHandlers };
