// Captura dos elementos
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarsenha');
const toggleSenha1 = document.getElementById('toggleSenha1');
const toggleSenha2 = document.getElementById('toggleSenha2');
const cadastroForm = document.getElementById('cadastroForm');
const mensagem = document.getElementById('mensagem');

// Função: Alternar visualização de senha
function configurarToggleSenha(botao, campoSenha) {
  botao.addEventListener('click', () => {
    const tipo = campoSenha.type === 'password' ? 'text' : 'password';
    campoSenha.type = tipo;
    botao.textContent = tipo === 'password' ? '👁️' : '🙈';
  });
}

// Função: Atualizar validação visual da senha
function validarSenhaVisual() {
  const senha = senhaInput.value;

  const regras = [
    { id: 'regra-maiuscula', regex: /[A-Z]/, texto: 'Pelo menos 1 letra maiúscula' },
    { id: 'regra-minuscula', regex: /[a-z]/, texto: 'Pelo menos 1 letra minúscula' },
    { id: 'regra-numero', regex: /\d/, texto: 'Pelo menos 1 número' },
    { id: 'regra-simbolo', regex: /[^A-Za-z0-9]/, texto: 'Pelo menos 1 símbolo' },
    { id: 'regra-tamanho', regex: /.{8,}/, texto: 'Pelo menos 8 caracteres' }
  ];

  regras.forEach(regra => {
    const elemento = document.getElementById(regra.id);
    if (regra.regex.test(senha)) {
      elemento.innerHTML = `✅ <span style="color:green;">${regra.texto}</span>`;
    } else {
      elemento.innerHTML = `❌ <span style="color:red;">${regra.texto}</span>`;
    }
  });
}

// Função: Salvar cadastro
async function salvarCadastro(dados) {
  try {
    await window.electronAPI.salvarCadastro(dados);
    mensagem.textContent = 'Cadastro salvo com sucesso!';
    mensagem.style.color = 'green';
    cadastroForm.reset();

    // Adicionando redirecionamento para login.html após sucesso
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500); // Espera 1.5 segundos antes de redirecionar
  } catch (error) {
    console.error('Erro ao salvar cadastro:', error);
    mensagem.textContent = 'Erro ao salvar cadastro. Tente novamente.';
    mensagem.style.color = 'red';
  }
}


// Função: Lidar com o envio do formulário
async function handleCadastroSubmit(e) {
  e.preventDefault();

  const casaEspírita = document.getElementById('casaEspírita').value.trim();
  const numeroTurma = document.getElementById('numeroTurma').value.trim();
  const dirigente = document.getElementById('dirigente').value.trim();
  const emailDirigente = document.getElementById('emailDirigente').value.trim();
  const secretarios = document.getElementById('secretarios').value.trim();
  const aluno = document.getElementById('aluno').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = senhaInput.value.trim();
  const confirmarSenha = confirmarSenhaInput.value.trim();

  if (senha !== confirmarSenha) {
    mensagem.textContent = 'As senhas não coincidem!';
    mensagem.style.color = 'red';
    return;
  }

  const dadosCadastro = {
    casaEspírita,
    numeroTurma,
    dirigente,
    emailDirigente,
    secretarios,
    aluno,
    email,
    senha // NÃO incluir confirmarsenha
  };

  await salvarCadastro(dadosCadastro);
}

// Inicialização dos eventos
configurarToggleSenha(toggleSenha1, senhaInput);
configurarToggleSenha(toggleSenha2, confirmarSenhaInput);
senhaInput.addEventListener('input', validarSenhaVisual);
cadastroForm.addEventListener('submit', handleCadastroSubmit);
