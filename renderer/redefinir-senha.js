// redefinir-senha.js — Validação dinâmica de senha e botões de visualização

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

  senhaInput.addEventListener("input", () => {
    const senha = senhaInput.value;
    comprimento.textContent = senha.length >= 8 ? "✔️ Mínimo 8 caracteres" : "❌ Mínimo 8 caracteres";
    maiuscula.textContent = /[A-Z]/.test(senha) ? "✔️ Letra maiúscula" : "❌ Letra maiúscula";
    minuscula.textContent = /[a-z]/.test(senha) ? "✔️ Letra minúscula" : "❌ Letra minúscula";
    numero.textContent = /[0-9]/.test(senha) ? "✔️ Número" : "❌ Número";
    simbolo.textContent = /[^A-Za-z0-9]/.test(senha) ? "✔️ Símbolo" : "❌ Símbolo";
  });

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
