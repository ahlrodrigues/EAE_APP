export function setupEventosEnvioEmail() {
  console.log('setupEventosEnvioEmail foi chamado');
    document.addEventListener('click', async (event) => {
      console.log('clique detectado:', event.target.id);
      if (event.target.id === 'btnVerEnvioEmail') {
        await visualizarNotasSelecionadas();
      } else if (event.target.id === 'btnConfirmarEnvioEmail') {
        await enviarNotasPorEmail();
      }
    });
  }
  setupEventosEnvioEmail();


  async function visualizarNotasSelecionadas() {
    try {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      const nomesNotas = Array.from(checkboxes)
  .map(cb => cb.dataset.nome)
  .filter(nome => !!nome); // Remove undefined ou string vazia

if (nomesNotas.length === 0) {
  alert('Nenhuma nota selecionada corretamente.');
  return;
}


      const arquivosSelecionados = Array.from(checkboxes).map(cb => cb.dataset.nome);
  
      const conteudos = await Promise.all(
        arquivosSelecionados.map(nome => window.electronAPI.lerNota(nome))
      );
  
      const htmlFinal = conteudos.map(c => `<div class="notaVisualizada">${c}</div>`).join('<hr>');
  
      await window.electronAPI.abrirVisualizacaoNotas(htmlFinal);
    } catch (erro) {
      console.error('Erro ao visualizar notas:', erro);
      alert('Erro ao visualizar notas.');
    }
  }
  
  async function enviarNotasPorEmail() {
    try {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked')?.value || 'unico';
  
      const nomesNotas = Array.from(checkboxes)
        .map(cb => cb.dataset.nome)
        .filter(nome => !!nome);
  
      if (nomesNotas.length === 0) {
        alert('Nenhuma nota selecionada corretamente.');
        return;
      }
  
      const usuario = await window.electronAPI.obterCadastro();
  
      const conteudos = await Promise.all(
        nomesNotas.map(nome => window.electronAPI.lerNota(nome))
      );
  
      const anexos = await window.electronAPI.gerarPdfAnexosParaEmail(
        conteudos,
        nomesNotas,
        tipoEnvio
      );
  
      const assunto = `EAE - Anotações de ${usuario.aluno}`;
      const corpo = `
        Olá ${usuario.dirigente},<br><br>
        Seguem em anexo as anotações do aluno(a) ${usuario.aluno}.<br><br>
        Atenciosamente,<br>
        Escola de Aprendizes do Evangelho
      `;
  
      // ⬇️ Esta linha abaixo é segura e válida:
      await window.electronAPI.enviarEmail({
        para: usuario.emailDirigente,
        assunto,
        corpo,
        anexos,
        confirmarLeitura: usuario.email
      });
  
      alert('E-mail enviado com sucesso!');
    } catch (erro) {
      console.error('Erro ao enviar e-mail:', erro);
      alert('Erro ao enviar e-mail.');
    }
  }
  
  