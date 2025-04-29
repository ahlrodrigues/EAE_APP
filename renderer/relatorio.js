// relatorio.js

window.addEventListener("DOMContentLoaded", async () => {
    const tabela = document.querySelector("#tabelaNotas tbody");
    const chkTodos = document.getElementById("selecionarTodos");
    const dataInicioInput = document.getElementById("dataInicio");
    const dataFimInput = document.getElementById("dataFim");
  
    let senhaNota = await window.electronAPI.getSenhaUsuario();
  
    async function refreshSenha() {
      senhaNota = await window.electronAPI.getSenhaUsuario();
      console.log('🔄 Senha recarregada da memória.');
    }
  
    function descriptografar(textoCriptografado, senha) {
      return window.electronAPI.descriptografar(textoCriptografado, senha);
    }
  
    function formatarData(data) {
      if (!data) return "";
      const partes = data.split("-");
      if (partes.length !== 3) return data;
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  
    function corrigirDataTexto(texto) {
      return texto.replace(/Data:\s*(\d{4})-(\d{2})-(\d{2})/g, (match, ano, mes, dia) => `Data: ${dia}-${mes}-${ano}`);
    }
  
    function quebrarCamposNota(texto) {
      const campos = { data: "", fato: "", reacao: "", sentimento: "", proposta: "" };
      texto.split("\n").forEach(linha => {
        if (linha.startsWith("Data:")) campos.data = linha.replace("Data:", "").trim();
        if (linha.startsWith("Fato:")) campos.fato = linha.replace("Fato:", "").trim();
        if (linha.startsWith("Reação:")) campos.reacao = linha.replace("Reação:", "").trim();
        if (linha.startsWith("Sentimento:")) campos.sentimento = linha.replace("Sentimento:", "").trim();
        if (linha.startsWith("Proposta:")) campos.proposta = linha.replace("Proposta:", "").trim();
      });
      return campos;
    }
  
    function filtrarNotasPorData(lista) {
      const dataInicio = dataInicioInput.value ? new Date(dataInicioInput.value) : null;
      const dataFim = dataFimInput.value ? new Date(dataFimInput.value) : null;
      if (!dataInicio && !dataFim) return lista;
      return lista.filter(nome => {
        const dataNome = nome.substring(0, 10);
        const [ano, mes, dia] = dataNome.split("-");
        const dataNota = new Date(`${ano}-${mes}-${dia}`);
        if (dataInicio && dataNota < dataInicio) return false;
        if (dataFim && dataNota > dataFim) return false;
        return true;
      });
    }
  
    async function renderTabela(lista) {
      tabela.innerHTML = "";
      const listaFiltrada = filtrarNotasPorData(lista);
      listaFiltrada.forEach((nome, index) => {
        const tr = document.createElement("tr");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "linha-selecao";
        checkbox.dataset.nome = nome;
  
        const tdCheckbox = document.createElement("td");
        tdCheckbox.appendChild(checkbox);
  
        const tdIndex = document.createElement("td");
        tdIndex.textContent = index + 1;
  
        const tdData = document.createElement("td");
        tdData.textContent = formatarData(nome.substring(0, 10));
  
        const tdAcao = document.createElement("td");
        const btnVer = document.createElement("button");
        btnVer.textContent = "Ver nota";
        btnVer.onclick = async () => {
          try {
            await refreshSenha();
            let conteudoCriptografado = await window.electronAPI.lerNota(nome);
            let conteudo = descriptografar(conteudoCriptografado, senhaNota);
            const partes = nome.substring(0, 10).split("-");
            const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
            localStorage.setItem("notaSelecionada", JSON.stringify({ data: dataFormatada, conteudo }));
            window.open("nota.html", "_blank");
          } catch (error) {
            console.error("Erro ao tentar visualizar nota:", error);
            alert("Erro ao tentar abrir a nota.");
          }
        };
        tdAcao.appendChild(btnVer);
  
        tr.appendChild(tdCheckbox);
        tr.appendChild(tdIndex);
        tr.appendChild(tdData);
        tr.appendChild(tdAcao);
        tabela.appendChild(tr);
      });
    }
  
    async function obterNotasSelecionadas() {
      const checkboxes = document.querySelectorAll(".linha-selecao:checked");
      const selecionadas = [];
      for (const checkbox of checkboxes) {
        const nomeNota = checkbox.dataset.nome;
        try {
          let conteudoCriptografado = await window.electronAPI.lerNota(nomeNota);
          let conteudo = descriptografar(conteudoCriptografado, senhaNota);
          selecionadas.push({ nome: nomeNota, conteudo });
        } catch (error) {
          console.error("Erro ao ler nota:", error);
        }
      }
      return selecionadas;
    }
  
    dataInicioInput.addEventListener("change", () => renderTabela(arquivos));
    dataFimInput.addEventListener("change", () => renderTabela(arquivos));
  
    document.getElementById("btnVisualizarSelecionados").onclick = async () => {
      const selecionadas = await obterNotasSelecionadas();
      if (selecionadas.length === 0) return alert("Nenhuma nota selecionada.");
      localStorage.setItem("notasSelecionadas", JSON.stringify(selecionadas));
      window.open("nota.html?multi=true", "_blank");
    };
  
    document.getElementById("btnExportarSelecionados").onclick = async () => {
      try {
        const selecionadas = await obterNotasSelecionadas();
        if (selecionadas.length === 0) return alert("Nenhuma nota selecionada.");
  
        const usuario = await window.electronAPI.lerUsuario();
        let conteudos = `
        <div style="font-family: Arial; padding: 2rem; background:white; text-align:center;">
          <img src="https://geea.com.br/imagem/trevo.png" alt="Logo Trevo" style="max-width: 150px; margin-bottom: 1rem;" />
          <h1>ESCOLA DE APRENDIZES DO EVANGELHO</h1>
          <div style="text-align:left;">
            <p><strong>Casa Espírita:</strong> ${usuario.casaEspírita || ""}</p>
            <p><strong>Número da Turma:</strong> ${usuario.numeroTurma || ""}</p>
            <p><strong>Dirigente:</strong> ${usuario.dirigente || ""}</p>
            <p><strong>Secretários:</strong> ${usuario.secretarios || ""}</p>
            <p><strong>Aluno:</strong> ${usuario.aluno || ""}</p>
          </div>
        </div>`;
  
        conteudos += selecionadas.map((nota) => {
          const campos = quebrarCamposNota(corrigirDataTexto(nota.conteudo));
          return `
          <div style="border:1px solid #ccc; margin:0.5rem 0; padding:1.5rem; background:#f9f9f9;">
            <p><strong>Data:</strong> ${campos.data}</p>
            <p><strong>Fato:</strong> ${campos.fato}</p>
            <p><strong>Reação:</strong> ${campos.reacao}</p>
            <p><strong>Sentimento:</strong> ${campos.sentimento}</p>
            <p><strong>Proposta:</strong> ${campos.proposta}</p>
          </div>`;
        }).join("");
  
        const agora = new Date();
        const dataHoraFormatada = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}_${String(agora.getHours()).padStart(2, '0')}_${String(agora.getMinutes()).padStart(2, '0')}_${String(agora.getSeconds()).padStart(2, '0')}`;
        const nomeAluno = (usuario.aluno || "Aluno").replace(/\s+/g, '_');
        const nomeArquivo = `${dataHoraFormatada}-${nomeAluno}.pdf`;
  
        await window.electronAPI.gerarPdfUnico(conteudos, nomeArquivo);
        alert("PDF gerado com sucesso!\nO arquivo foi salvo em Downloads/Anotações_EAE/");
      } catch (error) {
        console.error("Erro ao exportar:", error);
        alert("Erro ao exportar notas.");
      }
    };
  
    try {
      arquivos = await window.electronAPI.listarNotas();
      console.log("Arquivos encontrados:", arquivos);
      renderTabela(arquivos);
    } catch (error) {
      console.error("Erro ao listar notas:", error);
      alert("Erro ao carregar as notas.");
    }
  });
  