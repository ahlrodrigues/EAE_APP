
document.getElementById("notaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = document.getElementById("data").value.trim();
  const fato = document.getElementById("fato").value.trim();
  const reacao = document.getElementById("reacao").value.trim();
  const sentimento = document.getElementById("sentimento").value.trim();
  const proposta = document.getElementById("proposta").value.trim();

  if (!data || !fato || !reacao || !sentimento || !proposta) {
    alert("Todos os campos são obrigatórios.");
    return;
  }

  const nomeAluno = await window.electronAPI.obterNomeAluno() || "sem_nome";
  const nomeSanitizado = nomeAluno.replace(/\s+/g, "_");

  const agora = new Date();
  const dataStr = agora.toISOString().split("T")[0];
  const horaStr = agora.toTimeString().split(" ")[0].replace(/:/g, "");
  const nomeArquivo = `${dataStr}_${horaStr}-${nomeSanitizado}.txt`;

  const conteudo = `Data: ${data}\n\nFato: ${fato}\n\nReação: ${reacao}\n\nSentimento: ${sentimento}\n\nProposta Renovadora: ${proposta}`;

  try {
    const resposta = await window.electronAPI.salvarNota({ nomeArquivo, conteudo });

    if (resposta.sucesso) {
      alert("✅ Nota salva com sucesso!");
      document.getElementById("notaForm").reset();
    } else {
      alert("❌ Erro ao salvar nota: " + resposta.erro);
    }
  } catch (erro) {
    alert("❌ Erro inesperado: " + erro.message);
  }
});
