import { arquivos } from './relatorio.js';
import { refreshSenha } from './utilitarios.js';

export function inicializarAcoesNotas() {
  const btnVisualizar = document.getElementById("btnVisualizarSelecionados");
  const btnExcluir = document.getElementById("btnExcluirSelecionados");

  if (btnVisualizar) {
    btnVisualizar.addEventListener("click", visualizarSelecionadas);
  }

  if (btnExcluir) {
    btnExcluir.addEventListener("click", excluirSelecionadas);
  }
}

async function visualizarSelecionadas() {
  await refreshSenha();
  const senhaNota = await window.electronAPI.getSenhaUsuario();
  if (!senhaNota) {
    alert("Senha não carregada. Faça login novamente.");
    return;
  }

  const selecionadas = [];
  const checkboxes = document.querySelectorAll(".linha-selecao:checked");
  for (const checkbox of checkboxes) {
    const nomeNota = checkbox.dataset.nome;
    try {
      const conteudoCriptografado = await window.electronAPI.lerNota(nomeNota);
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senhaNota);
      selecionadas.push({ nome: nomeNota, conteudo });
    } catch (error) {
      console.error(`Erro ao ler nota: ${nomeNota}`, error);
    }
  }

  if (selecionadas.length === 0) {
    alert("Nenhuma nota selecionada.");
    return;
  }

  localStorage.setItem("notasSelecionadas", JSON.stringify(selecionadas));
  window.open("nota.html?multi=true", "_blank");
}

async function excluirSelecionadas() {
  const checkboxes = document.querySelectorAll(".linha-selecao:checked");
  if (checkboxes.length === 0) {
    alert("Nenhuma nota selecionada para excluir.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir as notas selecionadas?")) return;

  try {
    for (const checkbox of checkboxes) {
      const nomeNota = checkbox.dataset.nome;
      await window.electronAPI.excluirNota(nomeNota);
    }

    // Atualizar lista após exclusão
    const novosArquivos = await window.electronAPI.listarNotas();
    const { renderTabela } = await import('./renderTabela.js');
    renderTabela(novosArquivos);

    alert("Notas excluídas com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir notas:", error);
    alert("Erro ao excluir notas.");
  }
}