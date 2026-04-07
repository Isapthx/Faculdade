// Função que busca os dados da sua API Java
async function carregarDisciplinas() {
    try {
        const resposta = await fetch('http://localhost:8080/api/disciplinas');
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
                <><h3>${disc.nome}</h3><p><strong>Período:</strong> ${disc.periodo}º</p><p>⭐ Dificuldade: ${disc.dificuldadeMedia.toFixed(1)}</p><button onclick="verDetalhes(${disc.id})">Ver Conteúdos</button></>
            ;
            container.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao buscar disciplinas:", erro);
        document.getElementById('container-cards').innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

function verDetalhes(id) {
    alert("Em breve: Detalhes da disciplina " + id);
    // Aqui você redirecionaria para uma página de detalhes
}

// Executa assim que a página abre
carregarDisciplinas();