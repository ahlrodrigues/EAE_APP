console.log("🚀 notas.js carregado!");

import { gerarNomeNota } from "./gerarNomeNota.js";
import { exibirAviso } from "./ui/modalAviso.js";
import { visualizarNota } from "../renderer/shared/visualizarNota.js";

// ✅ Formatação de data YYYY-MM-DD → DD-MM-YYYY
function formatarDataArquivo(nomeArquivo) {
  return nomeArquivo.split("_")[0].split("-").reverse().join("-");
}

// ✅ Carrega e exibe todas as notas na tabela
async function carregarNotas() {
  try {
    const arquivos = await window.electronAPI.listarNotas();
    console.log("📁 Arquivos encontrados:", arquivos);

    const tabelaContainer = document.getElementById("tabelaNotas");
    const tabela = tabelaContainer?.querySelector("tbody");

    if (!tabela) {
      console.warn("⚠️ Tabela ou tbody não encontrados.");
      return;
    }

    if (arquivos.length === 0) {
      tabela.innerHTML = "<tr><td colspan='5'>Nenhuma nota encontrada.</td></tr>";
      return;
    }

    tabela.innerHTML = "";

    for (const [index, nome] of arquivos.entries()) {
      try {
        const data = formatarDataArquivo(nome);
        const linha = `
          <tr>
            <td><input type="checkbox" data-nome="${nome}"></td>
            <td>${index + 1}</td>
            <td>${data}</td>
            <td><button class="verNota" data-nome="${nome}">Ver nota</button></td>
          </tr>
        `;
        tabela.insertAdjacentHTML("beforeend", linha);
      } catch (err) {
        console.error(`❌ Erro ao processar nota ${nome}:`, err);
      }
    }

    tabela.addEventListener("click", async (event) => {
      const btn = event.target.closest(".verNota");
      if (btn?.dataset?.nome) {
        await visualizarNota(btn.dataset.nome);
      }
    });
  } catch (error) {
    console.error("❌ Erro ao listar notas:", error);
    exibirAviso("Erro ao listar notas.");
  }
}

// ✅ Configura o formulário para salvar nova nota
function configurarFormulario() {
  const form = document.getElementById("formNota");

  if (!form) {
    console.warn("⚠️ Nenhum formulário 'formNota' encontrado. Essa tela pode não ser de cadastro.");
    return;
  }

  console.log("📌 Formulário localizado com ID 'formNota'");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📝 Envio do formulário iniciado");

    const data = document.getElementById("data")?.value;
    const fato = document.getElementById("fato")?.value.trim();
    const reacao = document.getElementById("reacao")?.value.trim();
    const sentimento = document.getElementById("sentimento")?.value.trim();
    const proposta = document.getElementById("proposta")?.value.trim();

    if (!data || !fato || !reacao || !sentimento || !proposta) {
      exibirAviso("Campos obrigatórios", "Preencha todos os campos antes de salvar.");
      return;
    }

    const textoNota = `
Data: ${data}
Fato: ${fato}
Reação: ${reacao}
Sentimento: ${sentimento}
Proposta renovadora: ${proposta}
`.trim();

    console.log("🧾 Conteúdo da nova nota:\n", textoNota);

    const senha = await window.electronAPI.getSenhaCriptografia();

    if (!senha) {
      exibirAviso("Erro", "Senha não carregada. Faça login novamente.");
      return;
    }

    try {
      const conteudoCriptografado = await window.electronAPI.criptografar(textoNota, senha);
      const nomeArquivo = await gerarNomeNota(data);

      await window.electronAPI.salvarNota(nomeArquivo, conteudoCriptografado);
      console.log("✅ Nota salva com sucesso:", nomeArquivo);
      exibirAviso("Nota salva", "✅ A nota foi salva com sucesso!");

      await carregarNotas(); // recarrega a lista na tabela

    } catch (error) {
      console.error("❌ Erro ao salvar nota:", error);
      exibirAviso("Erro", "Erro ao salvar nota.");
    }
  });
}

// ✅ Inicializa tudo ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  await carregarNotas();
  configurarFormulario();
});
