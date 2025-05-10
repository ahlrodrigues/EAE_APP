require('dotenv').config();
const nodemailer = require('nodemailer');

async function enviarEmailComNotas(destinatario, nomeAluno, anexos, nomeDirigente = 'Dirigente') {
  if (!destinatario) throw new Error("E-mail do dirigente não informado.");

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("GMAIL_USER ou GMAIL_PASS não definidos no .env");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://geea.com.br/imagem/trevo.png" alt="Logo Trevo" style="width: 100px; margin-bottom: 10px;" />
        <h2 style="margin: 0; color: #0077cc;">Escola de Aprendizes do Evangelho</h2>
      </div>
      <p>Olá, <strong>${nomeDirigente}</strong>!</p>
      <p>Segue em anexo as notas selecionadas do aluno <strong>${nomeAluno}</strong>.</p>
      <p style="margin-top: 2rem;">Fraternalmente,</p>
      <p><em>Equipe EAE</em></p>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />
      <p style="font-size: 0.85rem; color: #777; text-align: center;">Este é um e-mail automático. Por favor, não responda.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"EAE" <${process.env.GMAIL_USER}>`,
    to: destinatario,
    subject: `Notas do aluno ${nomeAluno}`,
    html: htmlContent,
    attachments: anexos
  });
}

module.exports = { enviarEmailComNotas };
