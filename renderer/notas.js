
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
      const bloco = lista.map(n => `<h3>${n.nome}</h3><pre>${n.conteudo}</pre><hr>`).join("");
      document.getElementById("conteudoNota").innerHTML = bloco;
    } else {
      const dados = JSON.parse(localStorage.getItem("notaSelecionada"));
      if (!dados) {
        document.getElementById("conteudoNota").textContent = "Erro: nota não encontrada.";
        return;
      }
      document.getElementById("tituloNota").textContent = `Arquivo: ${dados.nome}`;
      document.getElementById("conteudoNota").textContent = dados.conteudo;
    }
  };
  

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
