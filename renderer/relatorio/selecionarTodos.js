export function inicializarSelecaoTodos() {
    const chkTodos = document.getElementById("selecionarTodos");
    if (!chkTodos) return;
  
    chkTodos.addEventListener("change", () => {
      const checkboxes = document.querySelectorAll(".seletor-nota");
      checkboxes.forEach(checkbox => {
        checkbox.checked = chkTodos.checked;
      });
    });
  }
  