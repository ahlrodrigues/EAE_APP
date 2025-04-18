window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('solicitarTokenForm');

  if (!form) {
    console.error('❌ Formulário não encontrado!');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();

    try {
      const resposta = await window.api.solicitarToken(email);
      console.log('Resposta:', resposta);

      if (resposta.sucesso) {
        alert('✅ Token enviado com sucesso!');
        if (resposta.link) {
          console.log('🔗 Link do e-mail:', resposta.link);
        }
      } else {
        alert('Erro: ' + resposta.erro);
      }
    } catch (err) {
      console.error('Erro ao solicitar token:', err);
      alert('Erro interno');
    }
  });
});