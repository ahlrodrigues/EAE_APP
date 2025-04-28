const { app } = require('electron');
const path = require('path');
const fs = require('fs');

async function validarTokenDigitado(tokenDigitado) {
  const tokenPath = path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'config', 'token.json');
  
  if (!fs.existsSync(tokenPath)) {
    throw new Error('Token não encontrado. Solicite um novo.');
  }

  const { token, createdAt } = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const criadoEm = new Date(createdAt);
  const agora = new Date();
  const diferencaMinutos = (agora - criadoEm) / (1000 * 60); // diferença em minutos

  if (diferencaMinutos > 10) {
    throw new Error('Token expirado. Solicite um novo.');
  }

  if (token !== tokenDigitado) {
    throw new Error('Token inválido. Verifique o código enviado.');
  }

  return true;
}
module.exports = { validarTokenDigitado };
