function transformarNotaEmHTML(conteudoTexto) {
  const linhas = conteudoTexto.split("\n");
  const campos = { Data: "", Fato: "", Reação: "", Sentimento: "", Proposta: "" };

  linhas.forEach(linha => {
    const [chave, ...resto] = linha.split(":");
    const valor = resto.join(":").trim();
    if (campos.hasOwnProperty(chave)) campos[chave] = valor;
  });

  return `
    <div class="nota-cartao">
      <div class="nota-campo"><strong>Data:</strong> ${campos.Data}</div>
      <div class="nota-campo"><strong>Fato:</strong> ${campos.Fato}</div>
      <div class="nota-campo"><strong>Reação:</strong> ${campos["Reação"]}</div>
      <div class="nota-campo"><strong>Sentimento:</strong> ${campos["Sentimento"]}</div>
      <div class="nota-campo"><strong>Proposta:</strong> ${campos["Proposta"]}</div>
    </div>
  `;
}

const cabecalho = `
  <div style="text-align: center; margin-bottom: 2rem;">
    <img src="https://geea.com.br/imagem/trevo.png" alt="Logo Trevo" style="max-width: 100px; margin-bottom: 1rem;" />
    <h1 style="font-size: 1.5rem; color: #333; margin: 0;">ESCOLA DE APRENDIZES DO EVANGELHO</h1>
  </div>
`;

const estilo = `
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 2rem;
    }
    .nota-cartao {
      border: 1px solid #ccc;
      border-radius: 12px;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: #f9f9f9;
      page-break-inside: avoid;
    }
    .nota-campo {
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    .nota-campo strong {
      display: inline-block;
      min-width: 100px;
      color: #333;
    }
  </style>
`;

export async function exportarNotasUnico(checkboxes) {
  let htmlNotas = estilo + cabecalho;


  checkboxes.forEach(cb => {
    const tr = cb.closest("tr");
    const conteudo = tr.dataset.conteudo || "Sem conteúdo";

    htmlNotas += conteudo.includes("nota-cartao")
      ? conteudo
      : transformarNotaEmHTML(conteudo);
  });

  const nomeAluno = await window.electronAPI.obterNomeAluno?.() || "Aluno";
  const agora = new Date();
  const dataStr = agora.toISOString().split("T")[0]; // YYYY-MM-DD
  const horaStr = agora.toTimeString().split(" ")[0].replace(/:/g, "_"); // HH_MM_SS

  const nomeArquivo = `${dataStr}_${horaStr}-${nomeAluno}.pdf`;

  const caminho = await window.electronAPI.exportarNotas(htmlNotas, nomeArquivo);
}


export async function exportarNotasSeparadas(checkboxes) {
  for (const cb of checkboxes) {
    const tr = cb.closest("tr");
    const conteudo = tr.dataset.conteudo || "Sem conteúdo";
    let nome = tr.dataset.nome || `Nota_${Date.now()}.pdf`;

    if (!nome.endsWith(".pdf")) {
      nome = nome.replace(/\.(txt|enc)$/i, "") + ".pdf";
    }

    const html = estilo + cabecalho + (
      conteudo.includes("nota-cartao")
        ? conteudo
        : transformarNotaEmHTML(conteudo)
    );
    

    await window.electronAPI.exportarNotas(html, nome);
  }

}

