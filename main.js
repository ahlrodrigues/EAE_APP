console.log("MAIN.JS - Aplicação iniciando...");
console.log("🧠 main.js ATIVO! Caminho:", __filename);
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// 📁 Caminhos principais
const userDataPath = path.join(app.getPath("home"), ".config", "escola-aprendizes-final");
const configPath = path.join(userDataPath, "config");
const usuarioPath = path.join(configPath, "usuario.json");
const notasPath = path.join(userDataPath, "notas");

// 🔁 Handlers
const { registrarHandlers } = require('./handlers');
const setupEmailContatoHandler = require('./handlers/emailContatoHandler');
setupEmailContatoHandler();

const { criptografar, descriptografar } = require('./lib/crypto');
const { redefinirSenha } = require('./lib/redefinirSenha');
const { validarTokenDigitado } = require('./lib/validarToken');

// 🔐 Armazenamento temporário da senha de descriptografia
let senhaCriptografia = null;
ipcMain.on('set-senha-criptografia', (_, senha) => { senhaCriptografia = senha; 
console.log("🟢 senhaCriptografia armazenada no main:", senha);});
ipcMain.handle('get-senha-criptografia', () => senhaCriptografia);

// 🪪 Senha para criptografar notas
ipcMain.handle("armazenar-senha", async (_, senhaPura) => {
  global.senhaDescriptografia = senhaPura;
  console.log("🔐 Senha salva em global.senhaDescriptografia");
  return true;
});

// Declarando as funcçõe dos modulos
ipcMain.handle("criptografar", async (_, texto, senha) => criptografar(texto, senha));


ipcMain.handle('descriptografar', async (_, texto, senha) => {
  return descriptografar(texto, senha);
});

// 👤 Usuário
ipcMain.handle("ler-usuario", async () => {
  try {
    if (!fs.existsSync(usuarioPath)) return null;
    const raw = fs.readFileSync(usuarioPath, "utf-8");
    const dadosUsuario = JSON.parse(raw);
    return dadosUsuario;
  } catch (err) {
    console.error("❌ Erro ao carregar usuario.json:", err.message);
    return null;
  }
});

ipcMain.handle('obter-nome-aluno', async () => {
  try {
    const cadastroJson = fs.readFileSync(usuarioPath, 'utf8');
    return JSON.parse(cadastroJson).aluno;
  } catch (error) {
    console.error('Erro ao obter nome do aluno:', error);
    throw new Error('Cadastro não encontrado.');
  }
});

ipcMain.handle('redefinir-senha', async (_, tokenDigitado, novaSenha) => {
  try {
    console.log('🔵 Iniciando redefinição de senha...');
    await validarTokenDigitado(tokenDigitado);
    console.log('✅ Token validado.');

    if (!fs.existsSync(usuarioPath)) throw new Error('Arquivo usuario.json não encontrado.');

    const usuario = JSON.parse(fs.readFileSync(usuarioPath, 'utf8'));
    usuario.senha = await bcrypt.hash(novaSenha, 10);
    fs.writeFileSync(usuarioPath, JSON.stringify(usuario, null, 2), 'utf8');
    global.senhaDescriptografia = novaSenha;
    console.log('✅ usuario.json atualizado com nova senha.');

    return { sucesso: true };
  } catch (err) {
    console.error('❌ Erro redefinindo senha:', err.message);
    return { sucesso: false, mensagem: err.message };
  }
});

// 📝 Notas
ipcMain.handle("excluir-nota", async (_, nomeArquivo) => {
  try {
    const filePath = path.join(notasPath, nomeArquivo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return true;
  } catch (err) {
    console.error("Erro ao excluir nota:", err);
    return false;
  }
});

ipcMain.handle('exportar-notas', async (_, conteudoHTML, nomeArquivo = 'Notas_EAE.pdf') => {
  const tempWin = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(conteudoHTML)}`);
  const pdfData = await tempWin.webContents.printToPDF({});
  const pasta = path.join(app.getPath('downloads'), 'Anotações_EAE');
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  const caminhoFinal = path.join(pasta, nomeArquivo);
  fs.writeFileSync(caminhoFinal, pdfData);
  tempWin.destroy();
  return caminhoFinal;
});


const listarNotas = require('./renderer/listarNotas'); // CommonJS

function createWindow() {
  if (!fs.existsSync(configPath)) fs.mkdirSync(configPath, { recursive: true });

  mainWindow = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, 'assets', 'trevo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();
  mainWindow.show();

let notaWin = null;

  if (notaWin) {
    notaWin.webContents.once('did-finish-load', () => {
      notaWin.webContents.send('dados-da-nota', {
        conteudo,
        senha
      });
    });
  }
  

  // Decide qual página inicial carregar
  if (fs.existsSync(usuarioPath)) {
    try {
      const conteudo = fs.readFileSync(usuarioPath, 'utf8');
      JSON.parse(conteudo); // testa JSON válido
      mainWindow.loadFile(path.join(__dirname, 'pages', 'login.html'));
    } catch (err) {
      console.error('Erro no usuario.json, resetando:', err);
      fs.writeFileSync(usuarioPath, '{}', 'utf8');
      mainWindow.loadFile(path.join(__dirname, 'pages', 'cadastro.html'));
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, 'pages', 'cadastro.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// 🚀 Inicialização do app
app.whenReady().then(() => {
  console.log("MAIN.JS - App está pronto!");
  createWindow();
  console.log("MAIN.JS - Chamando registrarHandlers...");
  registrarHandlers(ipcMain);
});

// 🛑 Fechar o app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
