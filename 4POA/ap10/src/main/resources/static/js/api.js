const API_BASE_URL = "http://localhost:8080/api";

export const API = {
    async getDisciplinas() {
        const res = await fetch(`${API_BASE_URL}/disciplinas`);
        return await res.json();
    },
    async getDisciplinaPorId(id) {
        const res = await fetch(`/api/disciplinas/${id}`);
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
    }
};