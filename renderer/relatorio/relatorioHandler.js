// ✅ Imports do renderer
console.log("📦 relatorioHandler carregado");

import { renderizarTabela } from '../relatorio/renderTabela.js';
import { exibirAviso } from '../ui/modalAviso.js';
import { inicializarBotaoExportar } from '../../handlers/exportarNotasHandler.js'; // este ainda pode estar no main, se só manipular dados
import { aplicarFiltros } from './filtrosData.js';
import { inicializarAcoesNotas } from './acoesNotas.js';
import { visualizarNota } from '../shared/visualizarNota.js';
import { listarNotas } from '../listarNotas.js'; // Importa a função listarNotas


// ✅ Export principal
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


// ✅ Visualizar múltiplas notas selecionadas
async function visualizarSelecionadas() {
  const checkboxes = document.querySelectorAll('input.seletor-nota[type="checkbox"]:checked');
  const nomes = Array.from(checkboxes)
    .map(cb => cb.value || cb.dataset.nome)
    .filter(Boolean);

  if (nomes.length === 0) {
    exibirAviso("Nenhuma nota selecionada", "Por favor, selecione ao menos uma nota.");
    return;
  }

  const senha = await window.electronAPI.getSenhaCriptografia();
  const notas = [];

  for (const nome of nomes) {
    try {
      const conteudoCriptografado = await window.electronAPI.lerNota(nome);
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);
      console.group(`📄 Nota descriptografada: ${nome}`);
      console.log("🧾 Conteúdo (início):", conteudo?.substring(0, 100));
      console.groupEnd();

      const dataBruta = nome.substring(0, 10).split("-").reverse().join("-");
      notas.push({ nome, data: dataBruta, conteudo });
    } catch (error) {
      console.error(`❌ Erro ao carregar nota ${nome}:`, error);
    }
  }

  if (notas.length === 0) {
    exibirAviso("Erro", "Nenhuma nota pôde ser lida.");
    return;
  }

  localStorage.setItem("notasSelecionadas", JSON.stringify(notas));
  console.log("📦 Notas selecionadas salvas:", notas);

  await window.electronAPI.abrirNotaMulti();
  console.log("🔄 Notas abertas na nova janela.");
}

// ✅ Filtro por data
function filtrarNotasPorData() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  window.electronAPI.filtrarNotas(dataInicio, dataFim)
    .then(renderizarTabela)
    .catch(error => console.error("❌ Erro ao filtrar notas:", error));
}

// ✅ Marcar/desmarcar todos os checkboxes
function selecionarTodas(event) {
  const checked = event.target.checked;
  const checkboxes = document.querySelectorAll("input[type=checkbox].seletor-nota");
  console.log(`☑️ Marcando ${checkboxes.length} notas`);
  checkboxes.forEach(cb => cb.checked = checked);
}
