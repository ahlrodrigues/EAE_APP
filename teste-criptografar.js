const crypto = require("crypto");

// 🔐 Função de criptografia
function criptografar(texto, senha) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(senha).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(texto, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("base64")}:${encrypted.toString("base64")}`;
}

// ✏️ Texto fictício que você quer criptografar
const textoOriginal = `
Data: 2025-04-30
Fato: O grupo refletiu sobre perdão.
Sentimento: Esperança e acolhimento.
Proposta: Praticar o exercício durante a semana.
`;

// 🔑 Senha usada para criptografar
const senha = "&ntu$1@$M0";

// 🔐 Executar a criptografia
const resultado = criptografar(textoOriginal.trim(), senha);
console.log("🔐 Conteúdo criptografado:\n");
console.log(resultado);
