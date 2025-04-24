// main.js — versão final com criptografia de todos os dados do usuario.json
console.log("✅ main.js correto carregado em", new Date().toLocaleString());

// main.js — versão final com criptografia de todos os dados do usuario.json

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { redefinirSenha } = require("./lib/redefinirSenha");

const userDataPath = path.join(app.getPath("home"), ".config", "escola-aprendizes-final");
const usuarioPath = path.join(userDataPath, "config", "usuario.json");
const notasPath = path.join(userDataPath, "notas");

function criptografarCampo(texto, chave) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(chave).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(texto, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("base64")}:${encrypted.toString("base64")}`;
}

ipcMain.handle("salvar-cadastro", async (event, dados) => {
  try {
    const pastaConfig = path.dirname(usuarioPath);
    if (!fs.existsSync(pastaConfig)) {
      fs.mkdirSync(pastaConfig, { recursive: true });
    }

    const chave = dados.senha;
    const dadosCriptografados = {
      casaEspírita: criptografarCampo(dados.casaEspírita, chave),
      numeroTurma: criptografarCampo(dados.numeroTurma, chave),
      dirigente: criptografarCampo(dados.dirigente, chave),
      secretarios: criptografarCampo(dados.secretarios, chave),
      aluno: criptografarCampo(dados.aluno, chave),
      email: criptografarCampo(dados.email, chave),
      senha: bcrypt.hashSync(chave, 10)
    };

    console.log("🛡️ VERIFICAÇÃO - Dados criptografados:");
    console.log(JSON.stringify(dadosCriptografados, null, 2));
    fs.writeFileSync(usuarioPath, JSON.stringify(dadosCriptografados, null, 2), "utf-8");
    console.log("✅ usuario.json salvo com campos criptografados.");
    return true;
  } catch (err) {
    console.error("Erro ao salvar cadastro:", err);
    return false;
  }
});

ipcMain.handle("armazenar-senha", async (event, senhaPura) => {
  global.senhaDescriptografia = senhaPura;
  return true;
});

ipcMain.handle("listar-notas", async () => {
  try {
    if (!fs.existsSync(notasPath)) return [];
    return fs.readdirSync(notasPath).filter(nome => nome.endsWith(".txt"));
  } catch (err) {
    console.error("Erro ao listar notas:", err);
    return [];
  }
});

ipcMain.handle("ler-nota", async (event, nomeArquivo) => {
  try {
    if (!global.senhaDescriptografia) {
      throw new Error("Senha de descriptografia não está definida.");
    }
    const caminho = path.join(notasPath, nomeArquivo);
    const conteudoCriptografado = fs.readFileSync(caminho, "utf-8");
    return descriptografarNota(conteudoCriptografado, global.senhaDescriptografia);
  } catch (err) {
    console.error("Erro ao ler nota:", err);
    return "Erro ao carregar nota.";
  }
});

function descriptografarNota(textoCriptografado, senha) {
  try {
    const [ivBase64, conteudoBase64] = textoCriptografado.split(":");
    const iv = Buffer.from(ivBase64, "base64");
    const encryptedText = Buffer.from(conteudoBase64, "base64");
    const chave = crypto.createHash("sha256").update(senha).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", chave, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    console.error("Erro ao descriptografar:", e.message);
    return "Erro ao descriptografar a nota.";
  }
}

ipcMain.handle("redefinir-senha", async (event, tokenOuSenhaAntiga, novaSenha) => {
  try {
    redefinirSenha(tokenOuSenhaAntiga, novaSenha);
    global.senhaDescriptografia = novaSenha;
    return true;
  } catch (err) {
    console.error("Erro redefinindo senha:", err.message);
    return false;
  }
});

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  mainWindow.loadFile("pages/login.html");
}

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

