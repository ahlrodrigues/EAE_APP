const fs = require("fs");
const nota = fs.readFileSync("~/.config/escola-aprendizes-final/notas/2025-05-01_07-05-18-MAria Helena.txt", "utf8");
console.log(nota);
