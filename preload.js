
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  salvarCadastro: (dados) => ipcRenderer.invoke("salvar-cadastro", dados),
  armazenarSenha: (senha) => ipcRenderer.invoke("armazenar-senha", senha),
  listarNotas: () => ipcRenderer.invoke("listar-notas"),
  lerNota: (nome) => ipcRenderer.invoke("ler-nota", nome),
  redefinirSenha: (tokenOuAntiga, novaSenha) => ipcRenderer.invoke("redefinir-senha", tokenOuAntiga, novaSenha)
});