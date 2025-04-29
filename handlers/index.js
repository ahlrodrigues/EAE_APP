const { registrarCadastroHandlers } = require('./cadastroHandler');
const { registrarNotasHandlers } = require('./notasHandler');
const { registrarAuthHandlers } = require('./authHandler');
const { registrarPdfHandlers } = require('./pdfHandler');
const { registrarEmailHandlers } = require('./emailHandler');
const { registrarUsuarioHandlers } = require('./usuarioHandler');

function registrarHandlers(ipcMain) {
  registrarCadastroHandlers(ipcMain);
  registrarNotasHandlers(ipcMain);
  registrarAuthHandlers(ipcMain);
  registrarPdfHandlers(ipcMain);
  registrarEmailHandlers(ipcMain);
  registrarUsuarioHandlers(ipcMain);
}

module.exports = { registrarHandlers };
