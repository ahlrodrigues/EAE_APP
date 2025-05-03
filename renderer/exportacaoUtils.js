const { BrowserWindow } = require('electron');

/**
 * Gera HTML de exportação para um ou múltiplos conteúdos.
 * 
 * @param {string[]} conteudos - Lista de conteúdos das notas já descriptografados
 * @param {string[]} nomes - Lista de nomes das notas
 * @param {string} tipo - 'unico' ou 'separado'
 * 
 * @returns {string | string[]} - HTML único ou array de HTMLs
 */

function gerarHtmlExportacao(conteudos, nomes, tipo) {
  if (tipo === 'unico') {
    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h3 { color: #0077cc; }
            .nota-cartao {
              border: 1px solid #ccc;
              border-radius: 8px;
              margin: 2rem 0;
              padding: 1.2rem;
              background: #f9f9f9;
              page-break-inside: avoid;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              font-size: 1rem;
            }
          </style>
        </head>
        <body>
          ${conteudos.map((c, i) => `<div class="nota-cartao"><h3>${nomes[i]}</h3><pre>${c}</pre></div>`).join('<div style="page-break-after: always;"></div>')}
        </body>
      </html>
    `;
  } else {
    return conteudos.map((c, i) => `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h3 { color: #0077cc; }
            .nota-cartao {
              border: 1px solid #ccc;
              border-radius: 8px;
              margin: 2rem 0;
              padding: 1.2rem;
              background: #f9f9f9;
              page-break-inside: avoid;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              font-size: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="nota-cartao">
            <h3>${nomes[i]}</h3>
            <pre>${c}</pre>
          </div>
        </body>
      </html>
    `);
  }
}

async function gerarPdfBuffer(html) {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pdf = await win.webContents.printToPDF({});
  await win.close();
  return pdf;
}

module.exports = {
  gerarHtmlExportacao,
  gerarPdfBuffer
};
