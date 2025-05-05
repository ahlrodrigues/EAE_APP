const fs = require('fs');
const path = require('path');
const { getNotasPath } = require('../config/paths'); // ✅ função correta agora

function registrarNotasHandlers(ipcMain) {
  ipcMain.handle('salvar-nota', async (event, nome, conteudo) => {
    try {
      const notasDir = getNotasPath();
      if (!fs.existsSync(notasDir)) fs.mkdirSync(notasDir, { recursive: true });
  
      const filePath = path.join(notasDir, nome);
      fs.writeFileSync(filePath, conteudo, "utf-8");
  
      console.log(`📝 Nota salva com sucesso: ${filePath}`);
      return true;
    } catch (err) {
      console.error("❌ Erro ao salvar nota:", err);
      throw err;
    }
  });
  

  ipcMain.handle('listar-notas', async () => {
    try {
      const notasDir = getNotasPath();
      if (!fs.existsSync(notasDir)) return [];
  
      const arquivos = fs.readdirSync(notasDir).filter((arq) => arq.endsWith(".txt"));
      console.log(`📄 ${arquivos.length} notas encontradas.`);
      return arquivos;
    } catch (err) {
      console.error("❌ Erro ao listar notas:", err);
      return [];
    }
  });

  ipcMain.handle('ler-nota', async (event, nome) => {
    if (!nome || typeof nome !== 'string') {
      console.error('❌ Nome de nota inválido em ler-nota:', nome);
      throw new Error('Nome de nota inválido');
    }
  
    const filePath = path.join(getNotasPath(), nome);
  
    if (!fs.existsSync(filePath)) {
      console.error('❌ Nota não encontrada:', filePath);
      throw new Error('Nota não encontrada');
    }
    console.log(`📖 Lendo nota: ${filePath}`);
    return fs.readFileSync(filePath, 'utf-8');
  });
  
}

module.exports = { registrarNotasHandlers };
