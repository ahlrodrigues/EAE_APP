window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("redefinirSenhaForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tokenInput = document.getElementById("token");
    const novaSenhaInput = document.getElementById("novaSenha");
    const confirmarSenhaInput = document.getElementById("confirmarSenha");

    const token = tokenInput?.value.trim() || "";
    const novaSenha = novaSenhaInput?.value || "";
    const confirmarSenha = confirmarSenhaInput?.value || "";

    if (!token || !novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    // 🔐 Validação de senha igual à do cadastro
    const senhaForteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!senhaForteRegex.test(novaSenha)) {
      alert("A senha deve conter ao menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const resposta = await window.electronAPI.redefinirSenha(token, novaSenha);
      console.log("📦 Resposta recebida:", resposta);

      if (resposta?.sucesso) {
        alert("✅ Senha redefinida com sucesso!");
        window.location.href = "login.html";
      } else {
        alert("❌ Erro: " + (resposta?.erro || "Não foi possível redefinir a senha."));
      }
    } catch (erro) {
      console.error("Erro ao redefinir senha:", erro);
      alert("❌ Erro inesperado. Veja o console.");
    }
  });
});
