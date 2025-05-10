import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const { aluno, email } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'desconhecido';
  const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Ignora bots e pré-visualizações
  if (/googlebot|imageproxy|preview/i.test(userAgent)) {
    return res.status(204).end();
  }

  console.log(`📬 E-mail aberto por dirigente. Aluno: ${aluno}, IP: ${ip}, Agente: ${userAgent}, Hora: ${horario}`);

  if (email) {
    await enviarEmailConfirmacao({ aluno, email, ip, userAgent, horario });
  }

  const imgBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+zBNVowAAAABJRU5ErkJggg==',
    'base64'
  );
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Length', imgBuffer.length);
  res.status(200).send(imgBuffer);
}

async function enviarEmailConfirmacao({ aluno, email, ip, userAgent, horario }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.seuprovedor.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
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

  await transporter.sendMail(mailOptions);
}
