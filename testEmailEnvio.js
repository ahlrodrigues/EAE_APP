import nodemailer from 'nodemailer';

const aluno = "Maria Helena";
const email = "maria@email.com";
const ip = "123.45.67.89";
const horario = new Date().toLocaleString('pt-BR');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

const transporter = nodemailer.createTransport({
    service: 'gmail',
  auth: {
    user: 'eae.cpct@gmail.com',
    pass: 'vjue bdjz lpwt gmca'
  }
});

const mailOptions = {
  from: '"Escola de Aprendizes" <no-reply@seuprojeto.com>',
  to: email,
  subject: `📬 Confirmação de leitura das suas anotações`,
  html: `
    <p>Olá <strong>${aluno}</strong>,</p>
    <p>Seu dirigente abriu o e-mail com suas anotações.</p>
    <ul>
      <li><strong>Horário:</strong> ${horario}</li>
      <li><strong>IP:</strong> ${ip}</li>
      <li><strong>Navegador:</strong> ${userAgent}</li>
    </ul>
    <p>Esta é uma confirmação automática de leitura.</p>
  `
};

transporter.sendMail(mailOptions)
  .then(info => console.log("✅ E-mail enviado:", info.messageId))
  .catch(err => console.error("❌ Falha no envio:", err));
