const checkboxes = document.querySelectorAll('.elemento-chk');
    const limite = 1; // O limite de elementos do seu Mago

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 1. Conta quantos estão selecionados no momento exato do clique
            const selecionados = document.querySelectorAll('.elemento-chk:checked').length;

            // 2. Percorre todos os checkboxes para decidir quem bloquear/desbloquear
            checkboxes.forEach(chk => {
                if (selecionados >= limite) {
                    // Se atingiu o limite, desabilita apenas os que NÃO estão checados
                    if (!chk.checked) {
                        chk.disabled = true;
                    }
                } else {
                    // Se está abaixo do limite (ex: desmarcou um), habilita TODOS
                    chk.disabled = false;
                }
            });
        });
    });

const manaInput = document.getElementById('mana');
const manaValue = document.getElementById('valor-mana');

manaInput.addEventListener('input', () => {
    manaValue.textContent = manaInput.value;
});