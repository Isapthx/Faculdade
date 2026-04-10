import { API } from '../api.js';

// ─── Inicialização ───────────────────────────────────────────────
async function init() {
    await carregarDisciplinasSelect();
    await carregarTabelaDisciplinas();
    await carregarLinksPendentes();
    configurarFormularios();
}

// ─── Disciplinas ─────────────────────────────────────────────────
async function carregarDisciplinasSelect() {
    const select = document.getElementById('select-disciplinas');
    try {
        const disciplinas = await API.getDisciplinas();
        select.innerHTML = '<option value="">Selecione a disciplina...</option>' +
            disciplinas.map(d => `<option value="${d.id}">${d.nome} — ${d.periodo}º período</option>`).join('');
    } catch {
        select.innerHTML = '<option value="">Erro ao carregar</option>';
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

// Expõe globalmente para o onclick inline da tabela
window.excluirDisciplina = async (id) => {
    if (!confirm('Excluir esta disciplina?')) return;
    try {
        await fetch(`/api/disciplinas/${id}`, { method: 'DELETE' });
        await carregarTabelaDisciplinas();
        await carregarDisciplinasSelect();
    } catch {
        alert('Erro ao excluir.');
    }
};

// ─── Formulários existentes ──────────────────────────────────────
function configurarFormularios() {
    document.getElementById('form-disciplina').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dados = {
            nome:        document.getElementById('nome').value,
            periodo:     Number(document.getElementById('periodo').value),
            dificuldade: Number(document.getElementById('dificuldade').value),
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
        const titulo        = document.getElementById('titulo-topico').value;
        if (!disciplinaId) { alert('Selecione uma disciplina.'); return; }
        try {
            await fetch(`/api/disciplinas/${disciplinaId}/topicos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo })
            });
            e.target.reset();
            alert('Tópico adicionado!');
        } catch {
            alert('Erro ao adicionar tópico.');
        }
    });
}

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

// Funções expostas globalmente para os botões da tabela
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
        await API.deletarLink(id); // rejeitar + deletar em sequência
        removerLinhaTabela(id, '');
    } catch {
        // Mesmo que o delete falhe, remove visualmente
        removerLinhaTabela(id, '');
    }
};

function removerLinhaTabela(id, mensagem) {
    const row = document.getElementById(`link-row-${id}`);
    if (!row) return;
    if (mensagem) {
        row.style.background = '#eaffee';
        row.querySelector('td:last-child').innerHTML = `<span style="color:#1a7a3e; font-weight:500;">${mensagem}</span>`;
        setTimeout(() => row.remove(), 1200);
    } else {
        row.remove();
    }

    // Se a tabela ficou vazia, exibe aviso
    const tbody = row.closest('tbody');
    if (tbody && !tbody.querySelectorAll('tr').length) {
        carregarLinksPendentes();
    }
}

// ─── Helpers ─────────────────────────────────────────────────────
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