const express = require('express');
const bodyParser = require('body-parser');
const { gerarCorpoEmailAluno } = require('../shared/emailTemplates');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

// Rota de confirmação
app.post('/api/enviar-confirmacao', async (req, res) => {
  const { nomeAluno, emailAluno } = req.body;

  if (!nomeAluno || !emailAluno) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  try {
    const corpo = gerarCorpoEmailAluno(nomeAluno, 'pt');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: 'Escola de Aprendizes <nao-responder@geea.com.br>',
      to: emailAluno,
      subject: 'Confirmação de recebimento das anotações',
      html: corpo
    });

    res.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro ao enviar e-mail de confirmação:', erro);
    res.status(500).json({ erro: 'Erro ao enviar e-mail' });
  }
});

app.listen(3333, () => {
  console.log('🚀 Servidor escutando na porta 3333 para confirmação de recebimento');
});
