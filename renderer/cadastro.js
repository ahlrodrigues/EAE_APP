
document.getElementById("cadastroForm").addEventListener("submit", async (event) => {
  console.log('Submit acionado');
  event.preventDefault();

  const senhaInput = document.getElementById("senha");
  const confirmarSenhaInput = document.getElementById("confirmarsenha");
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
  const telefone = document.getElementById("telefone").value.trim();
  const regexTelefone = /^(\+?\d{1,3}\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/;

if (!regexTelefone.test(telefone)) {
  alert("Telefone inválido. Formato esperado: +55 11 00000-0000 ou similar.");
  return;
}
  console.log("Cadastro.js carregado");

  // Verificação dos critérios da senha
  const requisitos = {
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    simbolo: /[\W_]/.test(senha),
    tamanho: senha.length >= 8
  };

  // Verifica se todos os requisitos estão ok
  const senhaValida = Object.values(requisitos).every(Boolean);

  if (!senhaValida) {
    await exibirAviso("A senha não atende todos os critérios. Verifique os requisitos abaixo do campo de senha.");
    return;
  }
  
  if (senha !== confirmarSenha) {
    await exibirAviso("As senhas não coincidem.");
    return;
  }
  try {
    const dados = {
      casaEspírita: document.getElementById("casaEspírita").value,
      numeroTurma: document.getElementById("numeroTurma").value,
      dirigente: document.getElementById("dirigente").value,
      emailDirigente: document.getElementById("emailDirigente").value,
      secretarios: document.getElementById("secretarios").value,
      aluno: document.getElementById("aluno").value,
      email: document.getElementById("email").value,
      telefone: telefone,
      senha: senha,
    };

    await window.electronAPI.salvarCadastro(dados);
    await window.electronAPI.armazenarSenha(senha);
    await exibirAviso("Cadastro salvo com sucesso!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    await exibirAviso("Erro ao salvar cadastro.");
  }
});

// Atualização visual em tempo real dos critérios
document.getElementById("senha").addEventListener("input", () => {
  const senha = document.getElementById("senha").value;

  const criterios = {
    "regra-maiuscula": /[A-Z]/.test(senha),
    "regra-minuscula": /[a-z]/.test(senha),
    "regra-numero": /\d/.test(senha),
    "regra-simbolo": /[\W_]/.test(senha),
    "regra-tamanho": senha.length >= 8
  };

  for (const [id, passou] of Object.entries(criterios)) {
    const el = document.getElementById(id);
    el.textContent = `${passou ? "✅" : "❌"} ${el.dataset.texto}`;
    el.style.color = passou ? "green" : "#555";
  }
});

// Alternar visibilidade das senhas
document.getElementById("toggleSenha1").addEventListener("click", () => {
  const senhaField = document.getElementById("senha");
  senhaField.type = senhaField.type === "password" ? "text" : "password";
});

document.getElementById("toggleSenha2").addEventListener("click", () => {
  const senhaField = document.getElementById("confirmarsenha");
  senhaField.type = senhaField.type === "password" ? "text" : "password";
});
document.getElementById("telefone").addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número

  // Divide as partes do número
  const match = valor.match(/^(\d{2,3})?(\d{2})?(\d{4,5})?(\d{0,4})?/);

  let formatado = "";
  if (match) {
    if (match[1]) formatado += `+${match[1]} `;
    if (match[2]) formatado += `(${match[2]}) `;
    if (match[3]) formatado += match[3];
    if (match[4]) formatado += `-${match[4]}`;
  }

  e.target.value = formatado.trim();
});
function exibirAviso(mensagem) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalAviso");
    const msg = document.getElementById("modalMensagem");
    msg.textContent = mensagem;
    modal.style.display = "flex";

    const fechar = () => {
      modal.style.display = "none";
      document.querySelector("#modalAviso button").removeEventListener("click", fechar);
      resolve();
    };

    document.querySelector("#modalAviso button").addEventListener("click", fechar);
  });
}

function fecharAviso() {
  // backup, mas a função principal usa Promise
  document.getElementById("modalAviso").style.display = "none";
}
