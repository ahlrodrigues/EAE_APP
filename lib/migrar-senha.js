// migrar-senha.js — Módulo independente para recriptografar notas com nova senha

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const userHome = os.homedir();
const configPath = path.join(userHome, ".config", "escola-aprendizes-final");
const notasPath = path.join(configPath, "notas");
const usuarioPath = path.join(configPath, "config", "usuario.json");

function gerarChave(senha) {
  return crypto.createHash("sha256").update(senha).digest();
}

function descriptografarNota(textoCriptografado, senha) {
  const [ivBase64, conteudoBase64] = textoCriptografado.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const encryptedText = Buffer.from(conteudoBase64, "base64");
  const chave = gerarChave(senha);
  const decipher = crypto.createDecipheriv("aes-256-cbc", chave, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

function criptografarNota(texto, senha) {
  const iv = crypto.randomBytes(16);
  const chave = gerarChave(senha);
  const cipher = crypto.createCipheriv("aes-256-cbc", chave, iv);
  let encrypted = cipher.update(texto, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("base64") + ":" + encrypted.toString("base64");
}

function migrarNotas(senhaAntiga, senhaNova) {
  const arquivos = fs.readdirSync(notasPath).filter(f => f.endsWith(".txt"));
  for (const arquivo of arquivos) {
    const caminho = path.join(notasPath, arquivo);
    const conteudoCriptografado = fs.readFileSync(caminho, "utf-8");
    try {
      const conteudoDescriptografado = descriptografarNota(conteudoCriptografado, senhaAntiga);
      const novoConteudo = criptografarNota(conteudoDescriptografado, senhaNova);
      fs.writeFileSync(caminho, novoConteudo, "utf-8");
      console.log(`✅ Nota '${arquivo}' migrada com sucesso.`);
    } catch (e) {
      console.error(`❌ Erro ao migrar '${arquivo}':`, e.message);
    }
  }
}

module.exports = { migrarNotas };
