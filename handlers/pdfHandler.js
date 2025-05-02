const { BrowserWindow, dialog } = require('electron');
const fs = require('fs');

function registrarPdfHandlers(ipcMain) {
  ipcMain.handle('gerar-pdf', async (event, html, nomeArquivo, salvarNoDisco = true) => {
    const tempWin = new BrowserWindow({
      show: false,
      webPreferences: { offscreen: true }
    });

    await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const pdfData = await tempWin.webContents.printToPDF({});
    await tempWin.close();

    if (salvarNoDisco) {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Salvar PDF',
        defaultPath: nomeArquivo || 'Notas_EAE.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (filePath) fs.writeFileSync(filePath, pdfData);
      return null;
    } else {
      return pdfData; // usado para anexos de e-mail
    }
  });
}

module.exports = { registrarPdfHandlers };
