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
    location.reload();
  }, { once: true });
}
export function exibirConfirmacao(titulo, mensagem) {
  return new Promise(resolve => {
    const modal = document.getElementById("modalConfirmacaoPadrao");
    const tituloElem = modal.querySelector(".titulo");
    const msgElem = modal.querySelector(".mensagem");

    tituloElem.textContent = titulo;
    msgElem.textContent = mensagem;

    modal.style.display = "flex";

    modal.querySelector(".btnSim").onclick = () => {
      modal.style.display = "none";
      resolve(true);
    };

    modal.querySelector(".btnNao").onclick = () => {
      modal.style.display = "none";
      resolve(false);
    };
  });
}
