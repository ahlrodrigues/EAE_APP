export function exibirAviso(titulo, mensagemHtml) {
  const modal = document.getElementById("modalAviso");
  const tituloEl = document.getElementById("modalAvisoTitulo");
  const textoEl = document.getElementById("modalAvisoTexto");

  if (!modal || !tituloEl || !textoEl) return;

  tituloEl.textContent = titulo;
  textoEl.innerHTML = mensagemHtml;
  modal.style.display = "flex";

  const btnFechar = document.getElementById("modalAvisoFechar");
  btnFechar?.addEventListener("click", () => {
    modal.style.display = "none";
  }, { once: true });
}
