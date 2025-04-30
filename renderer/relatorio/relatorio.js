import { inicializarSelecaoTodos } from './selecionarTodos.js';
import { inicializarAcoesNotas } from './acoesNotas.js';
import { renderTabela } from './renderTabela.js';
import { aplicarFiltros } from './filtrosData.js';

let arquivos = [];

window.addEventListener("DOMContentLoaded", async () => {
  inicializarSelecaoTodos();
  inicializarAcoesNotas();

  try {
    arquivos = await window.electronAPI.listarNotas();
    console.log("Arquivos encontrados:", arquivos);
    renderTabela(arquivos);
  } catch (error) {
    console.error("Erro ao listar notas:", error);
    alert("Erro ao carregar as notas.");
  }

  aplicarFiltros(arquivos);
});

import { exportarNotasUnico, exportarNotasSeparadas } from './exportarNotas.js';
import { configurarModalExportacao } from './modalExportacao.js';

document.addEventListener('DOMContentLoaded', () => {
  configurarModalExportacao();

  document.getElementById('btnExportarSelecionados').addEventListener('click', () => {
    const selecionadas = document.querySelectorAll('#tabelaNotas tbody input[type="checkbox"]:checked');
    if (selecionadas.length === 0) return alert("Selecione ao menos uma nota.");

    if (selecionadas.length === 1) {
      exportarNotasSeparadas([...selecionadas]);
    } else {
      document.getElementById('modalExportar').style.display = 'flex';
    }
  });

  // outras funções: carregarNotas(), renderTabela(), etc.
});

// Exporte arquivos para outros módulos se precisar
export { arquivos };