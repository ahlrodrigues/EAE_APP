// renderer/listarNotas.js
export async function listarNotas() {
  const arquivos = await window.electronAPI.listarNotas(); // Chama handler do main
  console.log("📥 Arquivos recebidos do main:", arquivos);
  return arquivos;
}
