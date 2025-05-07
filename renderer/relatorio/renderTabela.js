// 📋 Renderiza dinamicamente a tabela de notas no relatório
import { exibirAviso } from "../ui/modalAviso.js";

export async function renderizarTabela(lista) {
  console.log("🚀 renderTabela chamada!");

  const tabela = document.querySelector("#tabelaNotas tbody");
  if (!tabela) return;

  tabela.innerHTML = ""; // limpa a tabela antes de renderizar novamente

  for (const [index, nota] of lista.entries()) {
    const nome = nota.nomeArquivo;
    const tr = document.createElement("tr");
    tr.dataset.nome = nome;
  
    try {
      const senha = await window.electronAPI.getSenhaCriptografia();
      const conteudoCriptografado = await window.electronAPI.lerNota(nome);
    
      console.log(`🔐 Tentando descriptografar: ${nome}`);
      console.log("Senha usada:", senha);
      console.log("Criptografado:", conteudoCriptografado.slice(0, 100)); // mostra só início p/ evitar poluir o log
    
      if (!senha) {
        throw new Error("Senha de descriptografia não carregada");
      }
    
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);
      console.log(`📄 Conteúdo descriptografado da nota ${nome}:\n${conteudo}`);
      tr.dataset.conteudo = conteudo;
    } catch (erro) {
      console.error(`❌ Erro ao carregar ${nome}:`, erro);
      tr.dataset.conteudo = "[Erro ao carregar nota]";
    }
  
    // Checkbox
    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("seletor-nota");
    checkbox.dataset.nome = nome;
    tdCheckbox.appendChild(checkbox);
  
    // Índice
    const tdIndex = document.createElement("td");
    tdIndex.textContent = index + 1;
  
    // Data
    const tdData = document.createElement("td");
    tdData.textContent = formatarDataBrasileira(nota.data);
  
    // Botão
    const tdAcoes = document.createElement("td");
    const btnVer = document.createElement("button");
    btnVer.textContent = "Ver nota";
    btnVer.onclick = () => visualizarNota(nota.nomeArquivo);
    tdAcoes.appendChild(btnVer);
  
    tr.appendChild(tdCheckbox);
    tr.appendChild(tdIndex);
    tr.appendChild(tdData);
    tr.appendChild(tdAcoes);
    tabela.appendChild(tr);
  }
  

  // ✅ Reaplica o listener do "Selecionar Todas" após renderização
  requestAnimationFrame(() => {
    const masterCheckbox = document.getElementById("selecionarTodas");
    if (masterCheckbox) {
      masterCheckbox.addEventListener("change", () => {
        const checked = masterCheckbox.checked;
        const checkboxes = document.querySelectorAll("input.seletor-nota");
        checkboxes.forEach(cb => (cb.checked = checked));
        console.log(`☑️ Marcando ${checkboxes.length} notas como:`, checked);
      });
    } else {
      console.warn("⚠️ Master checkbox não encontrado.");
    }
  });
}

// 🗓️ Converte data YYYY-MM-DD para DD/MM/YYYY
function formatarDataBrasileira(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

// 👁️ Abre a nota em nova janela e armazena os dados no localStorage
async function visualizarNota(nome) {
  const senhaNota = await window.electronAPI.getSenhaCriptografia();
  if (!senhaNota) {
    exibirAviso("Erro", "Senha não carregada. Faça login novamente.");
    return;
  }

  try {
    const conteudoCriptografado = await window.electronAPI.lerNota(nome);

    localStorage.setItem("senhaCripto", senhaNota);
    localStorage.setItem("conteudoCriptografado", conteudoCriptografado);
    localStorage.setItem("dataNota", formatarDataBrasileira(nome.substring(0, 10)));

    await window.electronAPI.abrirNotaUnica({
      conteudo: conteudoCriptografado,
      senha: senhaNota
    });
  } catch (err) {
    console.error("❌ Erro ao abrir nota:", err);
    exibirAviso("Erro", "Erro ao abrir a nota.");
  }
}
