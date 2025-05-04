import { gerarCorpoEmailDirigente, gerarCorpoEmailAluno } from '../shared/emailTemplates.js';

async function enviarNotasPorEmail() {
  try {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked')?.value || 'unico';

    const nomesNotas = Array.from(checkboxes)
      .map(cb => cb.dataset.nome)
      .filter(Boolean);

    if (nomesNotas.length === 0) {
      alert('❗ Nenhuma nota selecionada corretamente.');
      return;
    }

    const usuario = await window.electronAPI.obterCadastro();
    const senha = await window.electronAPI.getSenhaUsuario();

    const conteudos = await Promise.all(
      nomesNotas.map(async (nome) => {
        const cripto = await window.electronAPI.lerNota(nome);
        return await window.electronAPI.descriptografar(cripto, senha);
      })
    );

    const anexos = await window.electronAPI.gerarPdfAnexosParaEmail(
      conteudos,
      nomesNotas,
      tipoEnvio
    );

    const corpoDirigente = gerarCorpoEmailDirigente(usuario.dirigente, usuario.aluno, 'pt');
    const corpoAluno = gerarCorpoEmailAluno(usuario.aluno, 'pt');

    // E-mail para dirigente
    await window.electronAPI.enviarEmail({
      para: usuario.emailDirigente,
      assunto: `EAE - Anotações de ${usuario.aluno}`,
      corpo: corpoDirigente,
      anexos,
      confirmarLeitura: null
    });

    // Confirmação para aluno
    await window.electronAPI.enviarEmail({
      para: usuario.email,
      assunto: 'Confirmação de envio de anotações',
      corpo: corpoAluno,
      anexos: [],
      confirmarLeitura: null
    });

    alert('✅ E-mails enviados com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro);
    alert('Erro ao enviar e-mail.');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (event) => {
    if (event.target.id === 'btnConfirmarEnvioEmail') {
      enviarNotasPorEmail();
    }

    if (event.target.id === 'btnFecharModalEnvio') {
      const modal = document.getElementById('modalEnvioEmail');
      if (modal) modal.style.display = 'none';
    }
  });
});
