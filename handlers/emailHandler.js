// handlers/emailHandler.js

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
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
}

module.exports = { registrarEmailHandlers };
