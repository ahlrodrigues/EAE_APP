const fs = require("fs");
const path = require("path");
const { getNotasPath } = require("../config/paths");

function listarNotas() {
  const notasDir = getNotasPath();
  if (!fs.existsSync(notasDir)) return [];

  const arquivos = fs.readdirSync(notasDir)
    .filter(nome => nome.endsWith(".txt"))
    .map(nome => {
      const conteudo = fs.readFileSync(path.join(notasDir, nome), "utf8");

      // Extrair data e nome do aluno do nome do arquivo
      const nomeSemExtensao = nome.replace('.txt', '');
      const [ano, mes, dia, hora, minuto, segundo, ...nomePartes] = nomeSemExtensao.split(/[_-]/);
      const data = `${ano}-${mes}-${dia}`;
      const nomeAluno = nomePartes.join(' ');

      return {
        nomeArquivo: nome,
        conteudoCriptografado: conteudo,
        data,
        nomeAluno,
      };
    });

  console.log("📄 Notas encontradas:", arquivos.length);
  return arquivos;
}

module.exports = { listarNotas };
