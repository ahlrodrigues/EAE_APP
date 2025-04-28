const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { app } = require('electron');

const userHome = app.getPath('home');
const usuarioPath = path.join(userHome, '.config', 'escola-aprendizes-final', 'config', 'usuario.json');

function gerarChave(senha) {
  return crypto.createHash('sha256').update(senha).digest();
}

function descriptografarCampo(dadoCriptografado, senha) {
  const [ivBase64, conteudoBase64] = dadoCriptografado.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const encryptedText = Buffer.from(conteudoBase64, 'base64');
  const chave = gerarChave(senha);
  const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

function criptografarCampo(texto, senha) {
  const iv = crypto.randomBytes(16);
  const chave = gerarChave(senha);
  const cipher = crypto.createCipheriv('aes-256-cbc', chave, iv);
  let encrypted = cipher.update(texto, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('base64') + ':' + encrypted.toString('base64');
}

async function redefinirSenha(senhaAntiga, senhaNova) {
  console.log("🔵 Iniciando redefinição de senha...");

  if (!fs.existsSync(usuarioPath)) {
    console.error("❌ usuario.json não encontrado.");
    throw new Error('Arquivo usuario.json não encontrado.');
  }

  console.log("📂 usuario.json encontrado.");

  const dadosCriptografados = JSON.parse(fs.readFileSync(usuarioPath, 'utf8'));
  let dadosDecriptografados = {};

  try {
    dadosDecriptografados = {
      casaEspírita: descriptografarCampo(dadosCriptografados.casaEspírita, senhaAntiga),
      numeroTurma: descriptografarCampo(dadosCriptografados.numeroTurma, senhaAntiga),
      dirigente: descriptografarCampo(dadosCriptografados.dirigente, senhaAntiga),
      emailDirigente: descriptografarCampo(dadosCriptografados.emailDirigente, senhaAntiga),
      secretarios: descriptografarCampo(dadosCriptografados.secretarios, senhaAntiga),
      aluno: descriptografarCampo(dadosCriptografados.aluno, senhaAntiga),
      email: descriptografarCampo(dadosCriptografados.email, senhaAntiga)
    };
    console.log("✅ Decriptação dos dados antigos realizada.");
  } catch (err) {
    console.error("❌ Falha ao decriptografar usuario.json:", err.message);
    throw new Error('Senha antiga incorreta ou dados corrompidos.');
  }

  // Atualizar a senha
  console.log("🔐 Gerando hash da nova senha...");
  const novaSenhaHash = bcrypt.hashSync(senhaNova, 10);

  // Recriptografar os campos
  console.log("🔄 Recriptografando campos com nova senha...");
  const novoUsuarioCriptografado = {
    casaEspírita: criptografarCampo(dadosDecriptografados.casaEspírita, senhaNova),
    numeroTurma: criptografarCampo(dadosDecriptografados.numeroTurma, senhaNova),
    dirigente: criptografarCampo(dadosDecriptografados.dirigente, senhaNova),
    emailDirigente: criptografarCampo(dadosDecriptografados.emailDirigente, senhaNova),
    secretarios: criptografarCampo(dadosDecriptografados.secretarios, senhaNova),
    aluno: criptografarCampo(dadosDecriptografados.aluno, senhaNova),
    email: criptografarCampo(dadosDecriptografados.email, senhaNova),
    senha: novaSenhaHash
  };

  // Salvar o novo usuario.json
  fs.writeFileSync(usuarioPath, JSON.stringify(novoUsuarioCriptografado, null, 2), 'utf8');
  console.log("✅ usuario.json atualizado com sucesso.");

  // Atualizar senha na memória
  global.senhaDescriptografia = senhaNova;
  console.log("✅ senhaDescriptografia atualizada na memória.");
}

module.exports = { redefinirSenha };
