const fs = require('fs');
const path = require('path');
const { getUserDataPath } = require('../config/paths');

function registrarCadastroHandlers(ipcMain) {
  console.log("Registrando salvar-cadastro...");

  ipcMain.handle('salvar-cadastro', async (event, dados) => {
    const dir = getUserDataPath();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, 'usuario.json');
    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
  });
}

module.exports = { registrarCadastroHandlers };
