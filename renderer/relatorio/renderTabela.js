export async function renderTabela(lista) {
  console.log("🚀 renderTabela chamada!");
  const tabela = document.querySelector("#tabelaNotas tbody");
  if (!tabela) return;

  tabela.innerHTML = "";

  for (const [index, nome] of lista.entries()) {
    const tr = document.createElement("tr");
    tr.dataset.nome = nome;

    try {
      const senha = await window.electronAPI.getSenhaUsuario();
      const conteudoCriptografado = await window.electronAPI.lerNota(nome);
      const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);
      tr.dataset.conteudo = conteudo;
    } catch (erro) {
      console.error(`Erro ao carregar conteúdo da nota ${nome}:`, erro);
      tr.dataset.conteudo = "[Erro ao carregar]";
    }

    const checkboxes = document.querySelectorAll('input.seletor-nota[type="checkbox"]:checked');
    const tdCheckbox = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("seletor-nota");
  checkbox.dataset.nome = nome;
  tdCheckbox.appendChild(checkbox);

  console.log("✅ Checkbox criado com classe:", checkbox.className);
  
    const tdIndex = document.createElement("td");
    tdIndex.textContent = index + 1;

    const tdData = document.createElement("td");
    const dataBruta = nome.substring(0, 10);
    tdData.textContent = formatarData(dataBruta);

    const tdAcoes = document.createElement("td");
    const btnVer = document.createElement("button");
    btnVer.textContent = "Ver nota";
    btnVer.onclick = () => visualizarNota(nome);
    tdAcoes.appendChild(btnVer);

    tr.appendChild(tdCheckbox);
    tr.appendChild(tdIndex);
    tr.appendChild(tdData);
    tr.appendChild(tdAcoes);

    tabela.appendChild(tr);
  }

  // ✅ Reaplicar o listener do "Selecionar todas"
  requestAnimationFrame(() => {
    const masterCheckbox = document.getElementById("selecionarTodas");
    if (masterCheckbox) {
      masterCheckbox.addEventListener("change", () => {
        const checked = masterCheckbox.checked;
        const checkboxes = document.querySelectorAll("input.seletor-nota");
        console.log(`☑️ Selecionando ${checkboxes.length} notas`);
        checkboxes.forEach(cb => {
          cb.checked = checked;
          console.log(" →", cb.dataset.nome, "=", cb.checked);
        });
      });
    } else {
      console.warn("⚠️ Master checkbox não encontrado após renderTabela.");
    }
  });
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}-${mes}-${ano}`;
}

async function visualizarNota(nome) {
  const senhaNota = await window.electronAPI.getSenhaUsuario();
  if (!senhaNota) {
    alert("Senha não carregada. Faça login novamente.");
    return;
  }

  try {
    const conteudoCriptografado = await window.electronAPI.lerNota(nome);
    const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senhaNota);

    const partes = nome.substring(0, 10).split("-");
    const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

    localStorage.setItem("notaSelecionada", JSON.stringify({ data: dataFormatada, conteudo }));
    window.open("nota.html", "_blank");
  } catch (error) {
    console.error("Erro ao visualizar nota:", error);
    alert("Erro ao abrir a nota.");
  }
}
