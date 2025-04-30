import { exportarNotasUnico, exportarNotasSeparadas } from './exportarNotas.js';

export function configurarModalExportacao() {
  const modal = document.getElementById('modalExportar');
  const btnConfirmar = document.getElementById('confirmarExportacao');

  btnConfirmar.addEventListener('click', async () => {
    const tipo = document.querySelector('input[name="tipoExportacao"]:checked').value;
    const selecionadas = [...document.querySelectorAll('#tabelaNotas tbody input[type="checkbox"]:checked')];

    modal.style.display = 'none';

    if (tipo === 'unico') {
      await exportarNotasUnico(selecionadas);
    } else {
      await exportarNotasSeparadas(selecionadas);
    }
  });
}
