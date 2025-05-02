export function formatarData(data) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  
  export async function refreshSenha() {
    try {
      await window.electronAPI.getSenhaUsuario();
      console.log("🔄 Senha recarregada.");
    } catch (error) {
      console.error("Erro ao recarregar senha:", error);
    }
  }
  