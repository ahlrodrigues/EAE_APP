document.getElementById("cadastroForm").addEventListener("submit", async (event) => {
  console.log('Submit acionado');
  event.preventDefault();

  const senhaInput = document.getElementById("senha");
  const confirmarSenhaInput = document.getElementById("confirmarsenha");
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
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
    alert("A senha não atende todos os critérios. Verifique os requisitos abaixo do campo de senha.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
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
      senha
    };

    await window.electronAPI.salvarCadastro(dados);
    alert("Cadastro salvo com sucesso!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    alert("Erro ao salvar cadastro.");
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
