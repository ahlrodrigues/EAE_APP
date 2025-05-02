export function setupEventosEnvioEmail() {
    document.addEventListener('click', async (event) => {
      if (event.target.id === 'btnVerEnvioEmail') {
        await visualizarNotasSelecionadas();
      } else if (event.target.id === 'btnConfirmarEnvioEmail') {
        await enviarNotasPorEmail();
      }
    });
  }
  
  async function visualizarNotasSelecionadas() {
    try {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
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
      const nomesNotas = Array.from(checkboxes).map(cb => cb.dataset.nome);
  
      const usuario = await window.electronAPI.obterCadastro();
      const conteudos = await Promise.all(
        nomesNotas.map(nome => window.electronAPI.lerNota(nome))
      );
  
      const anexos = await window.electronAPI.gerarPdfAnexosParaEmail(conteudos, nomesNotas, tipoEnvio);
  
      const assunto = `EAE - Anotações de ${usuario.aluno}`;
      const corpo = `
        Olá ${usuario.dirigente},<br><br>
        Seguem em anexo as anotações do aluno(a) ${usuario.aluno}.<br><br>
        Atenciosamente,<br>
        Escola de Aprendizes do Evangelho
      `;
  
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
  