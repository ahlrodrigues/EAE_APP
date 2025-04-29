// handlers/authHandler.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getUserConfigPath } = require('../config/paths');

function registrarAuthHandlers(ipcMain) {
  ipcMain.handle('validar-senha', async (event, senha) => {
    const filePath = path.join(getUserConfigPath(), 'usuario.json');

    if (!fs.existsSync(filePath)) {
      console.error('❌ usuario.json não encontrado em validar-senha.');
      throw new Error('Arquivo usuario.json não encontrado.');
    }

    const dados = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return dados.senha === senha;
  });

  ipcMain.handle('validar-senha-hash', async (event, senha) => {
    try {
      const filePath = path.join(getUserConfigPath(), 'usuario.json');
  
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo usuario.json não encontrado.');
      }
  
      const dados = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const senhaHash = dados.senha;
  
      const senhaValida = await bcrypt.compare(senha, senhaHash);
  
      if (senhaValida) {
        global.senhaDescriptografia = senha; // ✅ define a senha em memória
        console.log("🔐 Senha salva em global.senhaDescriptografia");
        return { sucesso: true };
      } else {
        return { sucesso: false, mensagem: 'Senha incorreta.' };
      }
    } catch (err) {
      console.error('Erro ao validar senha:', err.message);
      return { sucesso: false, mensagem: err.message };
    }
  
});
}
module.exports = { registrarAuthHandlers };