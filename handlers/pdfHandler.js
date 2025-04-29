// handlers/pdfHandler.js

const { BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const { getUserDataPath } = require('../config/paths');
function registrarPdfHandlers(ipcMain) {
  ipcMain.handle('gerar-pdf', async (event, conteudo, nomeArquivo) => {
    const tempWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });

    await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(conteudo)}`);
    const pdfData = await tempWin.webContents.printToPDF({});

    const { filePath } = await dialog.showSaveDialog({
      title: 'Salvar PDF',
      defaultPath: nomeArquivo || 'Notas_EAE.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) fs.writeFileSync(filePath, pdfData);

    await tempWin.close();
  });
}

module.exports = { registrarPdfHandlers };
