let todasDisciplinas = []; // cache para filtro/busca
 
// ─── Carregamento inicial ────────────────────────────────────────
async function carregarDisciplinas() {
    try {
        const resposta = await fetch('/api/disciplinas');
        todasDisciplinas = await resposta.json();
        renderizarCards(todasDisciplinas);
        atualizarContagem(todasDisciplinas.length);
    } catch (erro) {
        console.error("Erro ao buscar disciplinas:", erro);
        document.getElementById('container-cards').innerHTML =
            '<p class="estado-carregando">Erro ao conectar com o servidor.</p>';
    }
}
 
// ─── Renderização dos cards ──────────────────────────────────────
function renderizarCards(disciplinas) {
    const container = document.getElementById('container-cards');
 
    if (!disciplinas.length) {
        container.innerHTML = '<p class="estado-carregando">Nenhuma disciplina encontrada.</p>';
        return;
    }
 
    container.innerHTML = disciplinas.map(disc => `
        <div class="card-disciplina" onclick="verDetalhes(${disc.id})">
            <div class="card-topo">
                <div class="card-badges">
                    <span class="badge">${disc.periodo}º</span>
                </div>
                <span class="card-carga">80h</span>
            </div>
 
            <h3 class="card-titulo">${disc.nome}</h3>
 
            ${disc.topicos && disc.topicos.length
                ? `<p class="card-ementa">${disc.topicos.map(t => t.titulo).join('; ')}.</p>`
                : `<p class="card-ementa" style="font-style:italic;">Ementa não cadastrada.</p>`
            }
 
            <div class="card-metricas">
                <span class="metrica">⭐ Dificuldade: <strong>${(disc.dificuldadeMedia ?? 0).toFixed(1)}</strong></span>
                <span class="metrica">🎯 Importância: <strong>${(disc.importanciaMedia ?? 0).toFixed(1)}</strong></span>
            </div>
        </div>
    `).join('');
}
 
// ─── Busca e filtro ──────────────────────────────────────────────
function filtrarEBuscar() {
    const termo    = document.getElementById('input-busca').value.toLowerCase().trim();
    const periodoAtivo = document.querySelector('.filtro-btn.active')?.dataset.periodo ?? 'todos';
 
    const resultado = todasDisciplinas.filter(disc => {
        const batePeriodo = periodoAtivo === 'todos' || String(disc.periodo) === periodoAtivo;
        const bateBusca   = !termo ||
            disc.nome.toLowerCase().includes(termo) ||
            (disc.topicos && disc.topicos.some(t => t.titulo.toLowerCase().includes(termo)));
        return batePeriodo && bateBusca;
    });
 
    renderizarCards(resultado);
    atualizarContagem(resultado.length);
}
 
function atualizarContagem(total) {
    const el = document.getElementById('contagem-resultado');
    if (el) el.textContent = `Exibindo ${total} disciplina${total !== 1 ? 's' : ''}.`;
}
 
// ─── Eventos ─────────────────────────────────────────────────────
document.getElementById('input-busca').addEventListener('input', filtrarEBuscar);
 
document.getElementById('filtros-periodo').addEventListener('click', (e) => {
    const btn = e.target.closest('.filtro-btn');
    if (!btn) return;
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtrarEBuscar();
});
 
// ─── Navegação ───────────────────────────────────────────────────
export const verDetalhes = (id) => {
    window.location.href = `detalhes.html?id=${id}`;
};
window.verDetalhes = verDetalhes;
 
// ─── Init ────────────────────────────────────────────────────────
carregarDisciplinas();
