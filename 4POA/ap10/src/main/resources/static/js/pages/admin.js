import { API } from '../api.js';

// ─── Inicialização ───────────────────────────────────────────────
async function init() {
    await carregarDisciplinasSelect();
    await carregarTabelaDisciplinas();
    await carregarLinksPendentes();
    configurarFormularios();
    configurarGerenciadorTopicos();
}

// ─── Disciplinas ─────────────────────────────────────────────────
async function carregarDisciplinasSelect() {
    const selectCadastro   = document.getElementById('select-disciplinas');
    const selectGerenciar  = document.getElementById('select-gerenciar-topicos');

    try {
        const disciplinas = await API.getDisciplinas();

        const opcoes = '<option value="">Selecione a disciplina...</option>' +
            disciplinas.map(d => `<option value="${d.id}">${d.nome} — ${d.periodo}º período</option>`).join('');

        selectCadastro.innerHTML  = opcoes;
        if (selectGerenciar) selectGerenciar.innerHTML = opcoes;

    } catch {
        selectCadastro.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function carregarTabelaDisciplinas() {
    const tbody = document.getElementById('tabela-disciplinas');
    try {
        const disciplinas = await API.getDisciplinas();
        if (!disciplinas.length) {
            tbody.innerHTML = '<tr><td colspan="3" style="color:#888">Nenhuma disciplina cadastrada.</td></tr>';
            return;
        }
        tbody.innerHTML = disciplinas.map(d => `
            <tr>
                <td><strong>${d.nome}</strong></td>
                <td>${d.periodo}º período</td>
                <td>
                    <button onclick="excluirDisciplina(${d.id})"
                        style="background:#dc3545; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer;">
                        Excluir
                    </button>
                </td>
            </tr>`).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="color:#c00">Erro ao carregar disciplinas.</td></tr>';
    }
}

window.excluirDisciplina = async (id) => {
    if (!confirm('Excluir esta disciplina e todos os seus tópicos?')) return;
    try {
        await fetch(`/api/disciplinas/${id}`, { method: 'DELETE' });
        await carregarTabelaDisciplinas();
        await carregarDisciplinasSelect();
        // Limpa a lista de tópicos se a disciplina excluída estava sendo gerenciada
        const selectGerenciar = document.getElementById('select-gerenciar-topicos');
        if (selectGerenciar && selectGerenciar.value === String(id)) {
            document.getElementById('lista-topicos').innerHTML = '';
        }
    } catch {
        alert('Erro ao excluir.');
    }
};

// ─── Formulários ─────────────────────────────────────────────────
function configurarFormularios() {
    document.getElementById('form-disciplina').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dados = {
            nome:        document.getElementById('nome').value,
            periodo:     Number(document.getElementById('periodo').value),
            dificuldadeMedia: Number(document.getElementById('dificuldade').value),
            importanciaMedia: Number(document.getElementById('importancia').value),
        };
        try {
            await fetch('/api/disciplinas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            e.target.reset();
            await carregarTabelaDisciplinas();
            await carregarDisciplinasSelect();
            alert('Disciplina salva com sucesso!');
        } catch {
            alert('Erro ao salvar disciplina.');
        }
    });

    document.getElementById('form-topico').addEventListener('submit', async (e) => {
        e.preventDefault();
        const disciplinaId = document.getElementById('select-disciplinas').value;
        const titulo       = document.getElementById('titulo-topico').value.trim();
        if (!disciplinaId) { alert('Selecione uma disciplina.'); return; }
        if (!titulo)       { alert('Informe o título do tópico.'); return; }

        try {
            const res = await fetch('/api/topicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, disciplina: { id: parseInt(disciplinaId) } })
            });
            if (!res.ok) throw new Error();
            e.target.reset();
            alert('Tópico adicionado!');
            // Se o gerenciador estiver na mesma disciplina, recarrega a lista
            const selectGerenciar = document.getElementById('select-gerenciar-topicos');
            if (selectGerenciar && selectGerenciar.value === disciplinaId) {
                await carregarTopicoDaDisciplina(disciplinaId);
            }
        } catch {
            alert('Erro ao adicionar tópico.');
        }
    });
}

// ─── Gerenciador de Tópicos (NOVO) ───────────────────────────────
function configurarGerenciadorTopicos() {
    const select = document.getElementById('select-gerenciar-topicos');
    if (!select) return;

    select.addEventListener('change', async () => {
        const id = select.value;
        const lista = document.getElementById('lista-topicos');
        if (!id) { lista.innerHTML = ''; return; }
        await carregarTopicoDaDisciplina(id);
    });
}

async function carregarTopicoDaDisciplina(idDisciplina) {
    const lista = document.getElementById('lista-topicos');
    lista.innerHTML = '<li style="color:#888;">Carregando...</li>';
    try {
        const res  = await fetch(`/api/disciplinas/${idDisciplina}`);
        const disc = await res.json();
        renderizarTopicos(disc.topicos || []);
    } catch {
        lista.innerHTML = '<li style="color:#c00">Erro ao carregar tópicos.</li>';
    }
}

function renderizarTopicos(topicos) {
    const lista = document.getElementById('lista-topicos');
    if (!topicos.length) {
        lista.innerHTML = '<li style="color:#888; padding:10px 0;">Nenhum tópico cadastrado para esta disciplina.</li>';
        return;
    }
    lista.innerHTML = topicos.map(t => `
        <li id="topico-${t.id}"
            style="display:flex; align-items:center; gap:8px; padding:10px 0; border-bottom:1px solid #eee;">

            <span class="titulo-topico" style="flex:1;">${escapeHtml(t.titulo)}</span>

            <input class="input-edicao" value="${escapeHtml(t.titulo)}"
                style="flex:1; display:none; padding:5px 10px; border:1px solid #ccc; border-radius:6px;" />

            <button onclick="editarTopico(${t.id})"   class="btn-editar"   style="${btn('#0d6efd')}">✏️ Editar</button>
            <button onclick="salvarEdicao(${t.id})"   class="btn-salvar"   style="${btn('#198754')}; display:none;">💾 Salvar</button>
            <button onclick="cancelarEdicao(${t.id})" class="btn-cancelar" style="${btn('#6c757d')}; display:none;">✖ Cancelar</button>
            <button onclick="removerTopico(${t.id})"  class="btn-remover"  style="${btn('#dc3545')}">🗑️ Remover</button>
        </li>
    `).join('');
}

// Ativa edição inline
window.editarTopico = (id) => {
    const li = document.getElementById(`topico-${id}`);
    li.querySelector('.titulo-topico').style.display = 'none';
    li.querySelector('.input-edicao').style.display  = 'block';
    li.querySelector('.btn-editar').style.display    = 'none';
    li.querySelector('.btn-salvar').style.display    = 'inline-block';
    li.querySelector('.btn-cancelar').style.display  = 'inline-block';
};

window.cancelarEdicao = (id) => {
    const li = document.getElementById(`topico-${id}`);
    li.querySelector('.titulo-topico').style.display = 'block';
    li.querySelector('.input-edicao').style.display  = 'none';
    li.querySelector('.btn-editar').style.display    = 'inline-block';
    li.querySelector('.btn-salvar').style.display    = 'none';
    li.querySelector('.btn-cancelar').style.display  = 'none';
};

window.salvarEdicao = async (id) => {
    const li    = document.getElementById(`topico-${id}`);
    const novo  = li.querySelector('.input-edicao').value.trim();
    if (!novo) { alert('O título não pode ser vazio.'); return; }

    try {
        const res = await fetch(`/api/topicos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: novo })
        });
        if (!res.ok) throw new Error();
        li.querySelector('.titulo-topico').innerText = novo;
        cancelarEdicao(id);
    } catch {
        alert('Erro ao salvar edição.');
    }
};

window.removerTopico = async (id) => {
    if (!confirm('Remover este tópico?')) return;
    try {
        const res = await fetch(`/api/topicos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        const li = document.getElementById(`topico-${id}`);
        li.style.background = '#fff5f5';
        setTimeout(() => li.remove(), 300);
    } catch {
        alert('Erro ao remover tópico.');
    }
};

// ─── Moderação de Links Pendentes ────────────────────────────────
async function carregarLinksPendentes() {
    const container = document.getElementById('secao-links-pendentes');
    if (!container) return;

    try {
        const links = await API.getLinksPendentes();

        if (!links.length) {
            container.innerHTML = `
                <div style="text-align:center; padding:24px; color:#aaa;">
                    <p style="font-size:1.8rem;">✅</p>
                    <p>Nenhuma sugestão pendente de aprovação.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                <thead>
                    <tr style="background:#f1f3f5;">
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">Nome</th>
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">Tipo</th>
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">URL</th>
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">Disciplina ID</th>
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${links.map(link => `
                        <tr id="link-row-${link.id}" style="border-bottom:1px solid #eee;">
                            <td style="padding:12px 14px; font-weight:500;">${escapeHtml(link.nome)}</td>
                            <td style="padding:12px 14px;">${badgeTipo(link.tipo)}</td>
                            <td style="padding:12px 14px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener"
                                   style="color:var(--azul-faeterj); text-decoration:none;" title="${escapeHtml(link.url)}">
                                   ${escapeHtml(link.url)}
                                </a>
                            </td>
                            <td style="padding:12px 14px; color:#888;">#${link.disciplinaId}</td>
                            <td style="padding:12px 14px;">
                                <div style="display:flex; gap:8px;">
                                    <button onclick="aprovarLink(${link.id})"
                                        style="background:#28a745; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem;">
                                        ✓ Aprovar
                                    </button>
                                    <button onclick="rejeitarLink(${link.id})"
                                        style="background:#dc3545; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.85rem;">
                                        ✗ Rejeitar
                                    </button>
                                </div>
                            </td>
                        </tr>`).join('')}
                </tbody>
            </table>`;
    } catch {
        container.innerHTML = '<p style="color:#c00">Erro ao carregar sugestões.</p>';
    }
}

window.aprovarLink = async (id) => {
    try {
        await API.aprovarLink(id);
        removerLinhaTabela(id, '✅ Aprovado!');
    } catch {
        alert('Erro ao aprovar link.');
    }
};

window.rejeitarLink = async (id) => {
    if (!confirm('Rejeitar e remover esta sugestão?')) return;
    try {
        await API.rejeitarLink(id);
        await API.deletarLink(id);
        removerLinhaTabela(id, '');
    } catch {
        removerLinhaTabela(id, '');
    }
};

function removerLinhaTabela(id, mensagem) {
    const row = document.getElementById(`link-row-${id}`);
    if (!row) return;
    if (mensagem) {
        row.style.background = '#eaffee';
        row.querySelector('td:last-child').innerHTML =
            `<span style="color:#1a7a3e; font-weight:500;">${mensagem}</span>`;
        setTimeout(() => row.remove(), 1200);
    } else {
        row.remove();
    }
    const tbody = row.closest('tbody');
    if (tbody && !tbody.querySelectorAll('tr').length) carregarLinksPendentes();
}

// ─── Helpers ─────────────────────────────────────────────────────
const btn = (cor) =>
    `background:${cor}; color:#fff; border:none; border-radius:6px; padding:5px 12px; cursor:pointer; font-size:0.85rem;`;

const ICONES_TIPO = {
    playlist: '🎵 Playlist',
    lista:    '📋 Lista',
    livro:    '📚 Livro',
    slides:   '🖥️ Slides',
    artigo:   '📄 Artigo',
    video:    '🎬 Vídeo',
};

function badgeTipo(tipo) {
    const label = ICONES_TIPO[tipo] || tipo;
    return `<span style="background:#f0f2f5; color:var(--azul-faeterj); padding:3px 10px;
                border-radius:12px; font-size:0.78rem; font-weight:600;">${label}</span>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

init();