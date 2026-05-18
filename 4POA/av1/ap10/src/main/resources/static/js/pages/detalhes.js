import { API } from '../api.js';

const params       = new URLSearchParams(window.location.search);
const disciplinaId = params.get('id');

let disciplinaAtual = null;

// ─── Inicialização ───────────────────────────────────────────────
async function init() {
    if (!disciplinaId) {
        document.getElementById('nome-disciplina').textContent = 'Disciplina não informada';
        return;
    }

    try {
        disciplinaAtual = await API.getDisciplinaPorId(disciplinaId);
        document.getElementById('nome-disciplina').textContent   = disciplinaAtual.nome;
        document.getElementById('dificuldade-valor').textContent = disciplinaAtual.dificuldadeMedia?.toFixed(1) ?? '—';
        document.getElementById('importancia-valor').textContent = disciplinaAtual.importanciaMedia?.toFixed(1) ?? '—';
    } catch {
        document.getElementById('nome-disciplina').textContent = 'Erro ao carregar';
        return;
    }

    renderEmenta();   // 1º popula conteúdo
    renderLinks();
    configurarTabs(); // 2º configura abas
}

// ─── Abas ────────────────────────────────────────────────────────
function configurarTabs() {
    const botoes    = document.querySelectorAll('.tab-btn');
    const conteudos = document.querySelectorAll('.tab-content');

    conteudos.forEach(c => c.style.display = 'none');
    botoes.forEach(b => b.classList.remove('active'));

    if (botoes[0]) {
        botoes[0].classList.add('active');
        const primeiro = document.getElementById(botoes[0].dataset.target);
        if (primeiro) primeiro.style.display = 'block';
    }

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('active'));
            conteudos.forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            const alvo = document.getElementById(btn.dataset.target);
            if (alvo) alvo.style.display = 'block';
        });
    });
}

// ─── Aba: Ementa ─────────────────────────────────────────────────
function renderEmenta() {
    const container = document.getElementById('ementa');
    const topicos   = disciplinaAtual?.topicos ?? [];

    if (!topicos.length) {
        container.innerHTML = `
            <div class="aviso-vazio">
                <p>Nenhuma matéria ou tópico cadastrado para esta ementa ainda.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <ul class="lista-ementa">
            ${topicos.map(t => `
                <li>
                    <span class="icon-check">✔</span>
                    ${escapeHtml(t.titulo)}
                </li>
            `).join('')}
        </ul>`;
}

// ─── Aba: Links Úteis ────────────────────────────────────────────
async function renderLinks() {
    const container = document.getElementById('links');

    container.innerHTML = `
        <div class="links-header">
            <h3>Links Úteis</h3>
            <button id="btn-sugerir" class="btn-principal">+ Sugerir Link</button>
        </div>

        <div id="form-sugestao-wrapper" class="form-sugestao">
            <h4>Sugerir novo link</h4>
            <p>Sua sugestão será analisada pelo administrador antes de aparecer aqui.</p>
            <div class="form-sugestao-grid">
                <input type="text" id="link-nome" placeholder="Nome / Título do recurso">

                <select id="link-tipo">
                    <option value="">Tipo de recurso...</option>
                    <option value="playlist">🎵 Playlist</option>
                    <option value="lista">📋 Lista de exercícios</option>
                    <option value="livro">📚 Livro / E-book</option>
                    <option value="slides">🖥️ Slides</option>
                    <option value="artigo">📄 Artigo</option>
                    <option value="video">🎬 Vídeo</option>
                </select>

                <input type="url" id="link-url" placeholder="https://...">

                <div class="form-sugestao-acoes">
                    <button id="btn-enviar-sugestao" class="btn-principal"
                        style="background:var(--azul-faeterj); color:white; flex:1; justify-content:center;">
                        Enviar sugestão
                    </button>
                    <button id="btn-cancelar-sugestao" class="btn-principal"
                        style="background:#e9ecef; border-color:#e9ecef; color:var(--texto); justify-content:center;">
                        Cancelar
                    </button>
                </div>

                <div id="msg-sugestao" style="display:none;"></div>
            </div>
        </div>

        <div id="lista-links-aprovados">
            <p style="color:var(--texto-suave); font-size:0.9rem;">Carregando links...</p>
        </div>
    `;

    document.getElementById('btn-sugerir').addEventListener('click', () => {
        const form = document.getElementById('form-sugestao-wrapper');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('btn-cancelar-sugestao').addEventListener('click', () => {
        document.getElementById('form-sugestao-wrapper').style.display = 'none';
        limparFormularioSugestao();
    });

    document.getElementById('btn-enviar-sugestao').addEventListener('click', enviarSugestao);

    await carregarLinksAprovados();
}

async function carregarLinksAprovados() {
    const container = document.getElementById('lista-links-aprovados');
    try {
        const links = await API.getLinksDisciplina(disciplinaId);

        if (!links.length) {
            container.innerHTML = `
                <div class="links-vazio">
                    <p>🔗</p>
                    <p>Nenhum link aprovado ainda.</p>
                    <p>Seja o primeiro a sugerir um recurso!</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <table class="tabela-links">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${links.map(link => `
                        <tr>
                            <td style="font-weight:600;">${escapeHtml(link.nome)}</td>
                            <td>${badgeTipo(link.tipo)}</td>
                            <td>
                                <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="link-acesso">
                                    Acessar ↗
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    } catch {
        container.innerHTML = '<p style="color:#c00; font-size:0.9rem;">Erro ao carregar links.</p>';
    }
}

async function enviarSugestao() {
    const nome = document.getElementById('link-nome').value.trim();
    const tipo = document.getElementById('link-tipo').value;
    const url  = document.getElementById('link-url').value.trim();
    const msg  = document.getElementById('msg-sugestao');

    if (!nome || !tipo || !url) { exibirMensagem(msg, 'Preencha todos os campos.', 'erro'); return; }
    if (!url.startsWith('http')) { exibirMensagem(msg, 'Insira uma URL válida (começando com http/https).', 'erro'); return; }

    const btn = document.getElementById('btn-enviar-sugestao');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        await API.sugerirLink({ disciplinaId: Number(disciplinaId), nome, tipo, url });
        exibirMensagem(msg, '✅ Sugestão enviada! Aguarde aprovação do administrador.', 'ok');
        limparFormularioSugestao();
    } catch {
        exibirMensagem(msg, '❌ Erro ao enviar. Tente novamente.', 'erro');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar sugestão';
    }
}

// ─── Helpers ─────────────────────────────────────────────────────
function limparFormularioSugestao() {
    document.getElementById('link-nome').value = '';
    document.getElementById('link-tipo').value = '';
    document.getElementById('link-url').value  = '';
    document.getElementById('msg-sugestao').style.display = 'none';
}

function exibirMensagem(el, texto, tipo) {
    el.style.display      = 'block';
    el.style.color        = tipo === 'ok' ? '#1a7a3e' : '#c00';
    el.style.background   = tipo === 'ok' ? '#eaffee' : '#fff0f0';
    el.style.padding      = '10px 14px';
    el.style.borderRadius = '8px';
    el.style.fontSize     = '0.875rem';
    el.textContent        = texto;
}

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
    return `<span style="background:#eef1f6; color:var(--azul-faeterj); padding:3px 10px;
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