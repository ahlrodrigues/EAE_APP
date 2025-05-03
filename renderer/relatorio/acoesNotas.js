import { exibirAviso, exibirConfirmacao } from '../ui/modalAviso.js'; 

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
  console.log("🧩 Ações das notas inicializadas");
  await refreshSenha();
  const senhaNota = await window.electronAPI.getSenhaUsuario();
  if (!senhaNota) {
    alert("Senha não carregada. Faça login novamente.");
    return;
  }

  const selecionadas = [];
  const checkboxes = document.querySelectorAll(".seletor-nota:checked");
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
    alert("Nenhuma nota pôde ser lida.");
    return;
  }

  // (opcional) Exibir nomes lidos
  const nomesLidos = selecionadas.map(n => `<li>${n.nome}</li>`).join("");
  await exibirAviso("Notas selecionadas", `<ul style="text-align:left">${nomesLidos}</ul>`);

  localStorage.setItem("notasSelecionadas", JSON.stringify(selecionadas));
  window.open("nota.html?multi=true", "_blank");
}


async function excluirSelecionadas() {
  console.log("🔴 Botão excluir clicado"); // debug

  const checkboxes = document.querySelectorAll(".seletor-nota:checked");

  if (checkboxes.length === 0) {
    exibirAviso("Nada selecionado", "Nenhuma nota foi selecionada para exclusão.");
    return;
  }

  const confirmado = await exibirConfirmacao(
    "Confirmar exclusão",
    "Tem certeza que deseja excluir as notas selecionadas?"
  );
  if (!confirmado) return;

  try {
    for (const checkbox of checkboxes) {
      const nomeNota = checkbox.dataset.nome;
      await window.electronAPI.excluirNota(nomeNota);
    }

    const novosArquivos = await window.electronAPI.listarNotas();
    const { renderTabela } = await import('./renderTabela.js');
    renderTabela(novosArquivos);

    exibirAviso("Sucesso", "Notas excluídas com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir notas:", error);
    exibirAviso("Erro", "Ocorreu um erro ao excluir as notas.");
  }
}
