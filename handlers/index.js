// handlers/index.js

const { registrarCadastroHandlers } = require('./cadastroHandler');
const { registrarNotasHandlers } = require('./notasHandler');
const { registrarAuthHandlers } = require('./authHandler');
const { registrarPdfHandlers } = require('./pdfHandler');
const { registrarEmailHandlers } = require('./emailHandler');

function registrarHandlers(ipcMain) {
  registrarCadastroHandlers(ipcMain);
  registrarNotasHandlers(ipcMain);
  registrarAuthHandlers(ipcMain);
  registrarPdfHandlers(ipcMain);
  registrarEmailHandlers(ipcMain);
}

module.exports = { registrarHandlers };
