const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const getNotasPath = () => {
  return path.join(app.getPath("home"), ".config", "escola-aprendizes-final", "notas");
};

function registrarNotasHandlers(ipcMain) {
  ipcMain.handle('salvar-nota', async (event, nome, conteudo) => {
    try {
      const notasDir = getNotasPath();
      if (!fs.existsSync(notasDir)) fs.mkdirSync(notasDir, { recursive: true });

      const filePath = path.join(notasDir, nome);
      fs.writeFileSync(filePath, conteudo, "utf-8");

      console.log(`📝 Nota salva com sucesso: ${filePath}`);
      return true;
    } catch (err) {
      console.error("❌ Erro ao salvar nota:", err);
      throw err;
    }
  });
}


function registrarCadastroHandlers(ipcMain) {
  console.log("Registrando salvar-cadastro...");

  ipcMain.handle("salvar-cadastro", async (event, dados) => {
    const pasta = path.join(app.getPath("home"), ".config", "escola-aprendizes-final", "config");
    const arquivo = path.join(pasta, "usuario.json");

    try {
      if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
      }

      const hashSenha = await bcrypt.hash(dados.senha, 10);
      dados.senha = hashSenha;

      fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), "utf-8");
      console.log("✅ Cadastro salvo com senha criptografada.");
      return true;
    } catch (error) {
      console.error("❌ Erro ao salvar cadastro:", error);
      throw error;
    }
  });
}

module.exports = { registrarCadastroHandlers , registrarNotasHandlers };