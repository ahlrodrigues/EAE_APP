document.getElementById('recuperarSenhaForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const resposta = await window.api.solicitarToken(email);
  if (resposta.sucesso) {
    alert('Recuperação de senha com sucesso!');
    window.location.href = 'login.html';
  } else {
    alert('Erro ao enviar token: ' + resposta.erro);
  }
});
