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
    console.log("📁 Arquivos retornados pelo listarNotas:", arquivos);

    const selecionadas = JSON.parse(sessionStorage.getItem("notasSelecionadas") || "[]");
    console.log("📤 Nomes das notas selecionadas do sessionStorage:", selecionadas);

    if (Array.isArray(selecionadas) && selecionadas.length > 0) {
      const notasFiltradas = arquivos.filter(nota => selecionadas.includes(nota.nomeArquivo));
      console.log("📌 Notas filtradas para exibição:", notasFiltradas);

      renderTabela(notasFiltradas);
      aplicarFiltros(notasFiltradas);
      sessionStorage.removeItem("notasSelecionadas");
    } else {
      console.log("🔁 Sem seleção prévia. Exibindo todas as notas.");
      renderTabela(arquivos);
      aplicarFiltros(arquivos);
    }

    inicializarAcoesNotas();
  })
  .catch(error => {
    console.error("❌ Erro ao listar notas:", error);
    exibirAviso("Erro ao carregar", "Não foi possível carregar as notas. Tente novamente.");
  });

}

async function visualizarSelecionadas() {
  const checkboxes = document.querySelectorAll('input.seletor-nota[type="checkbox"]:checked');
  const nomes = Array.from(checkboxes)
    .map(cb => cb.value || cb.dataset.nome)
    .filter(nome => !!nome);

  if (nomes.length === 0) {
    alert("Nenhuma nota selecionada.");
    return;
  }

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

  if (notas.length === 0) {
    alert("Nenhuma nota pôde ser lida.");
    return;
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
    .catch(async error => {
      console.error("❌ Erro ao abrir a nota:", error);
      exibirAviso("Erro ao abrir", "Não foi possível abrir a nota selecionada.");

      // 🔁 Recarrega a lista de notas após erro
      try {
        const todasNotas = await window.electronAPI.listarNotas();
        renderTabela(todasNotas);
        aplicarFiltros(todasNotas);
      } catch (erroRecarregar) {
        console.error("❌ Erro ao recarregar notas após falha:", erroRecarregar);
      }
    });
}
