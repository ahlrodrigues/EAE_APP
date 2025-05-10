const { BrowserWindow } = require('electron');

function registrarGerarPdfAnexosEmailHandler(ipcMain) {
  ipcMain.handle('gerar-pdf-anexos-email', async (event, conteudos, nomes, tipo) => {
    const anexos = [];

    if (tipo === "unico") {
      const htmlUnico = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; background-color: #fff; }
            .cabecalho {
              text-align: center;
              margin-bottom: 2rem;
            }
            .cabecalho img {
              max-width: 80px;
            }
            .cabecalho h2 {
              margin-top: 10px;
            }
            .nota {
              margin-bottom: 2rem;
              padding: 1rem;
              border: 1px solid #ccc;
              border-radius: 8px;
            }
            .nota h3 {
              margin-top: 0;
              color: #0077cc;
            }
            .nota pre {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <img src="https://geea.com.br/imagem/trevo.png" alt="Trevo da Escola" />
            <h2>ESCOLA DE APRENDIZES DO EVANGELHO</h2>
          </div>
          ${conteudos.map((c, i) => `
            <div class="nota">
              
              <pre>${c}</pre>
            </div>
          `).join('')}
        </body>
      </html>`;

      try {
        const tempWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
        await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlUnico)}`);
        const pdf = await tempWin.webContents.printToPDF({});
        await tempWin.close();

        anexos.push({
          filename: 'Notas_EAE_Unificado.pdf',
          content: pdf,
          contentType: 'application/pdf'
        });

        console.log('✅ PDF único gerado com sucesso.');
      } catch (erro) {
        console.error('❌ Erro ao gerar PDF único:', erro);
      }

    } else {
      for (let i = 0; i < conteudos.length; i++) {
        const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 2rem; background-color: #fff; }
              .cabecalho {
                text-align: center;
                margin-bottom: 2rem;
              }
              .cabecalho img {
                max-width: 80px;
              }
              .cabecalho h2 {
                margin-top: 10px;
              }
              .nota {
                margin-bottom: 2rem;
                padding: 1rem;
                border: 1px solid #ccc;
                border-radius: 8px;
              }
              .nota pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <div class="cabecalho">
              <img src="https://geea.com.br/imagem/trevo.png" alt="Trevo da Escola" style="width: 100px; margin-bottom: 10px;" />
              <h2>ESCOLA DE APRENDIZES DO EVANGELHO</h2>
            </div>
            <div class="nota">
              <pre>${c.replace(nomes[i], '').trimStart()}</pre>
            </div>
          </body>
        </html>`;

        try {
          const tempWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
          await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
          const pdf = await tempWin.webContents.printToPDF({});
          await tempWin.close();

          anexos.push({
            filename: nomes[i].replace(/\.[^/.]+$/, ".pdf"),
            content: pdf,
            contentType: 'application/pdf'
          });

          console.log(`✅ PDF individual gerado: ${nomes[i]}`);
        } catch (erro) {
          console.error(`❌ Erro ao gerar PDF da nota ${nomes[i]}:`, erro);
        }
      }
    }

    return anexos; // ✅ Retorno obrigatório
  });
}

module.exports = { registrarGerarPdfAnexosEmailHandler };
