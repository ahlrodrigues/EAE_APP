document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  if (!form) {
    console.error("❌ Formulário com ID 'formLogin' não encontrado.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const senhaDigitada = document.getElementById("senha")?.value;

    const valido = await window.electronAPI.validarSenhaHash(senhaDigitada);

    if (valido) {
      await window.electronAPI.setSenhaCriptografia(senhaDigitada);
      console.log("🔐 Senha enviada com sucesso ao main.js via setSenhaCriptografia()");
      location.href = "index.html";
    } else {
      alert("Senha incorreta");
    }
  });
});

// ✅ Olho da senha
document.getElementById("toggleSenha").addEventListener("click", () => {
  const senhaField = document.getElementById("senha");
  senhaField.type = senhaField.type === "password" ? "text" : "password";
});
