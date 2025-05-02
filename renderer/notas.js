document.addEventListener("DOMContentLoaded", async () => {
  try {
    const arquivos = await window.electronAPI.listarNotas();
    console.log("Arquivos encontrados:", arquivos);

    const tabela = document.querySelector("#tabelaNotas tbody");
    if (!tabela) {
      console.warn("⚠️ Tabela não encontrada.");
      return;
    }

    if (arquivos.length === 0) {
      tabela.innerHTML = "<tr><td colspan='5'>Nenhuma nota encontrada.</td></tr>";
      return;
    }

    tabela.innerHTML = "";

    for (const [index, nome] of arquivos.entries()) {
      try {
        const conteudo = await window.electronAPI.lerNota(nome);
        const data = nome.split("_")[0].split("-").reverse().join("-");
    
        const linha = `
          <tr>
            <td><input type="checkbox" data-nome="${nome}"></td>
            <td>${index + 1}</td>
            <td>${data}</td>
            <td><button class="verNota" data-nome="${nome}">Ver nota</button></td>
          </tr>
        `;
        tabela.insertAdjacentHTML("beforeend", linha);
      } catch (err) {
        console.error(`Erro ao carregar conteúdo da nota ${nome}:`, err);
      }
    }
    document.querySelector("#tabelaNotas tbody").addEventListener("click", (event) => {
      const btn = event.target.closest(".verNota");
      if (!btn) return;
    
      const nome = btn.dataset.nome;
      if (!nome) return;
    
      visualizarNota(nome);
    });
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
        
  } catch (error) {
    console.error("Erro ao listar notas:", error);
  }
});
