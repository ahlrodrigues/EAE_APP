const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { getUserDataPath } = require('../config/paths');
const { gerarHtmlExportacao, gerarPdfBuffer } = require('../renderer/exportacaoUtils');

function registrarEmailHandlers(ipcMain) {
  ipcMain.handle('enviar-token', async (event, token) => {
    const filePath = path.join(getUserDataPath(), 'usuario.json');
    const dados = JSON.parse(fs.readFileSync(filePath));
    const emailDestino = dados.email;

    const transporter = criarTransportador();
    const mailOptions = {
      from: process.env.EMAIL_REMETENTE,
      to: emailDestino,
      subject: 'Token de redefinição de senha',
      text: `Seu token é: ${token}`
    };

    await transporter.sendMail(mailOptions);
  });

  ipcMain.handle('enviar-email-dirigente', async (event, { para, assunto, corpo, anexos, confirmarLeitura }) => {
    const transporter = criarTransportador();
    const mailOptions = {
      from: process.env.EMAIL_REMETENTE,
      to: para,
      subject: assunto,
      text: corpo,
      attachments: anexos,
      headers: {
        'Disposition-Notification-To': confirmarLeitura
      }
    };

    await transporter.sendMail(mailOptions);
  });

  

  function criarTransportador() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }
}

module.exports = { registrarEmailHandlers };
