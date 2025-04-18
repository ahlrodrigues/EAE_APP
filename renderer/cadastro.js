window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const senhaInput = document.getElementById('senha');
  const confirmarInput = document.getElementById('confirmarSenha');
  const toggleSenha = document.getElementById('toggleSenha');
  const mensagemDiv = document.getElementById('mensagem');

  const regraMaiuscula = document.getElementById('regra-maiuscula');
  const regraMinuscula = document.getElementById('regra-minuscula');
  const regraNumero = document.getElementById('regra-numero');
  const regraSimbolo = document.getElementById('regra-simbolo');
  const regraTamanho = document.getElementById('regra-tamanho');

  toggleSenha.addEventListener('click', () => {
    const type = senhaInput.type === 'password' ? 'text' : 'password';
    senhaInput.type = type;
    confirmarInput.type = type;
    toggleSenha.textContent = type === 'password' ? '👁️' : '🙈';
  });

  senhaInput.addEventListener('input', () => {
    const senha = senhaInput.value;

    regraMaiuscula.textContent = /[A-Z]/.test(senha) ? '✔️ ' + regraMaiuscula.dataset.texto : '❌ ' + regraMaiuscula.dataset.texto;
    regraMinuscula.textContent = /[a-z]/.test(senha) ? '✔️ ' + regraMinuscula.dataset.texto : '❌ ' + regraMinuscula.dataset.texto;
    regraNumero.textContent = /[0-9]/.test(senha) ? '✔️ ' + regraNumero.dataset.texto : '❌ ' + regraNumero.dataset.texto;
    regraSimbolo.textContent = /[^A-Za-z0-9]/.test(senha) ? '✔️ ' + regraSimbolo.dataset.texto : '❌ ' + regraSimbolo.dataset.texto;
    regraTamanho.textContent = senha.length >= 8 ? '✔️ ' + regraTamanho.dataset.texto : '❌ ' + regraTamanho.dataset.texto;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dados = {};
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      dados[input.id] = input.value.trim();
    });

    if (dados.senha !== dados.confirmarSenha) {
      mensagemDiv.textContent = '❌ As senhas não coincidem.';
      mensagemDiv.style.color = '#cc0000';
      return;
    }

    try {
      const resposta = await window.electronAPI.salvarCadastro(dados);
      if (resposta.sucesso) {
        mensagemDiv.textContent = '✅ Cadastro realizado com sucesso. Redirecionando...';
        mensagemDiv.style.color = '#007700';
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        mensagemDiv.textContent = `❌ Erro: ${resposta.erro}`;
        mensagemDiv.style.color = '#cc0000';
      }
    } catch (erro) {
      mensagemDiv.textContent = `⚠️ Erro ao salvar: ${erro.message}`;
      mensagemDiv.style.color = '#cc0000';
    }
  });
});