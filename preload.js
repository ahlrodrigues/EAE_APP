const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  salvarCadastro: (dados) => ipcRenderer.invoke("salvar-cadastro", dados),
  armazenarSenha: (senha) => ipcRenderer.invoke("armazenar-senha", senha),
  listarNotas: () => ipcRenderer.invoke("listar-notas"),
  lerNota: (nome) => ipcRenderer.invoke("ler-nota", nome),
  redefinirSenha: (tokenOuAntiga, novaSenha) => ipcRenderer.invoke("redefinir-senha", tokenOuAntiga, novaSenha),
  lerUsuario: () => ipcRenderer.invoke("ler-usuario"),
  compareSync: (senhaDigitada, hash) => bcrypt.compareSync(senhaDigitada, hash),
  validarSenhaComHash: (senha, hash) => ipcRenderer.invoke("validar-senha-hash", senha, hash),
  salvarNota: (nome, conteudo) => ipcRenderer.invoke("salvar-nota", nome, conteudo),

});
