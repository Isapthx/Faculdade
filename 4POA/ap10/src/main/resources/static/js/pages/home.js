// Função que busca os dados da sua API Java
async function carregarDisciplinas() {
    try {
        const resposta = await fetch('/api/disciplinas');
        const disciplinas = await resposta.json();

        const container = document.getElementById('container-cards');
        container.innerHTML = ''; // Limpa o "Carregando..."

        if (disciplinas.length === 0) {
            container.innerHTML = '<p>Nenhuma disciplina encontrada.</p>';
            return;
        }

        disciplinas.forEach(disc => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = 
                `<h3>${disc.nome}</h3><p><strong>Período:</strong> ${disc.periodo}º</p><p>⭐ Dificuldade: ${disc.dificuldadeMedia.toFixed(1)}</p><button onclick="verDetalhes(${disc.id})">Ver Conteúdos</button>`;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao buscar disciplinas:", erro);
        document.getElementById('container-cards').innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

export const verDetalhes = (id) => {
    // Redireciona o usuário para a página de detalhes passando o ID na URL
    window.location.href = `detalhes.html?id=${id}`;
}

window.verDetalhes = verDetalhes;

// Executa assim que a página abre
carregarDisciplinas();
