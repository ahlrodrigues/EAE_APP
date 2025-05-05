// Handlers de cada domínio
const { registrarCadastroHandlers } = require('./cadastroHandler');
const { registrarNotasHandlers } = require('./notasHandler');
const { registrarAuthHandlers } = require('./authHandler');
const { registrarPdfHandlers } = require('./pdfHandler');
const { registrarEmailHandlers } = require('./emailHandler');
const { registrarUsuarioHandlers } = require('./usuarioHandler');
const { registrarGerarPdfAnexosEmailHandler } = require('./gerarPdfAnexosEmailHandler');

// Função central para registrar todos os handlers do app
function registrarHandlers(ipcMain) {
  console.log('🔧 Registrando handlers do aplicativo...');

  registrarCadastroHandlers(ipcMain);
  registrarNotasHandlers(ipcMain);
  registrarAuthHandlers(ipcMain);
  registrarPdfHandlers(ipcMain);
  registrarEmailHandlers(ipcMain);
  registrarUsuarioHandlers(ipcMain);
  registrarGerarPdfAnexosEmailHandler(ipcMain);

  console.log('✅ Todos os handlers foram registrados com sucesso.');
}

module.exports = { registrarHandlers };
