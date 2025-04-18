window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const mensagemDiv = document.getElementById('mensagem');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const senha = senhaInput.value;

    try {
      const resposta = await window.electronAPI.fazerLogin(email, senha);
      if (resposta.sucesso) {
        window.location.href = 'index.html';
      } else {
        mensagemDiv.textContent = '❌ Login inválido. Tente novamente.';
      }
    } catch (erro) {
      mensagemDiv.textContent = `⚠️ Erro ao fazer login: ${erro.message}`;
    }
  });
});