export function setupEventosEnvioEmail() {
  console.log('setupEventosEnvioEmail foi chamado');

  // Escuta cliques em toda a página (útil para elementos recriados dinamicamente)
  document.addEventListener('click', async (event) => {
    const id = event.target.id;
    console.log('🖱️ Clique detectado:', id);

    if (id === 'btnVerEnvioEmail') {
      await visualizarNotasSelecionadas();
    } else if (id === 'btnConfirmarEnvioEmail') {
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
      alert('❗ Nenhuma nota selecionada corretamente.');
      return;
    }

    console.log("📋 Notas selecionadas para visualização:", nomesNotas);

    const conteudos = await Promise.all(
      nomesNotas.map(nome => window.electronAPI.lerNota(nome))
    );

    const htmlFinal = conteudos.map(c => `
      <div class="notaVisualizada" style="margin-bottom:2rem; border:1px solid #ccc; padding:1rem; border-radius:8px;">
        <pre>${c}</pre>
      </div>
    `).join('<hr>');

    await window.electronAPI.abrirVisualizacaoNotas(htmlFinal);
  } catch (erro) {
    console.error('❌ Erro ao visualizar notas:', erro);
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
      alert('❗ Nenhuma nota selecionada corretamente.');
      return;
    }

    console.log("📤 Enviando notas:", nomesNotas, "Tipo:", tipoEnvio);

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

    await window.electronAPI.enviarEmail({
      para: usuario.emailDirigente,
      assunto,
      corpo,
      anexos,
      confirmarLeitura: usuario.email
    });

    alert('✅ E-mail enviado com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro);
    alert('Erro ao enviar e-mail.');
  }
}
document.addEventListener('click', async (event) => {
  const id = event.target.id;
  console.log('🖱️ Clique detectado:', id);

  if (id === 'btnVerEnvioEmail') {
    await visualizarNotasSelecionadas();
  }

  if (id === 'btnConfirmarEnvioEmail') {
    await enviarNotasPorEmail();
  }
});
document.getElementById('btnFecharModalEnvio')?.addEventListener('click', () => {
  document.getElementById('modalEnvioEmail').style.display = 'none';
});