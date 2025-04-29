export function inicializarSelecaoTodos() {
    const chkTodos = document.getElementById("selecionarTodos");
    if (!chkTodos) return;
  
    chkTodos.addEventListener("change", () => {
      const checkboxes = document.querySelectorAll(".linha-selecao");
      checkboxes.forEach(checkbox => {
        checkbox.checked = chkTodos.checked;
      });
    });
  }
  