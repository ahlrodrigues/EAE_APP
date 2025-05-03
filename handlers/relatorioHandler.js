import { renderTabela } from '../renderer/relatorio/renderTabela.js';
import { exibirAviso } from '../renderer/ui/modalAviso.js'; 
import { inicializarBotaoExportar } from './exportarNotasHandler.js';
import { aplicarFiltros } from '../renderer/relatorio/filtrosData.js'; 
import { inicializarAcoesNotas } from '../renderer/relatorio/acoesNotas.js';


export function inicializarRelatorio() {
  console.log('📄 Relatório carregado');
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

  window.electronAPI.listarNotas()
    .then(arquivos => {
      console.log("📁 Arquivos encontrados:", arquivos);
      renderTabela(arquivos);
      aplicarFiltros(arquivos);
      inicializarAcoesNotas(); 
    })
    .catch(error => {
      console.error("❌ Erro ao listar notas:", error);
      exibirAviso("Erro ao carregar", "Não foi possível carregar as notas. Tente novamente.");
    });
}

async function visualizarSelecionadas() {
  const selecionadas = document.querySelectorAll("input.seletor-nota:checked");

  if (selecionadas.length === 0) {
    exibirAviso(
      "Nenhuma anotação selecionada",
      `Por favor, selecione ao menos uma anotação para continuar.`
    );
    return;
  }

  const nomes = Array.from(selecionadas).map(cb => cb.dataset.nome);
  const senha = await window.electronAPI.getSenhaUsuario();
  const notas = [];

  for (const nome of nomes) {
    try {
      const conteudoCriptografado = await window.electronAPI.lerNota(nome);
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);
      const dataBruta = nome.substring(0, 10).split("-").reverse().join("-");
      notas.push({ nome, data: dataBruta, conteudo });
    } catch (error) {
      console.error(`Erro ao carregar nota ${nome}:`, error);
    }
  }

  localStorage.setItem("notasSelecionadas", JSON.stringify(notas));
  window.open("nota.html?multi=true", "_blank");
}

function filtrarNotasPorData() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  window.electronAPI.filtrarNotas(dataInicio, dataFim)
    .then(renderTabela)
    .catch(error => console.error("Erro ao filtrar notas:", error));
}

function selecionarTodas(event) {
  const checked = event.target.checked;
  const checkboxes = document.querySelectorAll("input[type=checkbox].seletor-nota");
  console.log(`☑️ Marcando ${checkboxes.length} notas`);
  checkboxes.forEach(cb => cb.checked = checked);
}

function visualizarNota(nomeArquivo) {
  window.electronAPI.abrirNota(nomeArquivo)
  .then(conteudo => {
    exibirAviso("Anotação", `<pre style="text-align:left">${conteudo}</pre>`);
  })
  .catch(error => {
    exibirAviso("Erro ao abrir", "Não foi possível abrir a nota selecionada.");
  })
}