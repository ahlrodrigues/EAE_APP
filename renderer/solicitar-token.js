console.log("✅ solicitar-token.js carregado");

window.addEventListener('DOMContentLoaded', () => {
  console.log('🧪 DOM completamente carregado.');

  if (!window.api || typeof window.api.solicitarToken !== 'function') {
    console.error('❌ window.api.solicitarToken não está acessível no preload.');
    alert('Erro: preload não carregado corretamente.');
    return;
  }

  const form = document.getElementById('solicitarTokenForm');
  if (!form) {
    console.error('❌ Formulário solicitarTokenForm não encontrado no DOM.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    console.log('📨 Enviando token para:', email);

    try {
      const resposta = await window.api.solicitarToken(email);
      console.log('✅ Resposta recebida:', resposta);

      if (resposta.sucesso) {
        alert('✅ Token enviado com sucesso! Verifique também a caixa de SPAM!');
        window.location.href = 'recuperar-senha.html';
        if (resposta.link) {
          console.log('🔗 Link do e-mail:', resposta.link);
        }
      } else {
        alert('❌ Erro: ' + resposta.erro);
      }
    } catch (err) {
      console.error('❌ Erro ao chamar solicitarToken:', err);
      alert('Erro inesperado ao tentar enviar o token.');
    }
  });
});
