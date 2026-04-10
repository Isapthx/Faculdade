import { API } from '../api.js';

// Seleção de elementos do DOM
const formDisciplina = document.getElementById('form-disciplina');
const tabelaDisciplinas = document.getElementById('tabela-disciplinas');
const formTopico = document.getElementById('form-topico');
const selectDisciplinas = document.getElementById('select-disciplinas');

/**
 * CARREGAMENTO DE DADOS
 */

// Atualiza a tabela de disciplinas e o dropdown de seleção
async function carregarDadosAdmin() {
    try {
        const disciplinas = await API.getDisciplinas();
        console.log("Disciplinas recebidas:", disciplinas); // ADICIONE ISSO

        if (disciplinas.length === 0) {
            tabelaDisciplinas.innerHTML = '<tr><td colspan="3">Nenhuma disciplina no banco.</td></tr>';
            return;
        }
        
        // 1. Renderiza a Tabela
        tabelaDisciplinas.innerHTML = disciplinas.map(d => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;"><strong>${d.nome}</strong></td>
                <td>${d.periodo}º Período</td>
                <td>
                    <button onclick="excluirDisciplina(${d.id})" style="color: #dc3545; cursor: pointer; border: none; background: none; font-weight: bold;">
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');

        // 2. Renderiza o Select (Dropdown) para os tópicos
        selectDisciplinas.innerHTML = '<option value="">Selecione a Disciplina...</option>' + 
            disciplinas.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');

    } catch (error) {
        console.error("Erro ao carregar dados no admin:", error);
    }
}

/**
 * GESTÃO DE DISCIPLINAS
 */

formDisciplina.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const novaDisciplina = {
        nome: document.getElementById('nome').value,
        periodo: parseInt(document.getElementById('periodo').value),
        dificuldadeMedia: parseFloat(document.getElementById('dificuldade').value)
    };

    try {
        const response = await fetch('/api/disciplinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaDisciplina)
        });

        if (response.ok) {
            alert("✅ Disciplina cadastrada com sucesso!");
            formDisciplina.reset();
            carregarDadosAdmin(); // Recarrega tudo
        }
    } catch (error) {
        alert("❌ Erro ao conectar com o servidor.");
    }
});

// Função global para excluir disciplina
window.excluirDisciplina = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta disciplina e todos os seus tópicos?")) {
        try {
            const response = await fetch(`/api/disciplinas/${id}`, { method: 'DELETE' });
            if (response.ok) {
                carregarDadosAdmin();
            }
        } catch (error) {
            alert("Erro ao excluir disciplina.");
        }
    }
};

/**
 * GESTÃO DE TÓPICOS (EMENTA)
 */

formTopico.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idDisciplina = selectDisciplinas.value;
    const titulo = document.getElementById('titulo-topico').value;

    if (!idDisciplina) {
        alert("Por favor, selecione uma disciplina primeiro!");
        return;
    }

    const novoTopico = {
        titulo: titulo,
        disciplina: { id: parseInt(idDisciplina) }
    };

    try {
        const response = await fetch('/api/topicos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoTopico)
        });

        if (response.ok) {
            alert(`✅ Tópico "${titulo}" adicionado!`);
            document.getElementById('titulo-topico').value = '';
            // Não precisa recarregar a tabela de disciplinas aqui
        }
    } catch (error) {
        alert("Erro ao salvar tópico.");
    }
});

/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', carregarDadosAdmin);