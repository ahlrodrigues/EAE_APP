document.addEventListener("DOMContentLoaded", () => {
  const senhaInput = document.getElementById("novaSenha");
  const confirmarInput = document.getElementById("confirmarSenha");
  const comprimento = document.getElementById("comprimento");
  const maiuscula = document.getElementById("maiuscula");
  const minuscula = document.getElementById("minuscula");
  const numero = document.getElementById("numero");
  const simbolo = document.getElementById("simbolo");

  const criarToggleBtn = (inputField) => {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.innerText = "👁️";
    toggle.title = "Mostrar senha";
    toggle.style.position = "absolute";
    toggle.style.right = "10px";
    toggle.style.top = "5px";
    toggle.style.border = "none";
    toggle.style.background = "none";
    toggle.style.cursor = "pointer";
    toggle.style.fontSize = "1.2rem";

    const wrapper = inputField.parentElement || inputField.closest("div");
    wrapper.style.position = "relative";
    wrapper.appendChild(toggle);

    toggle.addEventListener("click", () => {
      const visivel = inputField.type === "text";
      inputField.type = visivel ? "password" : "text";
      toggle.title = visivel ? "Mostrar senha" : "Ocultar senha";
      toggle.textContent = visivel ? "👁️" : "🙈";
    });
  };

  criarToggleBtn(senhaInput);
  criarToggleBtn(confirmarInput);

  senhaInput.addEventListener("input", validarSenhaVisual);

function validarSenhaVisual() {
  const senha = senhaInput.value;

  const regras = [
    { id: 'regra-maiuscula', regex: /[A-Z]/, texto: 'Pelo menos 1 letra maiúscula' },
    { id: 'regra-minuscula', regex: /[a-z]/, texto: 'Pelo menos 1 letra minúscula' },
    { id: 'regra-numero', regex: /\d/, texto: 'Pelo menos 1 número' },
    { id: 'regra-simbolo', regex: /[^A-Za-z0-9]/, texto: 'Pelo menos 1 símbolo' },
    { id: 'regra-tamanho', regex: /.{8,}/, texto: 'Pelo menos 8 caracteres' }
  ];

  regras.forEach(regra => {
    const elemento = document.getElementById(regra.id);
    if (regra.regex.test(senha)) {
      elemento.innerHTML = `✅ <span style="color:green;">${regra.texto}</span>`;
    } else {
      elemento.innerHTML = `❌ <span style="color:red;">${regra.texto}</span>`;
    }
  });
}


  const form = document.getElementById("redefinirSenhaForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const senha = senhaInput.value.trim();
      const confirmar = confirmarInput.value.trim();

      const senhaValida = (
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[a-z]/.test(senha) &&
        /[0-9]/.test(senha) &&
        /[^A-Za-z0-9]/.test(senha)
      );

      if (!senhaValida) {
        alert("A senha não atende aos critérios mínimos de segurança.");
        return;
      }

      if (senha !== confirmar) {
        alert("As senhas não coincidem.");
        return;
      }

      const token = document.getElementById("token").value.trim();
      const sucesso = await window.electronAPI.redefinirSenha(token, senha);

      if (sucesso) {
        await window.electronAPI.armazenarSenha(senha);
        alert("Senha redefinida com sucesso!");
        window.location.href = "login.html";
      } else {
        alert("Erro ao redefinir a senha. Verifique o token.");
      }
    });
  }
});



const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const os = require('os');

const userHome = os.homedir();
const configPath = path.join(userHome, '.config', 'escola-aprendizes-final');
const usuarioPath = path.join(configPath, 'config', 'usuario.json');

function gerarChave(senha) {
  return crypto.createHash('sha256').update(senha).digest();
}

function criptografarCampo(texto, senha) {
  const iv = crypto.randomBytes(16);
  const chave = gerarChave(senha);
  const cipher = crypto.createCipheriv('aes-256-cbc', chave, iv);
  let encrypted = cipher.update(texto, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('base64') + ':' + encrypted.toString('base64');
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

async function redefinirSenha(senhaAntiga, senhaNova) {
  if (!fs.existsSync(usuarioPath)) {
    throw new Error('Arquivo usuario.json não encontrado.');
  }

  const dadosCriptografados = JSON.parse(fs.readFileSync(usuarioPath, 'utf8'));

  // Decriptografar todos os campos
  let dadosDecriptografados;
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
  } catch (err) {
    console.error('Erro ao descriptografar usuario.json:', err.message);
    throw new Error('Senha antiga incorreta ou dados corrompidos.');
  }

  // Atualizar a senha
  const novaSenhaHash = bcrypt.hashSync(senhaNova, 10);

  // Recriptografar todos os campos com a nova senha
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

  fs.writeFileSync(usuarioPath, JSON.stringify(novoUsuarioCriptografado, null, 2), 'utf8');

  // Atualizar a senha na memória do app
  global.senhaDescriptografia = senhaNova;

  console.log('✅ Senha redefinida e usuario.json atualizado com sucesso.');
}

module.exports = { redefinirSenha };
