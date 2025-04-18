const { ipcMain } = require('electron');

ipcMain.handle('salvar-cadastro', async (_, dados) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(app.getPath('userData'), 'config', 'usuario.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
  return true;
});
