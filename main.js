require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

const configPath = path.join(app.getPath('userData'), 'config');
const filePath = path.join(configPath, 'usuario.json');

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

ipcMain.handle('solicitar-token', async (event, email) => {
  const token = crypto.randomBytes(4).toString('hex');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
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

  try {
    await transporter.sendMail(mailOptions);
    return { sucesso: true, token };
  } catch (erro) {
    return { sucesso: false, erro: erro.message };
  }
});

ipcMain.handle('redefinir-senha', async (event, token, novaSenha) => {
  return { sucesso: true }; // implementação futura
});
