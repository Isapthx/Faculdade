"use client";

import { useState } from "react";
import { Empresa, Produto, Categoria } from "@/types";

interface Props {
  empresa: Empresa;
  slug: string;
}

export default function DashboardClient({ empresa }: Props) {
  const empresaId = empresa.id;

  const produtosIniciais =
    empresa.categorias?.flatMap((cat) => cat.produtos ?? []) ?? [];

  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [categorias, setCategorias] = useState<Categoria[]>(empresa.categorias ?? []);

  // ── Produto form (create) ──
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState<number>(0);
  const [urlImagem, setUrlImagem] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);

  // ── Categoria form ──
  const [nomeCategoria, setNomeCategoria] = useState("");

  // ── Inline edit categoria ──
  const [editandoCatId, setEditandoCatId] = useState<number | null>(null);
  const [editandoCatNome, setEditandoCatNome] = useState("");

  // ── Modal de edição de produto ──
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState<number>(0);
  const [editUrlImagem, setEditUrlImagem] = useState("");
  const [editCategoria, setEditCategoria] = useState<number | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // =========================
  // 🟢 CREATE PRODUTO
  // =========================
  async function criarProduto() {
    if (!nome.trim()) { alert("Digite um nome"); return; }
    if (!categoriaSelecionada) { alert("Selecione uma categoria"); return; }
    if (!preco || preco <= 0) { alert("Preço inválido"); return; }

    const categoria = categorias.find((c) => c.id === categoriaSelecionada);
    if (!categoria) return;

    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/produtos?categoriaId=${categoriaSelecionada}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, descricao, preco, urlImagem }),
      }
    );

    if (!res.ok) { alert("Erro ao criar produto"); return; }

    const novo: Produto = await res.json();
    const novoNormalizado: Produto = {
      ...novo,
      preco: Number(novo.preco ?? preco),
      categoria,
    };

    setProdutos((prev) => [...prev, novoNormalizado]);
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaSelecionada
          ? { ...cat, produtos: [...(cat.produtos ?? []), novoNormalizado] }
          : cat
      )
    );

    setNome(""); setDescricao(""); setPreco(0);
    setUrlImagem(""); setCategoriaSelecionada(null);
  }

  // =========================
  // ✏️ OPEN EDIT MODAL
  // =========================
  function abrirEdicaoProduto(produto: Produto) {
    setProdutoEditando(produto);
    setEditNome(produto.nome);
    setEditDescricao(produto.descricao ?? "");
    setEditPreco(Number(produto.preco));
    setEditUrlImagem(produto.urlImagem ?? "");
    setEditCategoria(produto.categoria?.id ?? null);
  }

  function fecharEdicaoProduto() {
    setProdutoEditando(null);
  }

  // =========================
  // ✏️ SAVE EDIT PRODUTO
  // =========================
  async function salvarEdicaoProduto() {
    if (!produtoEditando) return;
    if (!editNome.trim()) { alert("Nome obrigatório"); return; }
    if (!editPreco || editPreco <= 0) { alert("Preço inválido"); return; }
    if (!editCategoria) { alert("Selecione uma categoria"); return; }

    setSalvandoEdicao(true);

    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/produtos/${produtoEditando.id}?categoriaId=${editCategoria}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editNome,
          descricao: editDescricao,
          preco: editPreco,
          urlImagem: editUrlImagem,
        }),
      }
    );

    setSalvandoEdicao(false);

    if (!res.ok) { alert("Erro ao editar produto"); return; }

    const atualizado: Produto = await res.json();
    const categoriaObj = categorias.find((c) => c.id === editCategoria);

    const normalizado: Produto = {
      ...atualizado,
      preco: Number(atualizado.preco ?? editPreco),
      categoria: categoriaObj,
    };

    setProdutos((prev) => prev.map((p) => (p.id === normalizado.id ? normalizado : p)));
    setCategorias((prev) =>
      prev.map((cat) => ({
        ...cat,
        produtos: (cat.produtos ?? []).map((p) => (p.id === normalizado.id ? normalizado : p)),
      }))
    );

    fecharEdicaoProduto();
  }

  // =========================
  // 🔴 DELETE PRODUTO
  // =========================
  async function deletarProduto(id: number) {
    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/produtos/${id}`,
      { method: "DELETE" }
    );

    if (!res.ok) { alert("Erro ao deletar produto"); return; }

    setProdutos((prev) => prev.filter((p) => p.id !== id));
    setCategorias((prev) =>
      prev.map((cat) => ({
        ...cat,
        produtos: (cat.produtos ?? []).filter((p) => p.id !== id),
      }))
    );
  }

  // =========================
  // 🟡 CREATE CATEGORIA
  // =========================
  async function criarCategoria() {
    if (!nomeCategoria.trim()) return;

    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/categorias`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeCategoria }),
      }
    );

    if (!res.ok) { alert("Erro ao criar categoria"); return; }

    const nova: Categoria = await res.json();
    setCategorias((prev) => [...prev, { ...nova, produtos: [] }]);
    setNomeCategoria("");
  }

  // =========================
  // ✏️ EDIT CATEGORIA (inline)
  // =========================
  function iniciarEdicaoCategoria(cat: Categoria) {
    setEditandoCatId(cat.id);
    setEditandoCatNome(cat.nome);
  }

  async function salvarEdicaoCategoria(id: number) {
    if (!editandoCatNome.trim()) return;

    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/categorias/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: editandoCatNome }),
      }
    );

    if (!res.ok) { alert("Erro ao editar categoria"); return; }

    setCategorias((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, nome: editandoCatNome } : cat))
    );
    setEditandoCatId(null);
  }

  // =========================
  // 🔴 DELETE CATEGORIA
  // =========================
  async function deletarCategoria(id: number) {
    const res = await fetch(
      `http://localhost:8080/api/admin/empresas/${empresaId}/categorias/${id}`,
      { method: "DELETE" }
    );

    if (!res.ok) { alert("Erro ao deletar categoria"); return; }

    setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    setProdutos((prev) => prev.filter((p) => p.categoria?.id !== id));
  }

  return (
    <>
      {/* ============ MODAL EDIÇÃO PRODUTO ============ */}
      {produtoEditando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) fecharEdicaoProduto(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Editar Produto</h2>
              <button
                onClick={fecharEdicaoProduto}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 grid gap-3">
              {/* Preview imagem */}
              {editUrlImagem && (
                <div className="flex justify-center mb-1">
                  <img
                    src={editUrlImagem}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl border shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              <div className="grid gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome</label>
                <input
                  className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</label>
                <textarea
                  className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={2}
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  placeholder="Descrição (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preço (R$)</label>
                  <input
                    type="text"
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={editPreco}
                    onChange={(e) => setEditPreco(Number(e.target.value.replace(",", ".")))}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</label>
                  <select
                    className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    value={editCategoria ?? ""}
                    onChange={(e) => setEditCategoria(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="" disabled>Selecionar</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL da Imagem</label>
                <input
                  className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={editUrlImagem}
                  onChange={(e) => setEditUrlImagem(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-5 pt-0">
              <button
                onClick={fecharEdicaoProduto}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoProduto}
                disabled={salvandoEdicao}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {salvandoEdicao ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Salvando...
                  </>
                ) : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DASHBOARD ============ */}
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">{empresa.nome}</h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ================= PRODUTOS ================= */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Produtos</h2>

            <div className="grid gap-2 mb-5">
              <input className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />

              <input className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />

              <input type="text" className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={preco} onChange={(e) => setPreco(Number(e.target.value.replace(",", ".")))}
                placeholder="Preço (ex: 10.50)" />

              <input className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={urlImagem} onChange={(e) => setUrlImagem(e.target.value)} placeholder="URL da imagem" />

              <select className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                value={categoriaSelecionada ?? ""}
                onChange={(e) => setCategoriaSelecionada(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="" disabled>Categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>

              <button onClick={criarProduto}
                className="bg-blue-500 text-white p-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                Adicionar Produto
              </button>
            </div>

            <ul className="space-y-2">
              {produtos.map((p, index) => (
                <li key={p.id ?? index}
                  className="flex gap-3 items-center border border-gray-100 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <img
                    src={p.urlImagem || "https://placehold.co/50x50"}
                    alt={p.nome}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.nome}</p>
                    <p className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                          {p.categoria?.nome ?? "Sem categoria"}
                        </span>
                        {Number(p.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </p>
                    {p.descricao && (
                      <p className="text-xs text-gray-400 truncate">{p.descricao}</p>
                    )}
                  </div>
                  {/* Ações — aparecem no hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => abrirEdicaoProduto(p)}
                      title="Editar produto"
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deletarProduto(p.id)}
                      title="Deletar produto"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= CATEGORIAS ================= */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Categorias</h2>

            <div className="flex gap-2 mb-5">
              <input
                className="border border-gray-200 p-2.5 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") criarCategoria(); }}
                placeholder="Nova categoria"
              />
              <button
                onClick={criarCategoria}
                className="bg-green-500 text-white px-4 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex-shrink-0"
              >
                +
              </button>
            </div>

            <ul className="space-y-2">
              {categorias.map((cat) => (
                <li key={cat.id}
                  className="flex items-center gap-2 border border-gray-100 p-3 rounded-xl group hover:bg-gray-50 transition-colors">

                  {editandoCatId === cat.id ? (
                    /* ── Modo edição inline ── */
                    <>
                      <input
                        autoFocus
                        className="flex-1 border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={editandoCatNome}
                        onChange={(e) => setEditandoCatNome(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") salvarEdicaoCategoria(cat.id);
                          if (e.key === "Escape") setEditandoCatId(null);
                        }}
                      />
                      <button
                        onClick={() => salvarEdicaoCategoria(cat.id)}
                        title="Salvar"
                        className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditandoCatId(null)}
                        title="Cancelar"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    /* ── Modo visualização ── */
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-700">{cat.nome}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {(cat.produtos ?? []).length} produto{(cat.produtos ?? []).length !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => iniciarEdicaoCategoria(cat)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deletarCategoria(cat.id)}
                          title="Deletar"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

