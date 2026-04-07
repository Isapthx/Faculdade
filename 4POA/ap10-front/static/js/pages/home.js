// Importamos a lógica de API para não repetir código fetch aqui
import { API } from '../api.js';

// Função para criar o HTML de cada card de disciplina
function criarCardDisciplina(disciplina) {
    const card = document.createElement('div');
    card.className = 'card-disciplina';
    
    // Lógica simples para cor do badge baseada no período
    const corPeriodo = disciplina.periodo <= 2 ? 'verde' : 'azul';

    card.innerHTML = `
        <div class="card-header">
            <span class="badge ${corPeriodo}">${disciplina.periodo}º Período</span>
            <h3>${disciplina.nome}</h3>
        </div>
        <div class="card-body">
            <div class="stats">
                <div class="stat-item">
                    <span class="label">Dificuldade</span>
                    <span class="value">${disciplina.dificuldadeMedia.toFixed(1)}/5</span>
                </div>
                <div class="stat-item">
                    <span class="label">Importância</span>
                    <span class="value">${disciplina.importanciaMedia.toFixed(1)}/5</span>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <button class="btn-detalhes" data-id="${disciplina.id}">
                Ver Conteúdos e Links
            </button>
        </div>
    `;

    // Evento de clique para navegar para os detalhes
    card.querySelector('.btn-detalhes').addEventListener('click', () => {
        window.location.href = `detalhes.html?id=${disciplina.id}`;
    });

    return card;
}

// Função principal que inicializa a home
async function initHome() {
    const container = document.getElementById('container-cards');
    
    try {
        const disciplinas = await API.getDisciplinas();
        
        container.innerHTML = ''; // Remove o "Carregando..."

        if (disciplinas.length === 0) {
            container.innerHTML = `
                <div class="aviso-vazio">
                    <p>Nenhuma disciplina cadastrada ainda.</p>
                </div>`;
            return;
        }

        disciplinas.forEach(disc => {
            const card = criarCardDisciplina(disc);
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = '<p class="erro">Erro ao carregar dados do servidor.</p>';
        console.error(error);
    }
}

// Dispara a função quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initHome);