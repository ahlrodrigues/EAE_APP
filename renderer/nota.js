console.log("🚀 nota.js carregado!");

// Formata data YYYY-MM-DD → DD-MM-YYYY
function formatarDataTexto(conteudo) {
  return conteudo.replace(/^Data:\s*(\d{4})-(\d{2})-(\d{2})/m, "Data: $3-$2-$1");
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 DOM totalmente carregado");

  const container = document.getElementById("conteudoNota");
  if (!container) {
    console.error("❌ Elemento 'conteudoNota' não encontrado.");
    return;
  }

  window.electronAPI?.notifyReady?.();

  window.electronAPI.on("dados-da-nota", async (_, { conteudo, senha }) => {
    console.log("📨 Dados recebidos:", {
      senha,
      inicioCriptografado: conteudo.substring(0, 30),
    });

    try {
      const textoDescriptografado = await window.electronAPI.descriptografar(conteudo, senha);
      const formatado = formatarDataTexto(textoDescriptografado);

      container.innerHTML = `
        <img src="../assets/trevo.png" alt="Logo Trevo" style="width: 100px; margin-bottom: 10px;" />
        <pre style="background: #f9f9f9; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
${formatado}
        </pre>
      `;
    } catch (erro) {
      console.error("❌ Erro ao descriptografar:", erro);
      container.innerHTML = "<p>Erro ao carregar a nota.</p>";
    }
  });
});
