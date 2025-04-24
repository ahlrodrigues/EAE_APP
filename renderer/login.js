
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailDigitado = emailInput.value.trim();
      const senhaDigitada = senhaInput.value.trim();

      try {
        await window.electronAPI.armazenarSenha(senhaDigitada);
        const usuario = await window.electronAPI.lerUsuario();

        if (!usuario) {
          alert("Erro ao carregar os dados do usuário.");
          return;
        }

        const emailCorreto = usuario.email === emailDigitado;

        // validação segura usando bcrypt direto via Electron
        const senhaCorreta = await window.electronAPI.validarSenhaComHash(senhaDigitada, usuario.senha);
        await window.electronAPI.armazenarSenha(senhaDigitada);

        if (emailCorreto && senhaCorreta) {
          alert("✅ Login realizado com sucesso!");
          window.location.href = "index.html";
        } else {
          alert("❌ E-mail ou senha inválidos.");
        }
      } catch (err) {
        console.error("Erro ao autenticar login:", err);
        alert("Erro ao tentar logar. Consulte o suporte.");
      }
    });
  }
});
