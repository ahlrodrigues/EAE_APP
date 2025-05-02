export function adicionarEventosTabela(windowAPI = window.electronAPI) {
    // botão "Ver"
    document.querySelectorAll(".verNota").forEach(botao => {
      botao.addEventListener("click", async (e) => {
        const nomeArquivo = e.target.dataset.filename;
        const { conteudo } = await window.electronAPI.lerNota(nomeArquivo);
  
        if (!conteudo) {
          alert("Erro ao carregar nota.");
          return;
        }
  
        // Aplica o layout padrão de visualização
        const novaJanela = window.open("", "_blank", "width=600,height=600");
        novaJanela.document.write(`
          <html>
          <head>
            <title>Visualização da Nota</title>
            <style>
              body { font-family: Arial; padding: 2rem; }
              .nota { border: 1px solid #ccc; border-radius: 8px; padding: 1rem; background: #f9f9f9; }
              .nota-campo { margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="nota">
              ${conteudo.replace(/\n/g, "<br>")}
            </div>
          </body>
          </html>
        `);
      });
    });
  
    // botão "Selecionar Todos"
    const chkTodos = document.getElementById("selecionarTodos");
    if (chkTodos) {
      chkTodos.addEventListener("change", () => {
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = chkTodos.checked);
      });
    }
  
    // botão "Ver Selecionadas"
    const btnVerSelecionadas = document.getElementById("btnVisualizarSelecionados");
    if (btnVerSelecionadas) {
      btnVerSelecionadas.addEventListener("click", async () => {
        const selecionadas = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
          .map(cb => cb.dataset.filename);
  
        if (selecionadas.length === 0) {
          alert("Nenhuma nota selecionada.");
          return;
        }
  
        let conteudoTotal = "";
        for (const nome of selecionadas) {
          const { conteudo } = await windowAPI.lerNota(nome);
          conteudoTotal += `<div class="nota">${conteudo.replace(/\n/g, "<br>")}</div><hr/>`;
        }
  
        const novaJanela = window.open("", "_blank", "width=800,height=700");
        novaJanela.document.write(`
          <html>
          <head>
            <title>Notas Selecionadas</title>
            <style>
              body { font-family: Arial; padding: 2rem; }
              .nota { border: 1px solid #ccc; border-radius: 8px; padding: 1rem; background: #f9f9f9; margin-bottom: 2rem; }
            </style>
          </head>
          <body>${conteudoTotal}</body>
          </html>
        `);
      });
    }
  }
  