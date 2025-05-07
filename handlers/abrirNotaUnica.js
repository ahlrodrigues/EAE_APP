const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");

// ✅ Mantém a referência global para evitar garbage collection
let notaWin = null;

function registrarAbrirNotaUnicaHandler() {
  ipcMain.handle("abrirNotaUnica", async (_, dados) => {
    if (!dados || !dados.conteudo || !dados.senha) {
      console.error("❌ Dados inválidos recebidos para abrirNotaUnica:", dados);
      throw new Error("Dados inválidos para abrirNotaUnica");
    }

    const { conteudo, senha } = dados;

    // ✅ Cria nova janela para visualização da nota
    notaWin = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "../assets/trevo.png"),
      webPreferences: {
        preload: path.join(__dirname, "../preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    const filePath = path.join(__dirname, "../pages/nota.html");
    console.log("📄 Carregando nota HTML:", filePath);

    await notaWin.loadFile(filePath);

    // ✅ Quando o renderer da nota disser que está pronto, envia os dados
    ipcMain.once("nota-ready", () => {
      console.log("📨 Renderer nota pronto, enviando dados-da-nota...");
      if (notaWin && notaWin.webContents) {
        notaWin.webContents.send("dados-da-nota", { conteudo, senha });
      } else {
        console.warn("⚠️ notaWin ou webContents estão indisponíveis.");
      }
    });

    // ✅ Limpa referência após fechamento da janela
    notaWin.on("closed", () => {
      console.log("🧹 Janela da nota foi fechada.");
      notaWin = null;
    });
  });
}

module.exports = { registrarAbrirNotaUnicaHandler };
