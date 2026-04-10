import { API } from '../api.js';
 
// Lê o id da disciplina da URL: detalhes.html?id=3
const params = new URLSearchParams(window.location.search);
const disciplinaId = params.get('id');
 
// ─── Inicialização ───────────────────────────────────────────────
async function init() {
    if (!disciplinaId) {
        document.getElementById('nome-disciplina').textContent = 'Disciplina não informada';
        return;
    }
 
    try {
        const disciplina = await API.getDisciplinaPorId(disciplinaId);
        document.getElementById('nome-disciplina').textContent = disciplina.nome;
    } catch {
        document.getElementById('nome-disciplina').textContent = 'Erro ao carregar';
    }
 
    renderEmenta();
    renderLinks();
    configurarTabs();
}
 
// ─── Abas ────────────────────────────────────────────────────────
function configurarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).style.display = 'block';
        });
    });
}
 
// ─── Aba: Ementa ─────────────────────────────────────────────────
async function renderEmenta() {
    const container = document.getElementById('ementa');
    container.innerHTML = '<p>Carregando ementa...</p>';
    // Implemente conforme sua API de tópicos existente
    container.innerHTML = '<p style="color:#888">Ementa da disciplina aparecerá aqui.</p>';
}
 
// ─── Aba: Links Úteis ────────────────────────────────────────────
async function renderLinks() {
    const container = document.getElementById('links');
 
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="margin:0">Links Úteis</h3>
            <button id="btn-sugerir" class="btn-principal">+ Sugerir Link</button>
        </div>
 
        <!-- Formulário de sugestão (começa oculto) -->
        <div id="form-sugestao-wrapper" style="display:none; background:#f8f9fa; border-radius:10px; padding:20px; margin-bottom:25px; border:1px solid #e0e0e0;">
            <h4 style="margin:0 0 15px">Sugerir novo link</h4>
            <p style="font-size:0.85rem; color:#666; margin-bottom:15px;">
                Sua sugestão será analisada pelo administrador antes de aparecer aqui.
            </p>
            <div style="display:grid; gap:12px;">
                <input type="text" id="link-nome" placeholder="Nome / Título do recurso" 
                    style="padding:10px 14px; border:1px solid #ddd; border-radius:8px; font-size:0.95rem;">
                
                <select id="link-tipo" style="padding:10px 14px; border:1px solid #ddd; border-radius:8px; background:white; font-size:0.95rem;">
                    <option value="">Tipo de recurso...</option>
                    <option value="playlist">🎵 Playlist</option>
                    <option value="lista">📋 Lista de exercícios</option>
                    <option value="livro">📚 Livro / E-book</option>
                    <option value="slides">🖥️ Slides</option>
                    <option value="artigo">📄 Artigo</option>
                    <option value="video">🎬 Vídeo</option>
                </select>
 
                <input type="url" id="link-url" placeholder="https://..." 
                    style="padding:10px 14px; border:1px solid #ddd; border-radius:8px; font-size:0.95rem;">
 
                <div style="display:flex; gap:10px;">
                    <button id="btn-enviar-sugestao" class="btn-principal" 
                        style="background:var(--azul-faeterj); color:white; flex:1; justify-content:center;">
                        Enviar sugestão
                    </button>
                    <button id="btn-cancelar-sugestao" class="btn-principal"
                        style="background:#ccc; border-color:#ccc; color:#444; justify-content:center;">
                        Cancelar
                    </button>
                </div>
                <div id="msg-sugestao" style="font-size:0.9rem; display:none;"></div>
            </div>
        </div>
 
        <!-- Lista de links aprovados -->
        <div id="lista-links-aprovados">
            <p style="color:#888">Carregando links...</p>
        </div>
    `;
 
    // Evento: mostrar/esconder formulário
    document.getElementById('btn-sugerir').addEventListener('click', () => {
        const form = document.getElementById('form-sugestao-wrapper');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
 
    document.getElementById('btn-cancelar-sugestao').addEventListener('click', () => {
        document.getElementById('form-sugestao-wrapper').style.display = 'none';
        limparFormularioSugestao();
    });
 
    document.getElementById('btn-enviar-sugestao').addEventListener('click', enviarSugestao);
 
    // Carrega links aprovados
    await carregarLinksAprovados();
}
 
async function carregarLinksAprovados() {
    const container = document.getElementById('lista-links-aprovados');
    try {
        const links = await API.getLinksDisciplina(disciplinaId);
 
        if (!links.length) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#aaa;">
                    <p style="font-size:2rem;">🔗</p>
                    <p>Nenhum link aprovado ainda.</p>
                    <p style="font-size:0.85rem;">Seja o primeiro a sugerir um recurso!</p>
                </div>`;
            return;
        }
 
        container.innerHTML = `
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f1f3f5;">
                        <th style="text-align:left; padding:10px 14px; border-radius:8px 0 0 0; font-size:0.85rem; color:#666;">Nome</th>
                        <th style="text-align:left; padding:10px 14px; font-size:0.85rem; color:#666;">Tipo</th>
                        <th style="text-align:left; padding:10px 14px; border-radius:0 8px 0 0; font-size:0.85rem; color:#666;">Link</th>
                    </tr>
                </thead>
                <tbody>
                    ${links.map(link => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:12px 14px; font-weight:500;">${escapeHtml(link.nome)}</td>
                            <td style="padding:12px 14px;">${badgeTipo(link.tipo)}</td>
                            <td style="padding:12px 14px;">
                                <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener"
                                   style="color:var(--azul-faeterj); font-weight:500; text-decoration:none;">
                                   Acessar ↗
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    } catch {
        container.innerHTML = '<p style="color:#c00;">Erro ao carregar links.</p>';
    }
}
 
async function enviarSugestao() {
    const nome = document.getElementById('link-nome').value.trim();
    const tipo = document.getElementById('link-tipo').value;
    const url  = document.getElementById('link-url').value.trim();
    const msg  = document.getElementById('msg-sugestao');
 
    if (!nome || !tipo || !url) {
        exibirMensagem(msg, 'Preencha todos os campos.', 'erro');
        return;
    }
    if (!url.startsWith('http')) {
        exibirMensagem(msg, 'Insira uma URL válida (começando com http/https).', 'erro');
        return;
    }
 
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
    el.style.display = 'block';
    el.style.color   = tipo === 'ok' ? '#1a7a3e' : '#c00';
    el.style.background = tipo === 'ok' ? '#eaffee' : '#fff0f0';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '8px';
    el.textContent   = texto;
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
 