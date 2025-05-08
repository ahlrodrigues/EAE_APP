const path = require('path');
const { BrowserWindow } = require('electron');

function registrarVisualizacaoHandler(ipcMain) {
  ipcMain.handle('abrir-nota-multi', async (event, conteudoHTML) => {
    console.log("📥 Handler 'abrir-nota-multi' foi chamado");
    console.log("🔍 Conteúdo recebido:", conteudoHTML?.substring?.(0, 200));
    console.log("🪟 Solicitada abertura da janela de múltiplas notas");

    try {
      const win = new BrowserWindow({
        width: 1000,
        height: 800,
        title: 'Visualização das Notas',
        webPreferences: {
          contextIsolation: true,
          preload: path.join(__dirname, '..', 'preload.js'),
        }
      });

      // ✅ Constrói o HTML completo separadamente
      const htmlString = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
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
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            hr {
              border: none;
              border-top: 1px dashed #999;
              margin: 2rem 0;
            }
          </style>
        </head>
        <body>
        <div style="text-align: center; margin-bottom: 2rem;">
        <img src="https://siagutatemp.wordpress.com/wp-content/uploads/2015/05/9e10b-trevo.png" alt="Logo Trevo" style="max-height: 80px;">
        <h1 style="margin-top: 1rem;">Escola de Aprendizes do Evangelho</h1>
        </div>
          ${conteudoHTML}
        </body>
        </html>
      `;

      const htmlBase64 = Buffer.from(htmlString, 'utf-8').toString('base64');
      const dataURL = `data:text/html;base64,${htmlBase64}`;

      console.log("📤 Enviando conteúdo base64 para a nova janela.");
      await win.loadURL(dataURL);
      console.log("✅ Janela carregada com HTML das notas.");
    } catch (erro) {
      console.error("❌ Erro ao abrir janela de múltiplas notas:", erro);
    }
  });
}

module.exports = { registrarVisualizacaoHandler };
