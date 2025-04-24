require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const os = require("os");

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadFile('pages/login.html');
  mainWindow.webContents.openDevTools(); // Apenas para debug temporário

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const configPath = path.join(app.getPath('userData'), 'config');
const filePath = path.join(configPath, 'usuario.json');
const arquivoUsuario = path.join(configPath, "usuario.json");


// 🛠️ Cria a pasta config se ela não existir
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath, { recursive: true });
}

ipcMain.handle("salvar-dados-cadastro", async (event, dadosRecebidos) => {
  try {
    const userDataPath = app.getPath("userData");
    const configPath = path.join(userDataPath, "config");

    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }

    const arquivoUsuario = path.join(configPath, "usuario.json");

    // 🔐 Criptografar a senha recebida
    const bcrypt = require("bcryptjs");
    const senhaCriptografada = bcrypt.hashSync(dadosRecebidos.senha, 10);

    // ✅ Declarar a variável 'dados' corretamente
    const dados = {
      casaEspírita: dadosRecebidos.casaEspírita,
      numeroTurma: dadosRecebidos.numeroTurma,
      dirigente: dadosRecebidos.dirigente,
      secretarios: dadosRecebidos.secretarios,
      aluno: dadosRecebidos.aluno,
      email: dadosRecebidos.email,
      senha: senhaCriptografada
      // confirmarSenha não incluído
    };

    fs.writeFileSync(arquivoUsuario, JSON.stringify(dados, null, 2));

    return { sucesso: true };
  } catch (erro) {
    console.error("❌ Erro ao salvar cadastro:", erro);
    return { sucesso: false, erro: "Erro ao salvar os dados." };
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

ipcMain.handle("salvar-nota", async (event, { titulo, conteudo }) => {
  try {
    const dirNotas = path.join(os.homedir(), '.config', 'escola-aprendizes-final', 'notas');
    if (!fs.existsSync(dirNotas)) {
      fs.mkdirSync(dirNotas, { recursive: true });
    }

    const nomeArquivo = `${titulo.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const caminho = path.join(dirNotas, nomeArquivo);

    fs.writeFileSync(caminho, conteudo, 'utf-8');

    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
});


ipcMain.handle('fazer-login', async (event, email, senha) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { sucesso: false, erro: 'Nenhum usuário cadastrado.' };
    }

    const dados = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const senhaConfere = await bcrypt.compare(senha, dados.senha);

    if (email === dados.email && senhaConfere) {
      return { sucesso: true };
    } else {
      return { sucesso: false };
    }
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
});


const userDataPath = app.getPath("userData");

ipcMain.handle("solicitar-token", async (event, email) => {
  try {
    const filePath = path.join(userDataPath, "config", "usuario.json");

    if (!fs.existsSync(filePath)) {
      return { sucesso: false, erro: "Usuário não encontrado." };
    }

    const dados = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (dados.email !== email) {
      return { sucesso: false, erro: "E-mail não cadastrado." };
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracao = Date.now() + 1000 * 60 * 10; // 10 minutos

    dados.tokenRedefinicao = token;
    dados.expiracaoToken = expiracao;

    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

  const mailOptions = {
    from: `"Escola de Aprendizes" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Token de redefinição de senha',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 2rem; border-radius: 10px; color: #333; text-align: center;">
        <img src="https://siagutatemp.wordpress.com/wp-content/uploads/2015/05/9e10b-trevo.png" alt="Logo Trevo" style="max-width: 80px; margin-bottom: 1rem;" />
        <h1 style="color: #0077cc;">ESCOLA DE APRENDIZES DO EVANGELHO</h1>
        <p style="font-size: 1.1rem;">Você solicitou um token para redefinir sua senha.</p>
        <p style="margin-top: 1rem;">Use o código abaixo:</p>
        <div style="font-size: 2rem; font-weight: bold; color: #007700; margin: 1rem auto;">${token}</div>
        <p style="font-size: 0.9rem; color: #777;">Este token é válido por tempo limitado.</p>
      
        <hr style="margin-top: 2rem; border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 0.8rem; color: #999; margin-top: 1rem;">
          Escola de Aprendizes do Evangelho · 2023–2025 · Versão 1.0<br/>
          Esta mensagem foi gerada automaticamente. Não responda este e-mail.
        </p>
      </div>
    `

  };

  await transporter.sendMail(mailOptions);

  return { sucesso: true };
} catch (erro) {
  console.error("Erro ao enviar token:", erro);
  return { sucesso: false, erro: "Erro ao enviar o token." };
}
});

function encrypt(text) {
  const ENCRYPTION_KEY = process.env.CRYPTO_SECRET.padEnd(32, "0"); // 32 bytes
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
    }

    if (!nomeArquivo || !conteudo) {
      throw new Error("Dados inválidos.");
    }

    const caminho = path.join(dirNotas, nomeArquivo);
    const criptografado = encrypt(conteudo);
    fs.writeFileSync(caminho, criptografado, "utf-8");

    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
});



ipcMain.handle("redefinir-senha", async (event, token, novaSenha) => {
  console.log("🛠️ Redefinição de senha iniciada");
  console.log("📨 Token recebido:", token);
  console.log("🔐 Nova senha recebida:", novaSenha);

  try {
    const configPath = path.join(userDataPath, "config", "usuario.json");
    console.log("📁 Caminho do arquivo JSON:", configPath);

    if (!fs.existsSync(configPath)) {
      console.warn("❌ Arquivo usuario.json não encontrado.");
      return { sucesso: false, erro: "Arquivo de usuário não encontrado." };
    }

    const conteudo = fs.readFileSync(configPath, "utf-8");
    console.log("📄 Conteúdo carregado:", conteudo);

    const dados = JSON.parse(conteudo);
    console.log("🧠 JSON analisado:", dados);

    if (!dados.tokenRedefinicao) {
      console.warn("❌ Campo 'tokenRedefinicao' ausente.");
      return { sucesso: false, erro: "Token não solicitado." };
    }

    if (dados.tokenRedefinicao !== token) {
      console.warn("❌ Token inválido.");
      return { sucesso: false, erro: "Token inválido ou expirado." };
    }

    if (Date.now() > dados.expiracaoToken) {
      console.warn("⚠️ Token expirado.");
      return { sucesso: false, erro: "Token expirado." };
    }

    const senhaCriptografada = bcrypt.hashSync(novaSenha, 10);
    dados.senha = senhaCriptografada;

    delete dados.tokenRedefinicao;
    delete dados.expiracaoToken;

    fs.writeFileSync(configPath, JSON.stringify(dados, null, 2));
    console.log("✅ Senha redefinida e arquivo salvo.");

    return { sucesso: true };
  } catch (erro) {
    console.error("❌ Erro ao redefinir senha:", erro);
    return { sucesso: false, erro: "Erro interno ao redefinir a senha." };
  }
});

