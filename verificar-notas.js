const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const pastaNotas = path.join(os.homedir(), ".config", "escola-aprendizes-final", "notas");
const senha = "&ntu$1@$M0";

// 🔐 Função de descriptografia (mesmo padrão do crypto.js)
function descriptografar(conteudoCriptografado, senha) {
  if (typeof conteudoCriptografado !== "string") {
    throw new Error("❌ Conteúdo inválido (esperado string)");
  }

  const [ivBase64, conteudoBase64] = conteudoCriptografado.split(":");
  if (!ivBase64 || !conteudoBase64) {
    throw new Error("❌ Formato inválido (esperado 'iv:conteudo')");
  }

  const iv = Buffer.from(ivBase64, "base64");
  if (iv.length !== 16) {
    throw new Error(`❌ IV inválido: esperado 16 bytes, recebeu ${iv.length}`);
  }

  const conteudo = Buffer.from(conteudoBase64, "base64");
  const key = crypto.createHash("sha256").update(senha).digest();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let dec = decipher.update(conteudo);
  dec = Buffer.concat([dec, decipher.final()]);
  return dec.toString("utf8");
}

// 🚀 Início do processo
console.log(`🔎 Verificando notas em: ${pastaNotas}\n`);

const arquivos = fs.readdirSync(pastaNotas).filter(nome => nome.endsWith(".txt"));

if (arquivos.length === 0) {
  console.log("⚠️ Nenhuma nota encontrada.");
  process.exit(0);
}

for (const nome of arquivos) {
  const caminho = path.join(pastaNotas, nome);
  try {
    const conteudo = fs.readFileSync(caminho, "utf8").trim();
    const resultado = descriptografar(conteudo, senha);
    console.log(`✅ ${nome}: OK`);
  } catch (erro) {
    console.error(`❌ ${nome}: ${erro.message}`);
  }
}
