const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js')
    }
  });

  win.loadFile(path.join(__dirname, '../pages/login.html'));
}

module.exports = { createMainWindow };
