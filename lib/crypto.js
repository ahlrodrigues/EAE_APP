
const crypto = require("crypto");

function criptografar(texto, senha) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(senha).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(texto, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("base64")}:${encrypted.toString("base64")}`;
}

function descriptografar(conteudoCriptografado, senha) {
  const [ivBase64, conteudoBase64] = conteudoCriptografado.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const encryptedText = Buffer.from(conteudoBase64, "base64");
  const key = crypto.createHash("sha256").update(senha).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

// Alias interno
const descriptografarNota = descriptografar;

module.exports = {
  criptografar,
  descriptografar,
  descriptografarNota, // opcional alias
};
