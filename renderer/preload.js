
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  salvarNota: (dados) => ipcRenderer.invoke("salvar-nota-criptografada", dados),
  obterNomeAluno: () => ipcRenderer.invoke("obter-nome-aluno")
});
