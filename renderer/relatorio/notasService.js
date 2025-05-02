// notasService.js
export async function obterNotas() {
    return await window.electronAPI.listarNotas();
  }
  