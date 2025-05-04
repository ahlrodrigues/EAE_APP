const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const { getUserDataPath } = require('../config/paths');
const { gerarCorpoEmailDirigente, gerarCorpoEmailAluno } = require('../shared/emailTemplates.js');

function registrarEmailHandlers(ipcMain) {
  ipcMain.handle('enviar-token', async (event, token) => {
    const filePath = path.join(getUserDataPath(), 'usuario.json');
    const dados = JSON.parse(fs.readFileSync(filePath));
    
    const transporter = criarTransportador();

    await transporter.sendMail({
      from: 'Escola de Aprendizes <nao-responder@geea.com.br>',
      to: dados.email,
      subject: 'Token de redefinição de senha',
      text: `Seu token é: ${token}`
    });
  });

  ipcMain.handle('enviar-email-dirigente', async (event, { para, assunto, corpo, anexos, confirmarLeitura }) => {
    const transporter = criarTransportador();
    console.log("📧 HTML do corpo do e-mail:\n", corpo);
    await transporter.sendMail({
      from: 'Escola de Aprendizes <nao-responder@geea.com.br>',
      to: para,
      subject: assunto,
      html: corpo,
      attachments: anexos,
      headers: {
        'Disposition-Notification-To': confirmarLeitura || undefined
      }
    });
  });
}

function criarTransportador() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
}

module.exports = { registrarEmailHandlers };
