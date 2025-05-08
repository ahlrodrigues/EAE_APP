import { gerarCorpoEmailDirigente, gerarCorpoEmailAluno } from '../shared/emailTemplates.js';
import { exibirAviso } from '../ui/modalAviso.js';

// 🔒 Flag global para evitar envios duplicados
let envioEmAndamento = false;

async function enviarNotasPorEmail(btn = null) {
  if (envioEmAndamento) {
    console.warn("⚠️ Envio já em andamento. Ignorado.");
    return;
  }

  envioEmAndamento = true;
  console.log("📤 Iniciando envio de e-mails...");

  try {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked')?.value || 'unico';

    const nomesNotas = Array.from(checkboxes)
      .map(cb => cb.dataset.nome)
      .filter(Boolean);

    if (nomesNotas.length === 0) {
      exibirAviso('❗ Nenhuma nota selecionada', 'Por favor, selecione ao menos uma nota para enviar.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando...';
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

    console.log("📧 Enviando e-mail ao dirigente...");
    await window.electronAPI.enviarEmail({
      para: usuario.emailDirigente,
      assunto: `EAE - Anotações de ${usuario.aluno}`,
      corpo: corpoDirigente,
      anexos,
      confirmarLeitura: null
    });

    console.log("📧 Enviando e-mail de confirmação ao aluno...");
    await window.electronAPI.enviarEmail({
      para: usuario.email,
      assunto: 'Confirmação de envio de anotações',
      corpo: corpoAluno,
      anexos: [],
      confirmarLeitura: null
    });

    console.log("✅ E-mails enviados com sucesso!");

    // Fecha o modal se estiver aberto
    const modal = document.getElementById('modalEnvioEmail');
    if (modal) modal.style.display = 'none';

    // Exibe o modal de aviso
    exibirAviso("✅ Sucesso", "E-mail enviado com sucesso!");
  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro);
    exibirAviso("❌ Erro", "Houve uma falha ao enviar o e-mail. Verifique os dados e tente novamente.");
  } finally {
    envioEmAndamento = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Enviar agora';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', async (event) => {
    const target = event.target;
    console.log("🖱️ Clique detectado:", target.id);

    // Botão do modal "Enviar agora"
    if (target.id === 'btnConfirmarEnvioEmail') {
      event.preventDefault(); // Se estiver dentro de um <form>
      console.log("🚀 Botão 'Enviar agora' clicado");
      await enviarNotasPorEmail(target);
      return;
    }

    // Botão direto na tela de relatório
    if (target.id === 'btnEnviarEmailDirigente') {
      console.log("🚀 Botão 'Enviar para Dirigente' clicado");
      await enviarNotasPorEmail(target);
      return;
    }

    // Fechar o modal
    if (target.id === 'btnFecharModalEnvio') {
      const modal = document.getElementById('modalEnvioEmail');
      if (modal) modal.style.display = 'none';
    }
  });
});
