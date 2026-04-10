const API_BASE_URL = "/api";

export const API = {

    // ── Disciplinas ──────────────────────────────────────────────
    async getDisciplinas() {
        const res = await fetch(`${API_BASE_URL}/disciplinas`);
        return await res.json();
    },
    async getDisciplinaPorId(id) {
        const res = await fetch(`${API_BASE_URL}/disciplinas/${id}`);
        if (!res.ok) throw new Error("Disciplina não encontrada");
        return await res.json();
    },
    async enviarAvaliacao(dados) {
        const res = await fetch(`${API_BASE_URL}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await res.json();
    },

    // ── Links Úteis ──────────────────────────────────────────────

    async getLinksDisciplina(disciplinaId) {
        const res = await fetch(`${API_BASE_URL}/links/disciplina/${disciplinaId}`);
        if (!res.ok) throw new Error("Erro ao buscar links");
        return await res.json();
    },
    async sugerirLink(dados) {
        const res = await fetch(`${API_BASE_URL}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error("Erro ao enviar sugestão");
        return await res.json();
    },

    // ── Admin: moderação ─────────────────────────────────────────

    async getLinksPendentes() {
        const res = await fetch(`${API_BASE_URL}/links/pendentes`);
        if (!res.ok) throw new Error("Erro ao buscar pendentes");
        return await res.json();
    },
    async aprovarLink(id) {
        const res = await fetch(`${API_BASE_URL}/links/${id}/aprovar`, { method: 'PATCH' });
        if (!res.ok) throw new Error("Erro ao aprovar");
        return await res.json();
    },
    async rejeitarLink(id) {
        const res = await fetch(`${API_BASE_URL}/links/${id}/rejeitar`, { method: 'PATCH' });
        if (!res.ok) throw new Error("Erro ao rejeitar");
        return await res.json();
    },
    async deletarLink(id) {
        const res = await fetch(`${API_BASE_URL}/links/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Erro ao deletar");
    }
};