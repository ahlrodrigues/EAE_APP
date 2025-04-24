
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const aluno = document.getElementById("aluno").value.trim();

  if (!aluno) {
    alert("O nome do aluno é obrigatório.");
    return;
  }

  // Salva o "ID" do aluno no localStorage
  localStorage.setItem("idAluno", aluno);

  alert("Cadastro salvo! ID do aluno armazenado.");
  // Aqui você chamaria a função de salvamento real do cadastro
});
