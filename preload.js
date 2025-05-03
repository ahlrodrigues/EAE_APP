// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Cadastro
  salvarCadastro: (dados) => ipcRenderer.invoke('salvar-cadastro', dados),

  // Notas
  salvarNota: (nome, conteudo) => ipcRenderer.invoke('salvar-nota', nome, conteudo),
  listarNotas: () => ipcRenderer.invoke('listar-notas'),
  lerNota: (nome) => ipcRenderer.invoke('ler-nota', nome),
  criptografar: (texto, senha) => ipcRenderer.invoke('criptografar', texto, senha),
  lerUsuario: () => ipcRenderer.invoke('ler-usuario'),
  getSenhaUsuario: () => ipcRenderer.invoke('get-senha-usuario'),
  armazenarSenha: (senha) => ipcRenderer.invoke('armazenar-senha', senha),
  descriptografar: (conteudo, senha) => ipcRenderer.invoke("descriptografar", conteudo, senha),
  excluirNota: (nome) => ipcRenderer.invoke('excluir-nota', nome),
  exportarNotas: (html, nome) => ipcRenderer.invoke('exportar-notas', html, nome),
  abrirVisualizacaoNotas: (html) => ipcRenderer.invoke("abrir-visualizacao-notas", html),
  enviarEmail: (dados) => ipcRenderer.invoke("enviar-email-dirigente", dado),
  gerarPdfAnexosParaEmail: (conteudos, nomes, tipo) => ipcRenderer.invoke("gerar-pdf-anexos-email", conteudos, nomes, tipo),
  obterCadastro: () => ipcRenderer.invoke('obter-cadastro'),
  
  

  // Autenticação
  validarSenha: (senha) => ipcRenderer.invoke('validar-senha', senha),
  validarSenhaHash: (senha) => ipcRenderer.invoke('validar-senha-hash', senha),

  gerarPdf: (html, nomeArquivo, salvarNoDisco = true) => ipcRenderer.invoke('gerar-pdf', html, nomeArquivo, salvarNoDisco),

  // E-mail
  enviarToken: (token) => ipcRenderer.invoke('enviar-token', token),

  //Notas
  obterNomeAluno: () => ipcRenderer.invoke('obter-nome-aluno'),
});
