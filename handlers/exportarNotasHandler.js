import { exportarNotasSeparadas, exportarNotasUnico } from '../renderer/relatorio/exportarNotas.js';
import { exibirAviso } from '../renderer/ui/modalAviso.js'; // ajuste o caminho conforme necessário

export function inicializarBotaoExportar() {
  const btnExportar = document.getElementById('btnExportarSelecionados');
  const btnConfirmar = document.getElementById('confirmarExportacao');
  const modal = document.getElementById('modalExportar');

  if (!btnExportar || !btnConfirmar || !modal) {
    console.warn("⚠️ Elementos do botão ou modal de exportação não encontrados.");
    return;
  }

  btnExportar.addEventListener('click', async () => {
    const selecionadas = [...document.querySelectorAll('input.seletor-nota:checked')];

    if (selecionadas.length === 0) {
      exibirAviso(
        "Nenhuma anotação selecionada",
        "Por favor, selecione ao menos uma anotação para exportar."
      );
      return;
    }

    if (selecionadas.length === 1) {
      await exportarNotasUnico(selecionadas);
    
      exibirAviso(
        "A anotação foi exportada com sucesso.",
        `Arquivo(s) salvo(s) na pasta Downloads/Anotações_EAE.`
        );
    
      return;
    }
    

    // ✅ Se mais de uma, abre o modal para escolher tipo de exportação
    modal.style.display = 'flex';
  });

  btnConfirmar.addEventListener('click', async () => {
    const selecionadas = [...document.querySelectorAll('input.seletor-nota:checked')];
    const tipo = document.querySelector('input[name="tipoExportacao"]:checked')?.value;

    if (!selecionadas.length) {
      exibirAviso("Nada selecionado", "Selecione ao menos uma anotação para exportar.");
      return;
    }

    modal.style.display = 'none';

    if (tipo === 'unico') {
      await exportarNotasUnico(selecionadas);
    } else {
      await exportarNotasSeparadas(selecionadas);
    }
  });

  document.getElementById("fecharModalExportar")?.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
