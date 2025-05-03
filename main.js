const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userDataPath = path.join(app.getPath("home"), ".config", "escola-aprendizes-final");
const usuarioPath = path.join(userDataPath, "config", "usuario.json");
const notasPath = path.join(userDataPath, "notas");

const { registrarHandlers } = require('./handlers');

const { registrarEmailHandlers } = require('./handlers/emailHandler');

require('dotenv').config();

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'pages/login.html')); // ou outro arquivo inicial
}


function criptografarCampo(texto, chave) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(chave).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(texto, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("base64")}:${encrypted.toString("base64")}`;
}

function descriptografarCampo(textoCriptografado, chave) {
  const [ivBase64, conteudoBase64] = textoCriptografado.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const encryptedText = Buffer.from(conteudoBase64, "base64");
  const key = crypto.createHash("sha256").update(chave).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

function garantirPastaAnotacoes() {
  const downloadsPath = app.getPath('downloads');
  const anotacoesPath = path.join(downloadsPath, 'Anotações_EAE');
  if (!fs.existsSync(anotacoesPath)) {
    fs.mkdirSync(anotacoesPath);
  }
  return anotacoesPath;
}


ipcMain.handle("excluir-nota", async (event, nomeArquivo) => {
  try {
    const filePath = path.join(notasPath, nomeArquivo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error("Erro ao excluir nota:", err);
    return false;
  }
});

ipcMain.handle('exportar-notas', async (event, conteudoHTML, nomeArquivo) => {
  const tempWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(conteudoHTML)}`);
  const pdfData = await tempWin.webContents.printToPDF({});

  const downloads = app.getPath('downloads');
  const pasta = path.join(downloads, 'Anotações_EAE');
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

  const caminhoFinal = path.join(pasta, nomeArquivo || 'Notas_EAE.pdf');
  fs.writeFileSync(caminhoFinal, pdfData);
  tempWin.destroy();

  return caminhoFinal;
});


ipcMain.handle("ler-usuario", async () => {
  try {
    if (!fs.existsSync(usuarioPath)) {
      console.warn("⚠️ usuario.json não encontrado.");
      return null;
    }

    const raw = fs.readFileSync(usuarioPath, "utf-8");
    const dadosUsuario = JSON.parse(raw);

    const usuario = {
      casaEspírita: dadosUsuario.casaEspírita,
      numeroTurma: dadosUsuario.numeroTurma,
      dirigente: dadosUsuario.dirigente,
      secretarios: dadosUsuario.secretarios,
      aluno: dadosUsuario.aluno,
      email: dadosUsuario.email,
      senha: dadosUsuario.senha // bcrypt hash
    };

    return usuario;
  } catch (err) {
    console.error("❌ Erro ao carregar usuario.json:", err.message);
    return null;
  }
});


ipcMain.handle("armazenar-senha", async (event, senhaPura) => {
  global.senhaDescriptografia = senhaPura;
  return true;
});



const algorithm = 'aes-256-cbc'; // Algoritmo de criptografia

ipcMain.handle('obter-nome-aluno', async () => {
  try {
    const caminhoCadastro = path.join(userDataPath, 'config', 'usuario.json');
    const cadastroJson = fs.readFileSync(caminhoCadastro, 'utf8');
    const cadastro = JSON.parse(cadastroJson);
    
    // NÃO descriptografar nada aqui! Só pegar o nome do aluno
    return cadastro.aluno;
  } catch (error) {
    console.error('Erro ao obter nome do aluno:', error);
    throw new Error('Cadastro não encontrado.');
  }
});


const { criptografar, descriptografar, descriptografarNota } = require('./lib/crypto');

ipcMain.handle("descriptografar", async (event, texto, senha) => {
  return descriptografar(texto, senha);
});

ipcMain.handle("criptografar", async (event, texto, senha) => {
  return criptografar(texto, senha);
});

const { redefinirSenha } = require('./lib/redefinirSenha');
const { validarTokenDigitado } = require('./lib/validarToken');

ipcMain.handle('redefinir-senha', async (event, tokenDigitado, novaSenha) => {
  try {
    console.log('🔵 Iniciando redefinição de senha...');

    await validarTokenDigitado(tokenDigitado);
    console.log('✅ Token validado.');

    if (!fs.existsSync(usuarioPath)) {
      throw new Error('Arquivo usuario.json não encontrado.');
    }

    const usuario = JSON.parse(fs.readFileSync(usuarioPath, 'utf8'));

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    usuario.senha = novaSenhaHash;

    fs.writeFileSync(usuarioPath, JSON.stringify(usuario, null, 2), 'utf8');
    console.log('✅ usuario.json atualizado com nova senha.');

    global.senhaDescriptografia = novaSenha;
    console.log('✅ Nova senha atualizada na memória.');

    return { sucesso: true };
  } catch (err) {
    console.error('❌ Erro redefinindo senha:', err.message);
    return { sucesso: false, mensagem: err.message };
  }
});


let mainWindow; // Variável para a janela

function createWindow() {
  // Cria a pasta config se não existir
  const configPath = path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'config');

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }

  const userDataPath = path.join(configPath, 'usuario.json');

  // Criação da janela principal
  mainWindow = new BrowserWindow({
    show: false, // Para maximizar antes de mostrar
    icon: path.join(__dirname, 'assets', 'trevo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.maximize();
  mainWindow.show();

  // Lógica para abrir a página correta
  if (fs.existsSync(userDataPath)) {
    try {
      const conteudo = fs.readFileSync(userDataPath, 'utf8');
      JSON.parse(conteudo); // Testa se o JSON é válido

      // Se o JSON for válido, carrega login.html
      mainWindow.loadFile(path.join(__dirname, 'pages', 'login.html'));
    } catch (error) {
      console.error('Erro no usuario.json, resetando:', error);

      // Se erro no JSON, resetar o arquivo e abrir cadastro.html
      try {
        fs.writeFileSync(userDataPath, '{}', 'utf8');
        console.log('usuario.json resetado.');
      } catch (erroGravacao) {
        console.error('Erro ao resetar usuario.json:', erroGravacao);
      }

      mainWindow.loadFile(path.join(__dirname, 'pages', 'cadastro.html'));
    }
  } else {
    // Se não existir o arquivo usuario.json, abrir cadastro.html
    mainWindow.loadFile(path.join(__dirname, 'pages', 'cadastro.html'));
  }

  // Quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

console.log("MAIN.JS - Aplicação iniciando...");

app.whenReady().then(() => {
  console.log("MAIN.JS - App está pronto!");
  createMainWindow();
  console.log("MAIN.JS - Chamando registrarHandlers...");
  registrarHandlers(ipcMain);
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
const { registrarGerarPdfAnexosEmailHandler } = require('./handlers/gerarPdfAnexosEmailHandler');
registrarGerarPdfAnexosEmailHandler(ipcMain);


