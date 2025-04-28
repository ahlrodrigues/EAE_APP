document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('solicitarTokenForm');
  const emailInput = document.getElementById('email');
  const mensagemDiv = document.getElementById('mensagem');

  if (!window.electronAPI?.solicitarToken) {
    console.error("❌ API solicitarToken não disponível no preload");
    mensagemDiv.textContent = "Erro interno: API não carregada.";
    mensagemDiv.classList.add('erro');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // <- Impede envio automático de formulário

    const email = emailInput.value.trim();
    if (!email) {
      mensagemDiv.textContent = '❌ Por favor, preencha o e-mail.';
      mensagemDiv.classList.add('erro');
      return;
    }

    try {
      form.querySelector('button[type="submit"]').disabled = true; // <- bloqueia múltiplos cliques

      const resposta = await window.electronAPI.solicitarToken(email);
      console.log("📦 Resposta:", resposta);

      if (resposta?.sucesso) {
        mensagemDiv.textContent = '✅ Token enviado com sucesso!';
        mensagemDiv.classList.remove('erro');
        mensagemDiv.classList.add('sucesso');
        setTimeout(() => {
          window.location.href = "redefinir-senha.html";
        }, 2000);
      } else {
        mensagemDiv.textContent = '❌ ' + (resposta?.erro || 'Erro ao enviar token.');
        mensagemDiv.classList.add('erro');
      }
    } catch (erro) {
      console.error('Erro ao solicitar token:', erro);
      mensagemDiv.textContent = '❌ Erro inesperado.';
      mensagemDiv.classList.add('erro');
    } finally {
      form.querySelector('button[type="submit"]').disabled = false; // <- reabilita o botão
    }
  });
});
