window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('input').forEach(input => {
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
      input.style.pointerEvents = 'auto';
      input.style.userSelect = 'auto';
      input.style.backgroundColor = '#fff';
    });
  }, 100); // espera o render concluir
});


document.getElementById('redefinirSenhaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = document.getElementById('token').value.trim();
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  if (novaSenha !== confirmarSenha) {
    alert('As senhas não coincidem.');
    return;
  }

  if (!window.api || typeof window.api.redefinirSenha !== 'function') {
    alert('❌ API de redefinição não disponível.');
    return;
  }

  const resposta = await window.api.redefinirSenha({ token, novaSenha });

  if (resposta.sucesso) {
    alert('Senha redefinida com sucesso!');
    window.location.href = 'login.html';
  } else {
    alert('Erro ao redefinir senha: ' + resposta.erro);
  }
});
