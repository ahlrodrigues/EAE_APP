document.getElementById("formNota").addEventListener("submit", async (event) => {
  event.preventDefault();

  const dataInput = document.getElementById("data");
  const fatoInput = document.getElementById("fato");
  const reacaoInput = document.getElementById("reacao");
  const sentimentoInput = document.getElementById("sentimento");
  const propostaInput = document.getElementById("proposta");

  try {
    const nomeAluno = await window.electronAPI.obterNomeAluno();
    const data = new Date(dataInput.value);
    const agora = new Date();

    const nomeArquivo = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}_${String(agora.getHours()).padStart(2, '0')}_${String(agora.getMinutes()).padStart(2, '0')}_${String(agora.getSeconds()).padStart(2, '0')}-${nomeAluno}.txt`;

    const conteudoClaro = `
Data: ${data.toLocaleDateString('pt-BR')}
Fato: ${fatoInput.value}
Reação: ${reacaoInput.value}
Sentimento: ${sentimentoInput.value}
Proposta: ${propostaInput.value}
`.trim();

    const senha = await window.electronAPI.getSenhaUsuario();
    const conteudoCriptografado = await window.electronAPI.criptografar(conteudoClaro, senha);


    await window.electronAPI.salvarNota(nomeArquivo, conteudoCriptografado);

    alert("Nota salva com sucesso!");
    document.getElementById("formNota").reset();
  } catch (error) {
    console.error("Erro ao salvar nota:", error);
    alert("Erro ao salvar a nota. Verifique o console para mais detalhes.");
  }
});
