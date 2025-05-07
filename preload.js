// 🔐 preload.js — Ponte segura entre o processo renderer e o processo principal (main)
try {

  const electron = require('electron');
  const contextBridge = electron.contextBridge;
  const ipcRenderer = electron.ipcRenderer;

 
// ✅ Expondo métodos seguros no objeto global window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  
  // 🔑 Recupera a senha de criptografia armazenada no main
  getSenhaCriptografia: () => ipcRenderer.invoke("get-senha-criptografia"),


  // 📖 Lê o conteúdo criptografado de uma nota pelo nome do arquivo
  lerNota: (nome) => ipcRenderer.invoke("ler-nota", nome),

  // 🔓 Descriptografa o conteúdo usando a senha informada
  descriptografar: (texto, senha) => ipcRenderer.invoke("descriptografar", texto, senha),

  // 📤 Solicita ao main que abra a janela de nota única com preload aplicado
  abrirNotaUnica: () => ipcRenderer.invoke("abrirNotaUnica"),

  // (opcional) Você pode adicionar outros métodos de exportação aqui

  salvarCadastro: (dados) => ipcRenderer.invoke('salvar-cadastro', dados),
  salvarNota: (nome, conteudo) => ipcRenderer.invoke('salvar-nota', nome, conteudo),
 // lerNota: (nome) => ipcRenderer.invoke('ler-nota', nome),
  criptografar: (texto, senha) => ipcRenderer.invoke('criptografar', texto, senha),
  //descriptografar: (texto, senha) => ipcRenderer.invoke("descriptografar", texto, senha),
  getSenhaUsuario: () => ipcRenderer.invoke('get-senha-usuario'),
  armazenarSenha: (senha) => ipcRenderer.invoke('armazenar-senha', senha),
  lerUsuario: () => ipcRenderer.invoke('ler-usuario'),
  excluirNota: (nome) => ipcRenderer.invoke('excluir-nota', nome),
  exportarNotas: (html, nome) => ipcRenderer.invoke('exportar-notas', html, nome),
  abrirVisualizacaoNotas: (html) => ipcRenderer.invoke('abrir-visualizacao-notas', html),
  enviarEmail: (dados) => ipcRenderer.invoke('enviar-email-dirigente', dados),
  gerarPdfAnexosParaEmail: (conteudos, nomes, tipo) => ipcRenderer.invoke('gerar-pdf-anexos-email', conteudos, nomes, tipo),
  obterCadastro: () => ipcRenderer.invoke('obter-cadastro'),
  validarSenha: (senha) => ipcRenderer.invoke('validar-senha', senha),
  validarSenhaHash: (senha) => ipcRenderer.invoke('validar-senha-hash', senha),
  gerarPdf: (html, nomeArquivo, salvarNoDisco = true) => ipcRenderer.invoke('gerar-pdf', html, nomeArquivo, salvarNoDisco),
  enviarToken: (token) => ipcRenderer.invoke('enviar-token', token),
  obterNomeAluno: () => ipcRenderer.invoke('obter-nome-aluno'),
  enviarEmailContato: (assunto, mensagem) => ipcRenderer.invoke('enviarEmailContato', assunto, mensagem),
 // getSenhaCriptografia: () => ipcRenderer.invoke('get-senha-criptografia'),
  setSenhaCriptografia: (senha) => ipcRenderer.send('set-senha-criptografia', senha),
  abrirNotaMulti: () => ipcRenderer.invoke("abrir-nota-multi"),
  visualizarNota: (nome) => ipcRenderer.invoke("visualizar-nota", nome),
  listarNotas: () => ipcRenderer.invoke("listar-notas"),
  on: (canal, callback) => ipcRenderer.on(canal, callback), 
  abrirNotaUnica: (dados) => ipcRenderer.invoke("abrirNotaUnica", dados),
  notifyReady: () => ipcRenderer.send("nota-ready"),
});

console.log("✅ preload.js carregado com sucesso");
} catch (e) {
  console.error("❌ Erro no preload.js:", e);
}
