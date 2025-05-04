const { ipcMain, app } = require("electron");
const fs = require("fs");
const path = require("path");;



function registrarCadastroHandlers(ipcMain) {
  console.log("Registrando salvar-cadastro...");
}
ipcMain.handle("salvar-cadastro", async (event, dados) => {
  const pasta = path.join(app.getPath("home"), ".config", "escola-aprendizes-final", "config");
  const arquivo = path.join(pasta, "usuario.json");

  try {
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true });
    }

    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Erro ao salvar usuario.json:", error);
    throw error;
  }
});


module.exports = { registrarCadastroHandlers };
