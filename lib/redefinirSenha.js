const fs = require("fs");
const path = require("path");
const os = require("os");
const bcrypt = require("bcryptjs");
const { migrarNotas } = require("./migrar-senha");

const userHome = os.homedir();
const configPath = path.join(userHome, ".config", "escola-aprendizes-final");
const usuarioPath = path.join(configPath, "config", "usuario.json");

function redefinirSenha(senhaAntiga, senhaNova) {
  if (!fs.existsSync(usuarioPath)) {
    throw new Error("Arquivo usuario.json não encontrado.");
  }

  const usuario = JSON.parse(fs.readFileSync(usuarioPath, "utf-8"));

  if (!bcrypt.compareSync(senhaAntiga, usuario.senha)) {
    throw new Error("Senha antiga incorreta.");
  }

  migrarNotas(senhaAntiga, senhaNova);

  const novaSenhaHash = bcrypt.hashSync(senhaNova, 10);
  usuario.senha = novaSenhaHash;
  fs.writeFileSync(usuarioPath, JSON.stringify(usuario, null, 2));

  return true;
}

module.exports = { redefinirSenha };
