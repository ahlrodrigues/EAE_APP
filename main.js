const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

ipcMain.handle('validar-senha-hash', async (event, senhaDigitada) => {
  try {
    if (!fs.existsSync(usuarioPath)) {
      throw new Error('Arquivo usuario.json não encontrado.');
    }

    const usuario = JSON.parse(fs.readFileSync(usuarioPath, 'utf8'));
    const senhaHash = usuario.senha;

    const senhaValida = await bcrypt.compare(senhaDigitada, senhaHash);

    if (senhaValida) {
      global.senhaDescriptografia = senhaDigitada;
      console.log('✅ Login (validar-senha-hash): Senha validada com sucesso.');
      return { sucesso: true };
    } else {
      console.warn('❌ Login (validar-senha-hash): Senha incorreta.');
      return { sucesso: false, mensagem: 'Senha incorreta.' };
    }
  } catch (err) {
    console.error('❌ Login (validar-senha-hash): Erro ao validar senha:', err.message);
    return { sucesso: false, mensagem: 'Erro interno ao validar login.' };
  }
});


ipcMain.handle('salvar-cadastro', async (event, dados) => {
  try {
    const pastaConfig = path.dirname(usuarioPath);
    if (!fs.existsSync(pastaConfig)) {
      fs.mkdirSync(pastaConfig, { recursive: true });
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const dadosParaSalvar = {
      casaEspírita: dados.casaEspírita,
      numeroTurma: dados.numeroTurma,
      dirigente: dados.dirigente,
      emailDirigente: dados.emailDirigente,
      secretarios: dados.secretarios,
      aluno: dados.aluno,
      email: dados.email,
      senha: senhaHash
    };

    fs.writeFileSync(usuarioPath, JSON.stringify(dadosParaSalvar, null, 2), 'utf8');
    console.log('✅ usuario.json salvo com campos puros e senha protegida.');
    return true;
  } catch (err) {
    console.error('Erro ao salvar cadastro:', err);
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

const { enviarToken } = require('./lib/enviarToken'); // no topo, junto dos requires

ipcMain.handle('solicitar-token', async (event, emailDestino) => {
  return await enviarToken(emailDestino);
});
