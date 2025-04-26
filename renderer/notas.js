
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formNota");
  const campos = document.querySelectorAll("#formNota input, #formNota textarea, #formNota button");
  const lista = document.getElementById("listaNotas");
  let nomeAluno = "aluno";
  let numeroTurma = "turma";

  // Ativa campos se a senha estiver disponível
  try {
    const usuario = await window.electronAPI.lerUsuario();
    if (usuario) {
      nomeAluno = usuario.aluno.replace(/\s+/g, "_");
      numeroTurma = usuario.numeroTurma.replace(/\s+/g, "_");
      campos.forEach(el => {
        el.removeAttribute("disabled");
      });
    } else {
      alert("⚠️ Você precisa fazer login para acessar as notas.");
    }
  } catch (err) {
    console.error("Erro ao verificar acesso às notas:", err);
    alert("⚠️ Erro ao validar acesso. Faça login novamente.");
  }

  // Listar notas existentes
  try {
    const arquivos = await window.electronAPI.listarNotas();
    arquivos.forEach(nome => {
      const item = document.createElement("li");
      item.textContent = nome;
      item.style.cursor = "pointer";
      item.addEventListener("click", async () => {
        try {
          const conteudo = await window.electronAPI.lerNota(nome);
          alert("📄 Nota:\n\n" + conteudo);
        } catch (erro) {
          alert("Erro ao abrir a nota.");
        }
      });
      lista.appendChild(item);
    });
  } catch (e) {
    console.error("Erro ao carregar lista de notas:", e);
  }

  window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const multi = urlParams.get("multi");
  
    if (multi === "true") {
      const lista = JSON.parse(localStorage.getItem("notasSelecionadas"));
      if (!lista || !Array.isArray(lista)) return;
  
      document.getElementById("tituloNota").textContent = "Notas Selecionadas";
  
      const bloco = lista.map(n => {
        const nota = processarConteudoNota(n.conteudo); // Nova função que vamos criar
        return gerarHtmlNota(nota); // Usar a função que monta o layout bonito
      }).join('<hr style="margin:2rem 0;">');
      
      document.getElementById("conteudoNota").innerHTML = bloco;
      
    } else {
      const dados = JSON.parse(localStorage.getItem("notaSelecionada"));
      if (!dados) {
        document.getElementById("conteudoNota").textContent = "Erro: nota não encontrada.";
        return;
      }
      document.getElementById("tituloNota").textContent = `Arquivo: ${dados.nome}`;
      document.getElementById("conteudoNota").innerHTML = gerarHtmlNota(JSON.parse(dados.conteudo));
    }
  };
  

  
  document.getElementById('btnExportar').addEventListener('click', async () => {
    const selecionadas = obterNotasSelecionadas();
  
    if (!selecionadas || selecionadas.length === 0) {
      alert('Nenhuma nota selecionada para exportar!');
      return;
    }
  
    if (selecionadas.length === 1) {
      // Exporta direto se apenas uma nota
      const htmlNota = gerarHtmlNota(selecionadas[0]);
      await window.electronAPI.gerarPdfUnico(htmlNota);
      alert('✅ Anotação exportada com sucesso para a pasta Anotações_EAE!');
    } else {
      // Se múltiplas notas, exibe modal para escolha
      document.getElementById('modalExportar').style.display = 'flex';
    }
  });
  
  // Confirmação da modal
  document.getElementById('confirmarExportacao').addEventListener('click', async () => {
    document.getElementById('modalExportar').style.display = 'none';
  
    const selecionadas = obterNotasSelecionadas();
    const exportarUnico = document.getElementById('exportarUnico').checked;
  
    try {
      if (exportarUnico) {
        // Gera um único PDF com todas as notas
        const htmlNotas = gerarHtmlNotasMultiplo(selecionadas);
await window.electronAPI.gerarPdfUnico(htmlNotas);

      } else {
        // Gera PDFs separados
        for (const nota of selecionadas) {
          const htmlNota = gerarHtmlNota(nota);
          await window.electronAPI.gerarPdfSeparado(htmlNota, nota.data);
        }
      }
      alert('✅ Anotações exportadas com sucesso para a pasta Anotações_EAE!');
    } catch (error) {
      console.error('Erro ao exportar PDFs:', error);
      alert('❌ Erro ao exportar PDFs.');
    }
  });
  
  function processarConteudoNota(conteudo) {
    const nota = {};
    const linhas = conteudo.split("\n");
    
    linhas.forEach(linha => {
      if (linha.startsWith("Data:")) {
        nota.data = linha.replace("Data:", "").trim();
      } else if (linha.startsWith("Fato:")) {
        nota.fato = linha.replace("Fato:", "").trim();
      } else if (linha.startsWith("Reação:")) {
        nota.reacao = linha.replace("Reação:", "").trim();
      } else if (linha.startsWith("Sentimento:")) {
        nota.sentimento = linha.replace("Sentimento:", "").trim();
      } else if (linha.startsWith("Proposta:")) {
        nota.proposta = linha.replace("Proposta:", "").trim();
      }
    });
  
    return nota;
  }
  

  function gerarHtmlNotasMultiplo(notas) {
    const conteudo = notas.map(nota => gerarHtmlNota(nota)).join('<hr style="margin:2rem 0;">');
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Anotações EAE</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>
        ${conteudo}
      </body>
      </html>
    `;
  }
  
  
  function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    if (partes.length !== 3) return data;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  

  // Salvar nova nota
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = document.getElementById("data").value;
    const dataBr = data.split('-').reverse().join('-'); // converte para DD-MM-YYYY
    const fato = document.getElementById("fato").value;
    const reacao = document.getElementById("reacao").value;
    const sentimento = document.getElementById("sentimento").value;
    const proposta = document.getElementById("proposta").value;
    const nota = `Data: ${dataBr}\nFato: ${fato}\nReação: ${reacao}\nSentimento: ${sentimento}\nProposta: ${proposta}`;


    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("sv-SE"); // yyyy-mm-dd
    const horaFormatada = agora.toLocaleTimeString("it-IT").replace(/:/g, "_"); // hh_mm_ss
    const nomeArquivo = `${dataFormatada}_${horaFormatada}-${nomeAluno}_${numeroTurma}.txt`;

    try {
      const sucesso = await window.electronAPI.salvarNota(nomeArquivo, nota);
      if (sucesso) {
        alert("Nota salva com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao salvar nota.");
      }
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
      alert("Erro interno ao salvar nota.");
    }
  });
});
