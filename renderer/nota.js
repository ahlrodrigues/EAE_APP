document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("conteudoNota");
  const titulo = document.getElementById("tituloNota");
  const urlParams = new URLSearchParams(window.location.search);
  const multi = urlParams.get("multi");

  // Função utilitária para formatar datas no corpo da nota
  function formatarDataTexto(texto) {
    return texto.replace(
      /^Data:\s*(\d{4})-(\d{2})-(\d{2})/m,
      (_, ano, mes, dia) => `Data: ${dia}-${mes}-${ano}`
    );
  }

  // ✅ Diagnóstico inicial
  console.group("🧪 Diagnóstico preload / electronAPI");
  console.log("🔍 window.electronAPI =", window.electronAPI);
  console.log("🔍 typeof electronAPI.descriptografar =", typeof window.electronAPI?.descriptografar);
  console.groupEnd();

  // 🚨 Verificação crítica: preload.js corretamente exposto?
  if (!window.electronAPI || typeof window.electronAPI.descriptografar !== "function") {
    container.textContent = "Erro crítico: integração com Electron falhou.";
    console.error("❌ 'descriptografar' não está disponível no preload.");
    return;
  }

  if (multi === "true") {
    // ✅ VISUALIZAÇÃO MULTI-NOTAS
    console.log("📂 Modo multi-notas ativado (multi=true)");
    titulo.textContent = "Notas Selecionadas";

    const lista = JSON.parse(localStorage.getItem("notasSelecionadas"));
    if (!lista || !Array.isArray(lista)) {
      console.warn("⚠️ Nenhuma nota encontrada no localStorage.");
      container.textContent = "Nenhuma nota encontrada.";
      return;
    }

    container.innerHTML = lista.map(n => {
      const conteudo = n.conteudo || "";
      const conteudoFormatado = formatarDataTexto(conteudo);

      return `
        <div style="
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          text-align: left;
        ">
          <img src="../assets/trevo.png" alt="Logo Trevo"
               style="display: block; margin: 0 auto 1rem auto; max-width: 100px;" />
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
    // ✅ VISUALIZAÇÃO ÚNICA COM DESCRIPTOGRAFIA
    console.log("📄 Modo nota única ativado (multi=false)");

    window.electronAPI.on("dados-da-nota", async (_, { conteudo, senha }) => {
      const container = document.getElementById("conteudoNota");
      const titulo = document.getElementById("tituloNota");
    
      try {
        const conteudoDescriptografado = await window.electronAPI.descriptografar(conteudo, senha);
        const formatado = formatarDataTexto(conteudoDescriptografado);

    titulo.textContent = "Nota Selecionada";

    container.innerHTML = `
      <div style="
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        text-align: left;
      ">
        <img src="../assets/trevo.png" alt="Logo Trevo"
             style="display: block; margin: 0 auto 1rem auto; max-width: 80px;" />
        <pre style="
          background: #f9f9f9;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          white-space: pre-wrap;
          font-size: 1rem;
          color: #333;
        ">Carregando...</pre>
      </div>
    `;
  } catch (erro) {
    console.error("❌ Falha ao descriptografar:", erro);
    container.textContent = "Erro ao descriptografar a nota.";
  }
});
    // 🔐 Descriptografa e renderiza a nota
    (async () => {
      try {
        console.log("▶️ Chamando descriptografar com:", senha, conteudoCriptografado);
        const conteudo = await window.electronAPI.descriptografar(conteudoCriptografado, senha);
        const conteudoFormatado = formatarDataTexto(conteudo);

        console.log("✅ Conteúdo descriptografado:", conteudoFormatado?.substring(0, 150) || "[vazio]");

        container.innerHTML = `
          <div style="
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            text-align: left;
          ">
            <img src="../assets/trevo.png" alt="Logo Trevo"
                 style="display: block; margin: 0 auto 1rem auto; max-width: 80px;" />
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
      } catch (erro) {
        console.error("❌ Falha ao descriptografar:", erro);
        container.textContent = "Erro ao descriptografar a nota.";
      }
    })();
  }
});
