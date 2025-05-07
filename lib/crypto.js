
const crypto = require("crypto");
require("dotenv").config(); // Para garantir que o .env seja lido

const SALT = process.env.CRYPTO_SECRET; // Usa o segredo do .env como salt

function criptografar(texto, senha) {
  const iv = crypto.randomBytes(16); // ✅ sempre 16 bytes
  const chave = crypto.createHash("sha256").update(senha).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", chave, iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  return iv.toString("base64") + ":" + cifrado.toString("base64");
}


function descriptografar(texto, senha) {
  const [ivBase64, conteudoBase64] = texto.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const conteudo = Buffer.from(conteudoBase64, 'base64');
  const chave = crypto.createHash('sha256').update(senha).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
  const decifrado = Buffer.concat([decipher.update(conteudo), decipher.final()]);
  return decifrado.toString('utf8');
}


// Alias interno
const descriptografarNota = descriptografar;

module.exports = {
  criptografar,
  descriptografar,
  descriptografarNota, // opcional alias
};
