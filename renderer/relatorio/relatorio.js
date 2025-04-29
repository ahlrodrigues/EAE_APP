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

// Exporte arquivos para outros módulos se precisar
export { arquivos };