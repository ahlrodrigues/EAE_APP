// config/paths.js

const path = require('path');
const { app } = require('electron');

function getUserConfigPath() {
  return path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'config');
}

function getNotasPath() {
  return path.join(app.getPath('home'), '.config', 'escola-aprendizes-final', 'notas');
}

module.exports = {
  getUserConfigPath,
  getNotasPath
};
