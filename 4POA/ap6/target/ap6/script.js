// função para restringir a quantidade de marcações a uma só checkbox 
function limitarSelecao() {
        const limite = 1; 
        const checkboxes = document.querySelectorAll('input[name="elementos"]');
        const todos = document.querySelectorAll('input[name="elementos"]');

        if (checkboxes.length >= limite) {
            todos.forEach(cb => {
                if (!cb.checked) cb.disabled = true;
            });
        } else {
            todos.forEach(cb => cb.disabled = false);
        }
    }


// listener para a mudança de marcações nas checkboxes
document.getElementsByName("elementos").forEach(item => {
    item.addEventListener('change', limitarSelecao);
});
