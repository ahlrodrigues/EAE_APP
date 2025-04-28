// renderer/notas.js
// Este arquivo é responsável por gerenciar a lógica de criação e salvamento de notas no aplicativo Electron.
// Ele escuta o evento de envio do formulário, coleta os dados inseridos pelo usuário e os salva em um arquivo de texto.
document.addEventListener('DOMContentLoaded', () => {
  const formularioNota = document.getElementById('formNota');

  if (!formularioNota) {
    console.error('[ERRO] Formulario de nota (formNota) nao encontrado!');
    return;
  }

  formularioNota.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const data = formularioNota.elements['data'].value.trim();
      const fato = formularioNota.elements['fato'].value.trim();
      const reacao = formularioNota.elements['reacao'].value.trim();
      const sentimento = formularioNota.elements['sentimento'].value.trim();
      const proposta = formularioNota.elements['proposta'].value.trim();

      if (!data || !fato || !reacao || !sentimento || !proposta) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const conteudo = `Data: ${data}\nFato: ${fato}\nReação: ${reacao}\nSentimento: ${sentimento}\nProposta: ${proposta}`;

      const aluno = await window.electronAPI.obterNomeAluno();
      if (!aluno) {
        alert('Erro ao obter nome do aluno. Talvez o cadastro esteja corrompido.');
        return;
      }

      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const dia = String(agora.getDate()).padStart(2, '0');
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      const segundo = String(agora.getSeconds()).padStart(2, '0');

      const nomeArquivo = `${ano}-${mes}-${dia}_${hora}_${minuto}_${segundo}-${aluno}.txt`;

      await window.electronAPI.salvarNota(nomeArquivo, conteudo);

      alert('Nota salva com sucesso!');
      formularioNota.reset();

} catch (error) {
  console.error('Erro ao salvar nota:', error);

  if (error.message.includes("Cadastro não encontrado")) {
    alert("Cadastro não encontrado. Redirecionando para tela de cadastro...");
    window.location.href = "../pages/cadastro.html"; // ajuste o caminho se necessário
  } else {
    alert('Erro ao salvar a nota. Tente novamente.');
  }
}
  }); // FIM DO ADD EVENT LISTENER
});