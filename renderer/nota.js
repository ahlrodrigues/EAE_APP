// nota.js

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const multi = urlParams.get("multi");
  
    const container = document.getElementById("conteudoNota");
    const titulo = document.getElementById("tituloNota");
  
    function formatarDataTexto(texto) {
      return texto.replace(
        /^Data:\s*(\d{4})-(\d{2})-(\d{2})/m,
        (match, ano, mes, dia) => `Data: ${dia}-${mes}-${ano}`
      );
    }
  
    if (multi === "true") {
      titulo.textContent = "Notas Selecionadas";
  
      const lista = JSON.parse(localStorage.getItem("notasSelecionadas"));
      if (!lista || !Array.isArray(lista)) {
        container.textContent = "Nenhuma nota encontrada.";
        return;
      }
  
      container.innerHTML = lista.map(n => {
        let conteudoFormatado = formatarDataTexto(n.conteudo);
        return `
          <div style="
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            text-align: left;
          ">
            <img src="../assets/trevo.png" alt="Logo Trevo" style="display: block; margin: 0 auto 1rem auto; max-width: 100px;" />
            <pre style="
              background: #f9f9f9;
              padding: 1rem;
              border: 1px solid #ccc;
              border-radius: 8px;
              white-space: pre-wrap;
              font-size: 1rem;
              color: #333;
            ">${conteudoFormatado}</pre>
          </div>
        `;
      }).join("");
    } else {
      const dados = JSON.parse(localStorage.getItem("notaSelecionada"));
      if (!dados) {
        container.textContent = "Erro: nota não encontrada.";
        return;
      }
  
      let conteudoFormatado = formatarDataTexto(dados.conteudo);
  
      container.innerHTML = `
        <div style="
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          text-align: left;
        ">
          <img src="../assets/trevo.png" alt="Logo Trevo" style="display: block; margin: 0 auto 1rem auto; max-width: 80px;" />
          <pre style="
            background: #f9f9f9;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            white-space: pre-wrap;
            font-size: 1rem;
            color: #333;
          ">${conteudoFormatado}</pre>
        </div>
      `;
    }
  };
  