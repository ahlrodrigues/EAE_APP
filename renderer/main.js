
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
require("dotenv").config();

function encrypt(text) {
  const ENCRYPTION_KEY = process.env.CRYPTO_SECRET.padEnd(32, "0");
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return IV.toString("hex") + ":" + encrypted;
}

ipcMain.handle("salvar-nota-criptografada", async (event, { nomeArquivo, conteudo }) => {
  try {
    const dirNotas = path.join(os.homedir(), ".config", "escola-aprendizes-final", "notas");
    if (!fs.existsSync(dirNotas)) {
      fs.mkdirSync(dirNotas, { recursive: true });
      console.log("📁 Pasta de notas criada:", dirNotas);
    }

    if (!nomeArquivo || !conteudo) throw new Error("Dados inválidos.");

    const caminho = path.join(dirNotas, nomeArquivo);
    const criptografado = encrypt(conteudo);
    console.log("✏️ Salvando nota em:", caminho);
    fs.writeFileSync(caminho, criptografado, "utf-8");

    return { sucesso: true };
  } catch (erro) {
    console.error("❌ Erro ao salvar nota:", erro.message);
    return { sucesso: false, erro: erro.message };
  }
});

ipcMain.handle("obter-nome-aluno", async () => {
  try {
    const userDataPath = path.join(os.homedir(), ".config", "escola-aprendizes-final");
    const configPath = path.join(userDataPath, "config", "usuario.json");

    if (!fs.existsSync(configPath)) return null;

    const conteudo = fs.readFileSync(configPath, "utf-8");
    const dados = JSON.parse(conteudo);

    return dados.aluno || null;
  } catch {
    return null;
  }
});
