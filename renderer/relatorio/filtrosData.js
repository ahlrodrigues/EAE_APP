import { renderTabela } from './renderTabela.js';
import { arquivos } from './relatorio.js';

export function aplicarFiltros(lista) {
  const dataInicioInput = document.getElementById("dataInicio");
  const dataFimInput = document.getElementById("dataFim");

  function filtrarNotas() {
    const dataInicio = dataInicioInput.value ? new Date(dataInicioInput.value) : null;
    const dataFim = dataFimInput.value ? new Date(dataFimInput.value) : null;

    let listaFiltrada = arquivos;
    if (dataInicio || dataFim) {
      listaFiltrada = arquivos.filter(nome => {
        const dataNota = new Date(nome.substring(0, 10));
        if (dataInicio && dataNota < dataInicio) return false;
        if (dataFim && dataNota > dataFim) return false;
        return true;
      });
    }

    renderTabela(listaFiltrada);
  }

  if (dataInicioInput) dataInicioInput.addEventListener("change", filtrarNotas);
  if (dataFimInput) dataFimInput.addEventListener("change", filtrarNotas);
}
