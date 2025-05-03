const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { BrowserWindow } = require('electron');
const { getUserDataPath } = require('../config/paths');

function registrarEmailHandlers(ipcMain) {
  ipcMain.handle('enviar-token', async (event, token) => {
    const filePath = path.join(getUserDataPath(), 'usuario.json');
    const dados = JSON.parse(fs.readFileSync(filePath));
    const emailDestino = dados.email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_REMETENTE,
        pass: process.env.SENHA_REMETENTE
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_REMETENTE,
      to: emailDestino,
      subject: 'Token de redefinição de senha',
      text: `Seu token é: ${token}`
    };

    await transporter.sendMail(mailOptions);
  });

  ipcMain.handle('enviar-email-dirigente', async (event, { para, assunto, corpo, anexos, confirmarLeitura }) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_REMETENTE,
      to: para,
      subject: assunto,
      html: corpo,
      attachments: anexos,
      headers: {
        'Disposition-Notification-To': confirmarLeitura
      }
    };

    await transporter.sendMail(mailOptions);
  });



  async function gerarPdfBuffer(html) {
    const win = new BrowserWindow({ show: false });
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const pdf = await win.webContents.printToPDF({});
    win.destroy();
    return pdf;
  }
}

module.exports = { registrarEmailHandlers };
