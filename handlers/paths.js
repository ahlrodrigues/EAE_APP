// config/paths.js

const path = require('path');
const os = require('os');

function getUserDataPath() {
  return path.join(os.homedir(), '.config', 'escola-aprendizes-final');
}

module.exports = { getUserDataPath };
