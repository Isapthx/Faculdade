import { API } from '../api.js';

async function initDetalhes() {
    // 1. Pega o ID da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Busca os dados específicos dessa disciplina (agora trazendo os tópicos)
        const disciplina = await API.getDisciplinaPorId(id);
        
        // 3. Preenche o Título
        document.getElementById('nome-disciplina').innerText = disciplina.nome;
        
        // 4. Renderiza a Ementa (Lista de Tópicos/Matérias)
        const ementaContainer = document.getElementById('ementa');
        
        if (disciplina.topicos && disciplina.topicos.length > 0) {
            ementaContainer.innerHTML = `
                <ul class="lista-ementa">
                    ${disciplina.topicos.map(topico => `
                        <li>
                            <span class="icon-check">✔</span>
                            ${topico.titulo}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            ementaContainer.innerHTML = `
                <div class="aviso-vazio">
                    <p>Nenhuma matéria ou tópico cadastrado para esta ementa ainda.</p>
                </div>
            `;
        }
        
        // Inicializa a lógica das abas (tabs)
        configurarAbas();
        
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        document.getElementById('nome-disciplina').innerText = "Erro ao carregar";
    }
}

function configurarAbas() {
    const botoes = document.querySelectorAll('.tab-btn');
    const conteudos = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const alvo = btn.dataset.target;

            // Remove classe active de todos os botões
            botoes.forEach(b => b.classList.remove('active'));
            
            // Esconde todos os conteúdos das abas
            conteudos.forEach(c => c.style.display = 'none');

            // Adiciona active ao botão clicado e mostra o conteúdo correspondente
            btn.classList.add('active');
            const elementoAlvo = document.getElementById(alvo);
            if (elementoAlvo) {
                elementoAlvo.style.display = 'block';
            }
        });
    });
}

// Inicia a execução quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initDetalhes);