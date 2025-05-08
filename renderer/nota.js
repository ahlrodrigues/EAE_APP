console.log("🚀 nota.js carregado!");

import { gerarNomeNota } from "./gerarNomeNota.js";
import { exibirAviso } from "./ui/modalAviso.js";
import { visualizarNota } from "../renderer/shared/visualizarNota.js";

// ✅ Formata data de YYYY-MM-DD → DD-MM-YYYY
function formatarDataTexto(conteudo) {
  return conteudo.replace(/^Data:\s*(\d{4})-(\d{2})-(\d{2})/m, "Data: $3-$2-$1");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("📦 DOM totalmente carregado");

  // ✅ Envia evento ao main indicando que estamos prontos (se suportado)
  window.electronAPI?.notifyReady?.();
  
  const container = document.getElementById("conteudoNota");
  const titulo = document.getElementById("tituloNota");

  if (!container) {
    console.error("❌ Elemento 'conteudoNota' não encontrado no DOM.");
    return;
  }

  

  // ✅ Escuta os dados enviados via IPC após abertura da nota
  window.electronAPI.on("dados-da-nota", async (_, { conteudo, senha }) => {
    console.log("📨 Dados recebidos:", {
      senha,
      inicioCriptografado: conteudo.substring(0, 30),
    });

    try {
      const conteudoDescriptografado = await window.electronAPI.descriptografar(conteudo, senha);
      const formatado = formatarDataTexto(conteudoDescriptografado);

      
      container.innerHTML = `
        <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 2rem; text-align: left;">
          <img src="../assets/trevo.png" alt="Logo Trevo" style="display: block; margin: 0 auto 1rem auto; max-width: 80px;" />
          <pre style="background: #f9f9f9; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; white-space: pre-wrap; font-size: 1rem; color: #333;">
${formatado}
          </pre>
        </div>
      `;
    } catch (erro) {
      console.error("❌ Falha ao descriptografar nota:", erro);
      container.innerHTML = "<p>Erro ao descriptografar a nota.</p>";
    }
  });


});
