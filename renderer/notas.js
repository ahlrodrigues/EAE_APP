console.log("🚀 notas.js carregado!");

import { gerarNomeNota } from "./gerarNomeNota.js";
import { exibirAviso } from "./ui/modalAviso.js";

document.addEventListener("DOMContentLoaded", async () => {
  await carregarNotas();
  configurarFormulario();
});

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
        const data = nome.split("_")[0].split("-").reverse().join("-");
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
        console.error(`❌ Erro ao carregar nota ${nome}:`, err);
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
  }
}

function configurarFormulario() {
  const form = document.getElementById("formNota");

  if (!form) {
    console.error("❌ Formulário com ID 'formNota' não encontrado");
    return;
  }

  console.log("📌 Formulário localizado com ID 'formNota'");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📝 Evento de submit disparado");

    const data = document.getElementById("data")?.value;
    const fato = document.getElementById("fato")?.value.trim();
    const reacao = document.getElementById("reacao")?.value.trim();
    const sentimento = document.getElementById("sentimento")?.value.trim();
    const proposta = document.getElementById("proposta")?.value.trim();

    console.log("📥 Dados capturados:", { data, fato, reacao, sentimento, proposta });

    if (!data || !fato || !reacao || !sentimento || !proposta) {
      exibirAviso("Campos obrigatórios", "Por favor, preencha todos os campos antes de salvar.");
      console.warn("⚠️ Campos obrigatórios ausentes");
      return;
    }

    const textoNota = `
Data: ${data}
Fato: ${fato}
Reação: ${reacao}
Sentimento: ${sentimento}
Proposta renovadora: ${proposta}
`.trim();

    console.log("🧾 Texto final da nota:\n", textoNota);

    const senha = await window.electronAPI.getSenhaCriptografia();
    console.log("🔐 Senha de criptografia retornada:", senha);

    if (!senha) {
      exibirAviso("Senha não carregada. Faça login novamente.");
      console.error("❌ Senha de criptografia indefinida");
      return;
    }

    try {
      const conteudoCriptografado = await window.electronAPI.criptografar(textoNota, senha);
      console.log("🔒 Conteúdo criptografado:", conteudoCriptografado);

      const nomeArquivo = await gerarNomeNota(data);
      console.log("📁 Nome do arquivo a ser salvo:", nomeArquivo);

      await window.electronAPI.salvarNota(nomeArquivo, conteudoCriptografado);
      console.log("✅ Nota salva com sucesso");

      exibirAviso("Nota salva", "✅ Nota salva com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao salvar nota:", error);
      exibirAviso("Erro ao salvar nota.");
    }
  });
}

async function visualizarNota(nome) {
  const senhaNota = await window.electronAPI.getSenhaCriptografia();
  if (!senhaNota) {
    exibirAviso("Senha não carregada. Faça login novamente.");
    return;
  }

  try {
    const conteudoCriptografado = await window.electronAPI.lerNota(nome);
    const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senhaNota);

    const partes = nome.substring(0, 10).split("-");
    const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

    localStorage.setItem("notaSelecionada", JSON.stringify({ data: dataFormatada, conteudo }));
    window.open("nota.html", "_blank");
  } catch (error) {
    console.error("❌ Erro ao visualizar nota:", error);
    exibirAviso("Erro ao abrir a nota.");
  }
}
