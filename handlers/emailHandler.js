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
        user: process.env.EMAIL_REMETENTE,
        pass: process.env.SENHA_REMETENTE
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_REMETENTE,
      to: para,
      subject,
      html: corpo,
      attachments: anexos,
      headers: {
        'Disposition-Notification-To': confirmarLeitura
      }
    };

    await transporter.sendMail(mailOptions);
  });

  ipcMain.handle('gerar-pdf-anexos-email', async (event, conteudos, nomes, tipo) => {
    const anexos = [];

    if (tipo === 'unico') {
      const htmlUnico = conteudos.map((c, i) => `<div><h3>${nomes[i]}</h3><div>${c}</div></div>`).join('<hr>');
      const pdf = await gerarPdfBuffer(htmlUnico);
      anexos.push({
        filename: `Notas_${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdf,
      });
    } else {
      for (let i = 0; i < conteudos.length; i++) {
        const pdf = await gerarPdfBuffer(conteudos[i]);
        anexos.push({
          filename: `${nomes[i].replace('.txt', '')}.pdf`,
          content: pdf,
        });
      }
    }

    return anexos;
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
