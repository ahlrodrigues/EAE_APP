require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { app } = require('electron');

async function enviarToken(emailDestino) {
  try {
    const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // Ex: "A1B2C3"
    console.log('🔐 Token gerado:', token);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Escola de Aprendizes" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: 'Seu Token para Redefinir Senha',
      text: `Seu token de redefinição de senha é: ${token}`,
      html: `  <div style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 2rem; text-align: center;">
    <img src="https://geea.com.br/imagem/trevo.png" alt="Logo Trevo" style="max-width: 100px; margin-bottom: 1rem;">
    <h1 style="color: #333;">Escola de Aprendizes do Evangelho</h1>
    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: inline-block; margin-top: 1rem;">
      <p style="font-size: 1.1rem; color: #333;">Seu token de redefinição de senha é:</p>
      <p style="font-size: 2rem; font-weight: bold; color: #28a745;">${token}</p>
    </div>
    <p style="font-size: 0.9rem; color: #555; margin-top: 2rem;">Não responda a este e-mail. Este é um envio automático.</p>
    <footer style="margin-top: 2rem; font-size: 0.8rem; color: #888;">
      2023 — 2025 | Escola de Aprendizes do Evangelho
    </footer>
  </div>`
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ E-mail de token enviado para', emailDestino);

    // Salvar o token localmente
    const tokenPath = path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'config', 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify({ token, createdAt: new Date().toISOString() }, null, 2));

    return { sucesso: true };
  } catch (error) {
    console.error('❌ Erro ao enviar token:', error);
    return { sucesso: false, erro: error.message };
  }
}

module.exports = { enviarToken };
