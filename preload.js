// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Cadastro
  salvarCadastro: (dados) => ipcRenderer.invoke('salvar-cadastro', dados),

  // Notas
  salvarNota: (nome, conteudo) => ipcRenderer.invoke('salvar-nota', nome, conteudo),
  listarNotas: () => ipcRenderer.invoke('listar-notas'),
  lerNota: (nome) => ipcRenderer.invoke('ler-nota', nome),

  // Autenticação
  validarSenha: (senha) => ipcRenderer.invoke('validar-senha', senha),
  validarSenhaHash: (senha) => ipcRenderer.invoke('validar-senha-hash', senha),

  // PDF
  gerarPdf: (conteudo, nomeArquivo) => ipcRenderer.invoke('gerar-pdf', conteudo, nomeArquivo),

  // E-mail
  enviarToken: (token) => ipcRenderer.invoke('enviar-token', token),

  //Notas
  obterNomeAluno: () => ipcRenderer.invoke('obter-nome-aluno'),
});
