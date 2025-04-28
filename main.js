const { app, BrowserWindow, ipcMain, dialog } = require("electron");
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


ipcMain.handle("ler-usuario", async () => {
  try {
    if (!global.senhaDescriptografia) {
      console.warn("⚠️ Senha não disponível em memória.");
      throw new Error("Senha não está disponível em memória.");
    }

    if (!fs.existsSync(usuarioPath)) {
      console.warn("⚠️ usuario.json não encontrado.");
      return null;
    }

    const raw = fs.readFileSync(usuarioPath, "utf-8");
    const dadosCriptografados = JSON.parse(raw);

    const usuario = {
      casaEspírita: descriptografarCampo(dadosCriptografados.casaEspírita, global.senhaDescriptografia),
      numeroTurma: descriptografarCampo(dadosCriptografados.numeroTurma, global.senhaDescriptografia),
      dirigente: descriptografarCampo(dadosCriptografados.dirigente, global.senhaDescriptografia),
      secretarios: descriptografarCampo(dadosCriptografados.secretarios, global.senhaDescriptografia),
      aluno: descriptografarCampo(dadosCriptografados.aluno, global.senhaDescriptografia),
      email: descriptografarCampo(dadosCriptografados.email, global.senhaDescriptografia),
      senha: dadosCriptografados.senha
    };

    return usuario;
  } catch (err) {
    console.error("❌ Erro ao descriptografar usuario.json:", err.message);
    return null;
  }
});

ipcMain.handle("validar-senha-hash", async (event, senhaDigitada, hashSalvo) => {
  try {
    return bcrypt.compareSync(senhaDigitada, hashSalvo);
  } catch (err) {
    console.error("Erro ao validar hash da senha:", err);
    return false;
  }
});


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
      emailDirigente: criptografarCampo(dados.emailDirigente, chave),
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
  const notasPath = path.join(app.getPath("home"), ".config", "escola-aprendizes-final", "notas");
  try {
    if (!fs.existsSync(notasPath)) return [];
    return fs.readdirSync(notasPath).filter(nome => nome.endsWith(".txt"));
  } catch (err) {
    console.error("Erro ao listar notas:", err);
    return [];
  }
});

ipcMain.handle('gerar-pdf-unico', async (event, html, nomeArquivoPersonalizado) => {
  const tempWin = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  await tempWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pdfBuffer = await tempWin.webContents.printToPDF({});

  const anotacoesPath = garantirPastaAnotacoes();
  const pdfPath = path.join(anotacoesPath, nomeArquivoPersonalizado || `Notas_EAE_${Date.now()}.pdf`);

  fs.writeFileSync(pdfPath, pdfBuffer);

  await tempWin.destroy();
});

const algorithm = 'aes-256-cbc'; // Algoritmo de criptografia

ipcMain.handle('obter-nome-aluno', async (event) => {
  try {
    const userPath = path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'usuario.json');

    if (!fs.existsSync(userPath)) {
      throw new Error('Cadastro não encontrado. Favor realizar novo cadastro.');
    }

    const encryptedData = fs.readFileSync(userPath);

    const senha = global.senhaUsuario; // <- precisa estar carregada antes
    if (!senha) {
      throw new Error('Senha de descriptografia não encontrada em memória.');
    }

    const key = crypto.createHash('sha256').update(senha).digest();
    const iv = Buffer.alloc(16, 0); // cuidado: só use IV zerado se a criptografia também usou

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, null, 'utf8');
    decrypted += decipher.final('utf8');

    const dados = JSON.parse(decrypted);

    return dados.aluno || null;
  } catch (error) {
    console.error('Erro ao obter nome do aluno:', error);

    throw new Error(error.message || "Erro desconhecido ao obter nome do aluno.");
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

ipcMain.handle("salvar-nota", async (event, nomeArquivo, conteudo) => {
  try {
    if (!global.senhaDescriptografia) {
      throw new Error("Senha não disponível.");
    }

    const iv = crypto.randomBytes(16);
    const key = crypto.createHash("sha256").update(global.senhaDescriptografia).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(conteudo, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const finalContent = `${iv.toString("base64")}:${encrypted.toString("base64")}`;

    const filePath = path.join(notasPath, nomeArquivo);
    fs.writeFileSync(filePath, finalContent, "utf-8");
    return true;
  } catch (err) {
    console.error("Erro ao salvar nota criptografada:", err);
    return false;
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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
