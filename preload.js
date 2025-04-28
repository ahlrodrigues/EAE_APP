const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  salvarCadastro: (dados) => ipcRenderer.invoke("salvar-cadastro", dados),
  armazenarSenha: (senha) => ipcRenderer.invoke("armazenar-senha", senha),
  listarNotas: () => ipcRenderer.invoke("listar-notas"),
  lerNota: (nome) => ipcRenderer.invoke("ler-nota", nome),
  redefinirSenha: (tokenOuAntiga, novaSenha) => ipcRenderer.invoke("redefinir-senha", tokenOuAntiga, novaSenha),
  lerUsuario: () => ipcRenderer.invoke("ler-usuario"),
  validarSenhaComHash: (senha, hash) => ipcRenderer.invoke("validar-senha-hash", senha, hash),
  salvarNota: (nome, conteudo) => ipcRenderer.invoke("salvar-nota", nome, conteudo),
  excluirNota: (nome) => ipcRenderer.invoke("excluir-nota", nome),
  gerarPdfUnico: (html, nomeArquivoPersonalizado) => ipcRenderer.invoke('gerar-pdf-unico', html, nomeArquivoPersonalizado),
  obterNomeAluno: () => ipcRenderer.invoke('obter-nome-aluno'),
});
