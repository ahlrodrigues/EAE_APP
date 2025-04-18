const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadFile('pages/login.html');
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

// Caminho para salvar os dados
const configPath = path.join(app.getPath('userData'), 'config');
const filePath = path.join(configPath, 'usuario.json');

// Handler: salvar cadastro
ipcMain.handle('salvar-dados-cadastro', async (event, dados) => {
  try {
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);
    const dadosASalvar = { ...dados, senha: senhaCriptografada };
    fs.writeFileSync(filePath, JSON.stringify(dadosASalvar, null, 2), 'utf-8');

    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
});

// Handler: login
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

// Handler: solicitar token (placeholder)
ipcMain.handle('solicitar-token', async (event, email) => {
  return { sucesso: true }; // Simulado
});

// Handler: redefinir senha (placeholder)
ipcMain.handle('redefinir-senha', async (event, token, novaSenha) => {
  return { sucesso: true }; // Simulado
});
