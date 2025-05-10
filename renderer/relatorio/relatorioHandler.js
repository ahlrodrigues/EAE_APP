// 📦 Módulo de relatório - manipula a visualização, exportação e filtros de notas
console.log("📦 relatorioHandler carregado");

// === IMPORTS ===
import { renderizarTabela } from '../relatorio/renderTabela.js';
import { exibirAviso } from '../ui/modalAviso.js';
import { inicializarBotaoExportar } from '../../handlers/exportarNotasHandler.js';
import { aplicarFiltros } from './filtrosData.js';
import { inicializarAcoesNotas } from './acoesNotas.js';
import { visualizarNota } from '../shared/visualizarNota.js';
import { listarNotas } from '../listarNotas.js'; // Função que lê os arquivos de nota

// === FUNÇÃO PRINCIPAL ===
export async function inicializarRelatorio() {
  console.log("🔄 Inicializando o módulo de relatórios...");

  try {
    const lista = await listarNotas();
    console.log("📦 Lista de notas recebida:", lista);
    renderizarTabela(lista);
  } catch (erro) {
    console.error("❌ Erro ao carregar e renderizar notas:", erro);
  }

  inicializarBotaoExportar();

  document.getElementById('btnFiltrar')?.addEventListener('click', filtrarNotasPorData);
  document.getElementById('selecionarTodos')?.addEventListener('change', selecionarTodas);
  document.getElementById('btnVisualizarSelecionados')?.addEventListener('click', visualizarSelecionadas);

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-ver-nota')) {
      const nomeArquivo = event.target.dataset.nome;
      visualizarNota(nomeArquivo);
    }
  });
}

// === VISUALIZAÇÃO DE MÚLTIPLAS NOTAS ===
async function visualizarSelecionadas() {
  // 🔘 Coleta os nomes dos arquivos das notas selecionadas
  const checkboxes = document.querySelectorAll('input.seletor-nota[type="checkbox"]:checked');
  const nomes = Array.from(checkboxes)
    .map(cb => cb.dataset.nome)
    .filter(Boolean);

  if (nomes.length === 0) {
    exibirAviso("Nenhuma nota selecionada", "Por favor, selecione ao menos uma nota.");
    return;
  }

  // 🔐 Recupera a senha para descriptografar as notas
  const senha = await window.electronAPI.getSenhaCriptografia();
  const notas = [];

  for (const nome of nomes) {
    try {
      const conteudoCriptografado = await window.electronAPI.lerNota(nome);
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);

      // 🔍 Extrai a data no formato YYYY-MM-DD e converte para DD-MM-YY
      const matchData = conteudo.match(/^\s*Data:\s*(\d{4})-(\d{2})-(\d{2})/m);
      const dataFormatada = matchData
        ? `${matchData[3]}-${matchData[2]}-${matchData[1].slice(-2)}`
        : "Data não encontrada";

      // 🔄 Atualiza a linha da data no conteúdo para DD-MM-YYYY (visual)
      const linhas = conteudo.split(/\r?\n/);
      const novasLinhas = linhas.map(linha => {
        const match = linha.match(/^\s*Data:\s*(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          const novaData = `Data: ${match[3]}-${match[2]}-${match[1]}`;
          console.log("🔁 Linha original da data encontrada:", linha);
          console.log("✅ Linha modificada para:", novaData);
          return novaData;
        }
        return linha;
      });

      const conteudoComDataFormatada = novasLinhas.join("\n");

      // ✅ Armazena nota com conteúdo e data formatados
      notas.push({ nome, data: dataFormatada, conteudo: conteudoComDataFormatada });

      console.group(`📄 Nota descriptografada: ${nome}`);
      console.log("🧾 Conteúdo (início):", conteudoComDataFormatada?.substring(0, 100));
      console.groupEnd();
    } catch (error) {
      console.error(`❌ Erro ao carregar nota ${nome}:`, error);
    }
  }

  if (notas.length === 0) {
    exibirAviso("Erro", "Nenhuma nota pôde ser lida.");
    return;
  }

  // 📄 Gera o conteúdo HTML das notas para visualização
  const conteudoHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Notas Selecionadas</title>
  <style>
    body {
      background: #ecfae0;
      font-family: Arial, sans-serif;
      padding: 2rem;
      margin: 0;
    }
    .notaVisualizada {
      border: 1px solid #ccc;
      border-radius: 8px;
      background: white;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-size: 1rem; /* ✅ Aumenta a fonte */
  line-height: 1.6;  /* ✅ Opcional: melhora a leitura */
}
    hr {
      border: none;
      border-top: 1px dashed #999;
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  ${notas.map(nota => `
    <div class="notaVisualizada">
      <pre>${nota.conteudo}</pre>
    </div>
  `).join("")}
</body>
</html>
`;

  console.log("📦 HTML gerado para visualização:", conteudoHTML);

  try {
    await window.electronAPI.abrirNotaMulti(conteudoHTML);
    console.log("🔄 Janela de múltiplas notas aberta.");
  } catch (err) {
    console.error("❌ Erro ao abrir a janela de múltiplas notas:", err);
  }
}



// === FILTRO POR DATA ===
function filtrarNotasPorData() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  window.electronAPI.filtrarNotas(dataInicio, dataFim)
    .then(renderizarTabela)
    .catch(error => console.error("❌ Erro ao filtrar notas:", error));
}

// === MARCAR/DESMARCAR TODAS AS NOTAS ===
function selecionarTodas(event) {
  const checked = event.target.checked;
  const checkboxes = document.querySelectorAll("input[type=checkbox].seletor-nota");
  console.log(`☑️ Marcando ${checkboxes.length} notas`);
  checkboxes.forEach(cb => cb.checked = checked);
}
