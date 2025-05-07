const { BrowserWindow } = require('electron');

function registrarVisualizacaoHandler(ipcMain) {
  ipcMain.handle('abrir-visualizacao-notas', async (event, conteudoHTML) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Visualização das Notas',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true
      }
    });

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Notas</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 2rem;
              background: #f9f9f9;
              color: #333;
            }
            .notaVisualizada {
              border: 1px solid #ccc;
              border-radius: 8px;
              background: white;
              padding: 1rem;
              margin-bottom: 1.5rem;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            hr {
              border: none;
              border-top: 1px dashed #999;
              margin: 2rem 0;
            }
          </style>
        </head>
        <body>
          ${conteudoHTML}
        </body>
      </html>
    `;

    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });
}

module.exports = { registrarVisualizacaoHandler };
