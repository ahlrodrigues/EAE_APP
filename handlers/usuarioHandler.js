const fs = require('fs');
const path = require('path');
const { getUserConfigPath } = require('../config/paths');

function registrarUsuarioHandlers(ipcMain) {
  console.log("USUARIOHANDLER.JS - Registrando get-senha-usuario...");

  ipcMain.handle('get-senha-usuario', async () => {
    console.log("USUARIOHANDLER.JS - get-senha-usuario chamado.");
    try {
      const filePath = path.join(getUserConfigPath(), 'usuario.json');

      if (!fs.existsSync(filePath)) {
        console.error('❌ usuario.json não encontrado em get-senha-usuario.');
        throw new Error('Arquivo usuario.json não encontrado.');
      }

      const dados = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return dados.senha;
    } catch (error) {
      console.error('Erro ao obter senha do usuário:', error.message);
      throw new Error('Erro ao obter senha do usuário');
    }
  });
}

module.exports = { registrarUsuarioHandlers };
