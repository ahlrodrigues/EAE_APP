// cadastro.js — validação dinâmica + envio com console.log para debug + ícones de visualização de senha

document.addEventListener("DOMContentLoaded", () => {
  const senhaInput = document.getElementById("senha");
  const confirmarInput = document.getElementById("confirmarSenha");
  const toggleSenha = document.getElementById("toggleSenha");

  const regraMaiuscula = document.getElementById("regra-maiuscula");
  const regraMinuscula = document.getElementById("regra-minuscula");
  const regraNumero = document.getElementById("regra-numero");
  const regraSimbolo = document.getElementById("regra-simbolo");
  const regraTamanho = document.getElementById("regra-tamanho");

  if (toggleSenha && senhaInput) {
    toggleSenha.addEventListener("click", () => {
      const visivel = senhaInput.type === "text";
      senhaInput.type = visivel ? "password" : "text";
      toggleSenha.title = visivel ? "Mostrar senha" : "Ocultar senha";
      toggleSenha.textContent = visivel ? "👁️" : "🙈";
    });
  }

  // Adiciona botão de visualização para confirmarSenha se não existir
  if (confirmarInput && !confirmarInput.parentElement.querySelector(".toggle-confirmar")) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.innerText = "👁️";
    toggle.title = "Mostrar senha";
    toggle.className = "toggle-confirmar";
    toggle.style.position = "absolute";
    toggle.style.right = "10px";
    toggle.style.top = "5px";
    toggle.style.border = "none";
    toggle.style.background = "none";
    toggle.style.cursor = "pointer";
    toggle.style.fontSize = "1.2rem";

    const wrapper = confirmarInput.parentElement;
    wrapper.style.position = "relative";
    wrapper.appendChild(toggle);

    toggle.addEventListener("click", () => {
      const visivel = confirmarInput.type === "text";
      confirmarInput.type = visivel ? "password" : "text";
      toggle.title = visivel ? "Mostrar senha" : "Ocultar senha";
      toggle.textContent = visivel ? "👁️" : "🙈";
    });
  }

  if (senhaInput) {
    senhaInput.addEventListener("input", () => {
      const senha = senhaInput.value;
      regraMaiuscula.textContent = /[A-Z]/.test(senha) ? "✔️ " + regraMaiuscula.dataset.texto : "❌ " + regraMaiuscula.dataset.texto;
      regraMinuscula.textContent = /[a-z]/.test(senha) ? "✔️ " + regraMinuscula.dataset.texto : "❌ " + regraMinuscula.dataset.texto;
      regraNumero.textContent = /[0-9]/.test(senha) ? "✔️ " + regraNumero.dataset.texto : "❌ " + regraNumero.dataset.texto;
      regraSimbolo.textContent = /[^A-Za-z0-9]/.test(senha) ? "✔️ " + regraSimbolo.dataset.texto : "❌ " + regraSimbolo.dataset.texto;
      regraTamanho.textContent = senha.length >= 8 ? "✔️ " + regraTamanho.dataset.texto : "❌ " + regraTamanho.dataset.texto;
    });
  }

  const form = document.getElementById("cadastroForm");
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

      const dados = {
        casaEspírita: document.getElementById("casaEspírita").value.trim(),
        numeroTurma: document.getElementById("numeroTurma").value.trim(),
        dirigente: document.getElementById("dirigente").value.trim(),
        secretarios: document.getElementById("secretarios").value.trim(),
        aluno: document.getElementById("aluno").value.trim(),
        email: document.getElementById("email").value.trim(),
        senha
      };

      console.log("🟡 Dados enviados ao main:", dados);

      try {
        const sucesso = await window.electronAPI.salvarCadastro(dados);
        if (sucesso) {
          alert("Cadastro salvo com sucesso!");
          window.location.href = "login.html";
          form.reset();
        } else {
          alert("Erro ao salvar cadastro.");
        }
      } catch (err) {
        console.error("Erro ao salvar cadastro:", err);
        alert("Erro interno ao salvar cadastro.");
      }
    });
  }
});
