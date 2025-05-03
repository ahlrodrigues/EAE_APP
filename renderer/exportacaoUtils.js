// exportacaoUtils.js
const { BrowserWindow } = require('electron');

async function gerarHtmlExportacao(conteudos, nomes) {
  return conteudos.map((conteudo, i) => {
    const nome = nomes[i] || `Nota_${i + 1}`;
    return `
      <div style="page-break-after: always; padding: 1rem; font-family: Arial, sans-serif;">
        <h2 style="margin-bottom: 0.5rem;">${nome}</h2>
        <pre style="white-space: pre-wrap; word-wrap: break-word; background: #f5f5f5; padding: 1rem; border-radius: 8px;">
${conteudo}
        </pre>
      </div>
    `;
  }).join('');
}

async function gerarPdfBuffer(html) {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pdf = await win.webContents.printToPDF({});
  win.destroy();
  return pdf;
}

module.exports = {
  gerarHtmlExportacao,
  gerarPdfBuffer
};
