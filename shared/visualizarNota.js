export async function visualizarNota(nome) {
  console.log("🔍 Entrando na função visualizarNota com:", nome);

  const senhaNota = await window.electronAPI.getSenhaCriptografia();
  if (!senhaNota) {
    alert("Senha não carregada. Faça login novamente.");
    return;
  }

  try {
    const conteudoCriptografado = await window.electronAPI.lerNota(nome);

    localStorage.setItem("senhaCripto", senhaNota);
    console.log("🔐 Senha de criptografia retornada:", senhaNota);
    localStorage.setItem("conteudoCriptografado", conteudoCriptografado);
    console.log("🔒 Conteúdo criptografado:", conteudoCriptografado);

    const dataFormatada = nome.substring(0, 10).split("-").reverse().join("-");
    localStorage.setItem("dataNota", dataFormatada);
    console.log("📅 Data da nota:", dataFormatada);

    console.log("📤 Dados salvos para visualização:", {
      senha: senhaNota,
      inicioCriptografado: conteudoCriptografado.substring(0, 30),
    });

    await window.electronAPI.abrirNotaUnica({
      conteudo: conteudoCriptografado,
      senha: senhaNota
    });

  } catch (error) {
    console.error("❌ Erro ao abrir a nota:", error);
    alert("Erro ao abrir a nota.");
  }
}
