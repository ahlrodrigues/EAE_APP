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
    localStorage.setItem("dataNota", nome.substring(0, 10).split("-").reverse().join("-"));
    console.log("📅 Data da nota:", nome.substring(0, 10).split("-").reverse().join("-"));
    console.log("📤 Dados salvos para visualização:", {
      senha: senhaNota,
      inicioCriptografado: conteudoCriptografado.substring(0, 30),
    });

    // ✅ AQUI está a chamada correta
    await window.electronAPI.abrirNotaUnica({
      conteudo: conteudoCriptografado,
      senha: senhaNota
    });

  } catch (error) {
    console.error("❌ Erro ao abrir a nota:", error);
    alert("Erro ao abrir a nota.");
  }
}
