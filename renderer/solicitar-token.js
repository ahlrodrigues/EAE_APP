window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('solicitarTokenForm');
  const emailInput = document.getElementById('email');
  const mensagemDiv = document.getElementById('mensagem');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    mensagemDiv.textContent = '';
    mensagemDiv.classList.remove('sucesso', 'erro');

    if (!email) {
      mensagemDiv.textContent = '❌ Por favor, preencha o e-mail.';
      mensagemDiv.classList.add('erro');
      return;
    }

    try {
      const resposta = await window.electronAPI.solicitarToken(email);
      if (resposta.sucesso) {
        mensagemDiv.textContent = '✅ Token enviado com sucesso! Redirecionando...';
        mensagemDiv.classList.add('sucesso');
        setTimeout(() => window.location.href = 'recuperar-senha.html', 1500);
      } else {
        mensagemDiv.textContent = `❌ Erro: ${resposta.erro || 'Não foi possível enviar o token.'}`;
        mensagemDiv.classList.add('erro');
      }
    } catch (erro) {
      mensagemDiv.textContent = `⚠️ Erro ao solicitar token: ${erro.message}`;
      mensagemDiv.classList.add('erro');
    }
  });
});
