document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('trocarSenhaForm');
  const novaSenhaInput = document.getElementById('novaSenha');

  // Alternar visibilidade da senha
  document.querySelectorAll('.toggle-senha').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      btn.textContent = isVisible ? '👁️' : '🙈';
      btn.title = isVisible ? 'Mostrar senha' : 'Ocultar senha';
    });
  });

  // Validação dinâmica da nova senha
  novaSenhaInput.addEventListener('input', () => {
    const senha = novaSenhaInput.value;

    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const temSimbolo = /[\W_]/.test(senha);
    const tamanhoValido = senha.length >= 8;

    const atualizarRegra = (id, condicao) => {
      const el = document.getElementById(id);
      const texto = el.getAttribute('data-texto');
      el.textContent = `${condicao ? '✔️' : '❌'} ${texto}`;
      el.style.color = condicao ? 'green' : '#555';
    };

    atualizarRegra('regra-maiuscula', temMaiuscula);
    atualizarRegra('regra-minuscula', temMinuscula);
    atualizarRegra('regra-numero', temNumero);
    atualizarRegra('regra-simbolo', temSimbolo);
    atualizarRegra('regra-tamanho', tamanhoValido);
  });

  // Envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = novaSenhaInput.value;
    const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

    if (novaSenha !== confirmarNovaSenha) {
      alert('❌ A nova senha e a confirmação não coincidem.');
      return;
    }

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!senhaForte.test(novaSenha)) {
      alert('❌ A nova senha não atende aos critérios de segurança.');
      return;
    }

    try {
      const resposta = await window.api.trocarSenha({ email, senhaAtual, novaSenha, confirmarNovaSenha });

      if (resposta?.sucesso) {
        alert('✔️ Senha alterada com sucesso!');
        form.reset();
        // Redirecionar ou atualizar a interface conforme necessário
      } else {
        alert('❌ ' + (resposta?.erro || 'Erro desconhecido.'));
      }
    } catch (erro) {
      console.error('Erro ao trocar senha:', erro);
      alert('❌ Erro interno ao tentar trocar a senha.');
    }
  });
});
