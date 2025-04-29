document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    const valido = await window.electronAPI.validarSenhaHash(senha);

    if (valido) {
      window.location.href = "index.html";
    } else {
      document.getElementById("mensagem").textContent = "Senha incorreta. Tente novamente.";
    }
  } catch (error) {
    console.error("Erro no login:", error);
    document.getElementById("mensagem").textContent = "Erro ao validar senha.";
  }
});

// ✅ Olho da senha
document.getElementById("toggleSenha").addEventListener("click", () => {
  const senhaField = document.getElementById("senha");
  senhaField.type = senhaField.type === "password" ? "text" : "password";
});
