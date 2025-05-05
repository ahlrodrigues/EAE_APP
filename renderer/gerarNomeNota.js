export async function gerarNomeNota(dataDigitada) {
  const [ano, mes, dia] = dataDigitada.split("-");

  const agora = new Date();
  const segundos = String(agora.getSeconds()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const horas = String(agora.getHours()).padStart(2, "0");

  const dataFormatada = `${ano}-${mes}-${dia}`;
  const horaFormatada = `${segundos}-${minutos}-${horas}`;

  let aluno = "aluno";
  try {
    aluno = await window.electronAPI.obterNomeAluno();
    aluno = aluno.replace(/[^a-zA-Z0-9_-]/g, "_");
  } catch (error) {
    console.warn("⚠️ Nome do aluno não encontrado, usando padrão.");
  }

  return `${dataFormatada}_${horaFormatada}_${aluno}.txt`;
}
