import { gerarCorpoEmailDirigente, gerarCorpoEmailAluno } from '../shared/emailTemplates.js';
import { exibirAviso } from '../ui/modalAviso.js';

// 🔒 Flag global para evitar múltiplos envios simultâneos
let envioEmAndamento = false;

async function enviarNotasPorEmail(botao = null) {
  if (envioEmAndamento) {
    console.warn("⚠️ Envio já em andamento. Ignorado.");
    return;
  }

  envioEmAndamento = true;
  console.log("📤 Iniciando envio de e-mails...");

  // 🔄 Atualiza visual do botão
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Enviando...';
  }

  try {
    // 🔍 Coleta as notas selecionadas
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked')?.value || 'unico';

    const nomesNotas = Array.from(checkboxes)
      .map(cb => cb.dataset.nome)
      .filter(Boolean);

    if (nomesNotas.length === 0) {
      exibirAviso('❗ Nenhuma nota selecionada', 'Por favor, selecione ao menos uma nota para enviar.');
      return;
    }

    // 👤 Coleta dados do usuário e senha
    const usuario = await window.electronAPI.obterCadastro();
    const senha = await window.electronAPI.getSenhaCriptografia();

    console.log("🔑 Senha usada para descriptografar no envioEmailNotas.js:", senha);

    if (!senha) {
      throw new Error("Senha de descriptografia não encontrada. Faça login novamente.");
    }

    // 🔓 Descriptografa as notas selecionadas
    const conteudos = await Promise.all(
      nomesNotas.map(async (nome) => {
        const cripto = await window.electronAPI.lerNota(nome);
        return await window.electronAPI.descriptografar(cripto, senha);
      })
    );

    // 📄 Gera os anexos em PDF
    const anexos = await window.electronAPI.gerarPdfAnexosParaEmail(
      conteudos,
      nomesNotas,
      tipoEnvio
    );

    // ✉️ Gera os corpos dos e-mails
    const corpoDirigente = gerarCorpoEmailDirigente(usuario.dirigente, usuario.aluno, 'pt');
    const corpoAluno = gerarCorpoEmailAluno(usuario.aluno, 'pt');

    // 📤 Envia para dirigente
    console.log("📧 Enviando e-mail ao dirigente...");
    await window.electronAPI.enviarEmail({
      para: usuario.emailDirigente,
      assunto: `EAE - Anotações de ${usuario.aluno}`,
      corpo: corpoDirigente,
      anexos,
      confirmarLeitura: null
    });

    // 📤 Confirmação para aluno
    console.log("📧 Enviando e-mail de confirmação ao aluno...");
    await window.electronAPI.enviarEmail({
      para: usuario.email,
      assunto: 'Confirmação de envio de anotações',
      corpo: corpoAluno,
      anexos: [],
      confirmarLeitura: null
    });

    console.log("✅ E-mails enviados com sucesso!");

    // ✅ Fecha modal de envio (caso esteja aberto)
    document.getElementById('modalEnvioEmail')?.classList.remove('ativo');
    modal.style.display = 'none';

    // ✅ Exibe aviso de sucesso
    exibirAviso("✅ Sucesso", "E-mail enviado com sucesso!");

  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro);
    exibirAviso("❌ Erro", erro.message || "Houve uma falha ao enviar o e-mail. Verifique os dados e tente novamente.");
  } finally {
    // 🔄 Restaura botão
    envioEmAndamento = false;
    if (botao) {
      botao.disabled = false;
      botao.textContent = 'Enviar agora';
    }
  }
}

// 📌 Inicializa os listeners após DOM carregado
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (target.id.startsWith("btnEnviar") || target.id === "btnFecharModalEnvio") {
      console.log("🖱️ Clique relevante detectado:", target.id);
    }

    // ▶️ Botão "Enviar agora" do modal
    if (target.id === 'btnConfirmarEnvioEmail') {
      event.preventDefault(); // Impede envio se dentro de um form
      console.log("🚀 Botão 'Enviar agora' clicado");
      await enviarNotasPorEmail(target);
      return;
    }

    // ▶️ Botão direto na tela
    if (target.id === 'btnEnviarEmailDirigente') {
      console.log("🚀 Botão 'Enviar para Dirigente' clicado");
      await enviarNotasPorEmail(target);
      return;
    }

    // ❌ Botão de fechar o modal
    if (target.id === 'btnFecharModalEnvio') {
      console.log("🚀 Botão 'Fechar modal' clicado");
      const modal = document.getElementById('modalEnvioEmail');
      if (modal) modal.style.display = 'none';
    }
  });
});
