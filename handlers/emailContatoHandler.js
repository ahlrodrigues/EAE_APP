const { ipcMain } = require('electron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

const emailDesenvolvedor = process.env.GMAIL_USER;

function setupEmailContatoHandler() {
  ipcMain.handle('enviarEmailContato', async (event, assunto, mensagemUser) => {
    try {
      const usuarioPath = path.join(
        os.homedir(),
        '.config',
        'escola-aprendizes-final',
        'config',
        'usuario.json'
      );

      console.log('Verificando arquivo em:', usuarioPath);

      if (!fs.existsSync(usuarioPath)) {
        throw new Error('Cadastro não encontrado. Redirecionando para tela de cadastro...');
      }

      const dadosCrus = fs.readFileSync(usuarioPath, 'utf-8');
      console.log('Conteúdo bruto do usuario.json:', dadosCrus);

      let dadosUsuario;
      try {
        dadosUsuario = JSON.parse(dadosCrus); // ou descriptografar se necessário
      } catch (err) {
        throw new Error('Erro ao ler os dados do usuário. Verifique se o cadastro está correto.');
      }

      const corpoEmail = `
Mensagem enviada pelo app:

Assunto: ${assunto}

Mensagem:
${mensagemUser}

--- Dados do Usuário ---
Nome: ${dadosUsuario.aluno || 'Não informado'}
Email: ${dadosUsuario.email || 'Não informado'}
-------------------------
      `;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Contato EAE App" <${process.env.GMAIL_USER}>`,
        to: emailDesenvolvedor,
        subject: `Contato: ${assunto}`,
        text: corpoEmail
      });

      return 'Mensagem enviada com sucesso!';
    } catch (error) {
      console.error('Erro ao enviar e-mail de contato:', error);
      throw error;
    }
  });
}

module.exports = setupEmailContatoHandler;
