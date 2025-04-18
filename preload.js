const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fazerLogin: (email, senha) => ipcRenderer.invoke('fazer-login', email, senha),
  salvarCadastro: (dados) => ipcRenderer.invoke('salvar-dados-cadastro', dados),
  solicitarToken: (email) => ipcRenderer.invoke('solicitar-token', email),
  redefinirSenha: (token, novaSenha) => ipcRenderer.invoke('redefinir-senha', token, novaSenha)
});