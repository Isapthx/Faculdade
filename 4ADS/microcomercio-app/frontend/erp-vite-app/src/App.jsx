import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LayoutDashboard, Tag, Bookmark, Users, Boxes,
  Receipt, Settings, Plus, Pencil, Trash2, X, Check,
  AlertTriangle, RefreshCw, ChevronDown, Package,
  Search, Loader2, CircleAlert, BookOpen, Stamp,
  Wallet, PackageX,
  Menu, ArrowRight, Inbox, Link2, CheckCircle2, XCircle
} from "lucide-react";

/* ============================================================
   CONFIGURAÇÃO CENTRAL —
   ============================================================ */
const ENDPOINTS = {
  clientes: "/clientes",
  categorias: "/categorias",
  marcas: "/marcas",
  produtos: "/produtos",
  estoque: "/estoque",
  vendas: "/vendas",
  dashboard: "/dashboard",
};

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatCurrency(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("pt-BR");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function coerceList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["items", "data", "results", "registros"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function pick(obj, keys, fallback) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
}

/* ============================================================
   CLIENTE HTTP
   ============================================================ */
function buildClient(baseUrl) {
  async function request(method, path, body) {
    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error(
        "Não foi possível alcançar a API. Verifique a URL configurada, o CORS do backend e sua conexão."
      );
    }

    let payload = null;
    const text = await res.text();
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }

    if (!res.ok) {
      const detail =
        (payload && typeof payload === "object" && (payload.detail || payload.message)) ||
        (typeof payload === "string" ? payload : null);
      const byStatus = {
        400: "Requisição inválida.",
        404: "Recurso não encontrado.",
        409: "Conflito de dados.",
        500: "Erro interno do servidor.",
      };
      throw new Error(detail ? String(detail) : (byStatus[res.status] || `Erro (${res.status}).`));
    }
    return payload;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    del: (path) => request("DELETE", path),
  };
}

/* ============================================================
   ÁTOMOS DE UI
   ============================================================ */

function Spinner({ className }) {
  return <Loader2 className={cx("animate-spin", className)} size={18} />;
}

function StampBadge({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-stone-400 text-stone-600",
    good: "border-emerald-600 text-emerald-700",
    warn: "border-amber-600 text-amber-700",
    bad: "border-rose-700 text-rose-700",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5",
        "text-[10px] font-mono font-bold uppercase tracking-wider -rotate-2",
        "bg-white/40",
        tones[tone]
      )}
      style={{ letterSpacing: "0.08em" }}
    >
      {children}
    </span>
  );
}

function Button({ variant = "primary", size = "md", className, children, ...rest }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-amber-700 text-white hover:bg-amber-800 focus-visible:ring-amber-700",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-900",
    ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400",
    outline: "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 focus-visible:ring-zinc-400",
    danger: "bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-700",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

function IconButton({ title, className, children, ...rest }) {
  return (
    <button
      title={title}
      className={cx(
        "inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <span>{label}{required && <span className="text-rose-600"> *</span>}</span>
        {hint && <span className="font-normal text-zinc-400 normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

const inputBase = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 disabled:bg-zinc-100 disabled:text-zinc-400";

function TextInput(props) {
  return <input className={inputBase} {...props} />;
}

function NumberInput(props) {
  return <input type="number" className={cx(inputBase, "font-mono")} {...props} />;
}

function Textarea(props) {
  return <textarea className={cx(inputBase, "min-h-[80px] resize-y")} {...props} />;
}

function SelectInput({ children, ...props }) {
  return (
    <div className="relative">
      <select className={cx(inputBase, "appearance-none pr-8")} {...props}>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-amber-700 focus:ring-amber-700" {...props} />
      {label}
    </label>
  );
}

function EmptyState({ icon: Icon = Inbox, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-14 text-center">
      <Icon size={26} className="text-zinc-400" />
      <p className="text-sm font-medium text-zinc-600">{title}</p>
      {hint && <p className="max-w-sm text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function LoadingBlock({ label = "Carregando registros…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-zinc-400">
      <Spinner className="text-amber-700" />
      <p className="text-xs font-mono uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <CircleAlert size={24} className="text-rose-600" />
      <p className="max-w-md text-sm text-rose-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} /> Tentar de novo
        </Button>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cx("w-full rounded-lg bg-white shadow-2xl", width)} style={{ maxHeight: "90vh" }}>
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-zinc-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          <IconButton title="Fechar" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(90vh - 64px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = "Confirmar", danger, onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-zinc-900">
          <AlertTriangle size={18} className={danger ? "text-rose-600" : "text-amber-600"} />
          <h3 className="font-serif text-base font-semibold">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancelar</Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner className="h-3.5 w-3.5" /> : null} {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Pilha de notificações (toasts) */
function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm shadow-lg",
            t.type === "error" && "border-rose-200 bg-rose-50 text-rose-800",
            t.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            t.type === "info" && "border-zinc-200 bg-white text-zinc-800"
          )}
        >
          {t.type === "error" && <XCircle size={16} className="mt-0.5 shrink-0" />}
          {t.type === "success" && <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          {t.type === "info" && <CircleAlert size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="text-current opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* Tabela genérica com busca e ações por linha */
function DataTable({ columns, rows, idKey = "id", onEdit, onDelete, searchable, searchPlaceholder, emptyTitle, emptyHint }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !q.trim()) return rows;
    const needle = q.trim().toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(pick(r, [c.key], "")).toLowerCase().includes(needle))
    );
  }, [rows, q, columns, searchable]);

  return (
    <div>
      {searchable && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder || "Buscar…"}
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>
          <span className="font-mono text-xs text-zinc-400">{filtered.length} registro{filtered.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle || "Nenhum registro encontrado"} hint={emptyHint} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-3 py-2 font-semibold">{c.label}</th>
                ))}
                {(onEdit || onDelete) && <th className="px-3 py-2 text-right font-semibold">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((row) => (
                <tr key={row[idKey]} className="hover:bg-amber-50/40">
                  {columns.map((c) => (
                    <td key={c.key} className={cx("px-3 py-2.5 text-zinc-700", c.mono && "font-mono")}>
                      {c.render ? c.render(row) : (pick(row, [c.key], "—") ?? "—")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <IconButton title="Editar" onClick={() => onEdit(row)}><Pencil size={15} /></IconButton>
                        )}
                        {onDelete && (
                          <IconButton title="Excluir" onClick={() => onDelete(row)} className="hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} /></IconButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SimpleCrudView({
  client, toast, endpoint, title, subtitle, icon: Icon,
  fields, columns, idKey = "id", initialForm,
  beforeSubmit, emptyTitle, emptyHint, extraOptions = {},
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm || {});
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [optionLists, setOptionLists] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.get(endpoint);
      setRows(coerceList(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client, endpoint]);

  useEffect(() => { load(); }, [load]);

  const optionEndpointsKey = fields.filter((f) => f.optionsEndpoint).map((f) => `${f.name}:${f.optionsEndpoint}`).join("|");
  useEffect(() => {
    const selectFields = fields.filter((f) => f.optionsEndpoint);
    if (selectFields.length === 0) return;
    (async () => {
      const next = {};
      for (const f of selectFields) {
        try {
          const data = await client.get(f.optionsEndpoint);
          next[f.name] = coerceList(data);
        } catch {
          next[f.name] = [];
        }
      }
      setOptionLists(next);
    })();
  }, [client, optionEndpointsKey]); 
  function openCreate() {
    setEditing(null);
    setForm(initialForm || {});
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    const next = { ...(initialForm || {}) };
    fields.forEach((f) => { next[f.name] = pick(row, [f.name], next[f.name] ?? ""); });
    setForm(next);
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    fields.forEach((f) => {
      if (f.required && (form[f.name] === "" || form[f.name] === undefined || form[f.name] === null)) {
        errs[f.name] = "Campo obrigatório.";
      }
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      let payload = { ...form };
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.name] !== "" && payload[f.name] !== undefined) {
          payload[f.name] = Number(payload[f.name]);
        }
      });
      if (beforeSubmit) payload = beforeSubmit(payload, editing);
      if (editing) {
        await client.put(`${endpoint}/${editing[idKey]}`, payload);
        toast("success", `${title} atualizado com sucesso.`);
      } else {
        await client.post(endpoint, payload);
        toast("success", `${title} cadastrado com sucesso.`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await client.del(`${endpoint}/${toDelete[idKey]}`);
      toast("success", "Registro excluído.");
      setToDelete(null);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <ViewHeader icon={Icon} title={title} subtitle={subtitle} count={rows.length}>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> Novo</Button>
      </ViewHeader>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          idKey={idKey}
          onEdit={openEdit}
          onDelete={(row) => setToDelete(row)}
          searchable
          emptyTitle={emptyTitle || `Nenhum registro em ${title.toLowerCase()}`}
          emptyHint={emptyHint || "Clique em “Novo” para criar o primeiro registro."}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar ${title.toLowerCase()}` : `Novo registro — ${title.toLowerCase()}`}
        subtitle={editing ? `Folio #${editing[idKey]}` : "Os campos com * são obrigatórios"}
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <Field key={f.name} label={f.label} required={f.required} error={formErrors[f.name]} hint={f.hint}>
              {f.type === "select" ? (
                <SelectInput
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  required={f.required}
                >
                  <option value="">{f.placeholder || "Selecione…"}</option>
                  {(f.optionsEndpoint ? optionLists[f.name] || [] : f.options || []).map((opt) => (
                    <option key={opt[f.optionValue || "id"]} value={opt[f.optionValue || "id"]}>
                      {opt[f.optionLabel || "nome"]}
                    </option>
                  ))}
                </SelectInput>
              ) : f.type === "checkbox" ? (
                <Checkbox
                  label={f.checkboxLabel || "Ativo"}
                  checked={!!form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                />
              ) : f.type === "textarea" ? (
                <Textarea
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                />
              ) : f.type === "number" ? (
                <NumberInput
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  step={f.step || "0.01"}
                  min={f.min}
                  placeholder={f.placeholder}
                />
              ) : (
                <TextInput
                  type={f.type || "text"}
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  autoFocus={f.autoFocus}
                />
              )}
            </Field>
          ))}
          <div className="mt-2 flex justify-end gap-2 border-t border-zinc-100 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Spinner className="h-3.5 w-3.5" /> : <Check size={15} />} Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir registro?"
        message={`Esta ação não pode ser desfeita. Tem certeza que deseja excluir este registro de ${title.toLowerCase()}?`}
        confirmLabel="Excluir"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function ViewHeader({ icon: Icon, title, subtitle, count, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-amber-400">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500">
            {subtitle} {typeof count === "number" && <span className="font-mono">· {count} registro{count === 1 ? "" : "s"}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/* ============================================================
   CATEGORIAS
   ============================================================ */
function CategoriasView({ client, toast }) {
  return (
    <SimpleCrudView
      client={client}
      toast={toast}
      endpoint={ENDPOINTS.categorias}
      title="Categorias"
      subtitle="Classificação usada para organizar os produtos"
      icon={Tag}
      initialForm={{ nome: "", descricao: "" }}
      fields={[
        { name: "nome", label: "Nome", required: true, placeholder: "Ex.: Bebidas" },
        { name: "descricao", label: "Descrição", type: "textarea", placeholder: "Opcional" },
      ]}
      columns={[
        { key: "id", label: "#", mono: true },
        { key: "nome", label: "Nome" },
        { key: "descricao", label: "Descrição", render: (r) => r.descricao || "—" },
      ]}
      emptyTitle="Nenhuma categoria cadastrada"
      emptyHint="As categorias organizam os produtos no catálogo. Crie a primeira para liberar o cadastro de produtos."
    />
  );
}

/* ============================================================
   MARCAS
   ============================================================ */
function MarcasView({ client, toast }) {
  return (
    <SimpleCrudView
      client={client}
      toast={toast}
      endpoint={ENDPOINTS.marcas}
      title="Marcas"
      subtitle="Fabricante ou fornecedor da mercadoria"
      icon={Bookmark}
      initialForm={{ nome: "" }}
      fields={[
        { name: "nome", label: "Nome", required: true, placeholder: "Ex.: Coca-Cola" },
      ]}
      columns={[
        { key: "id", label: "#", mono: true },
        { key: "nome", label: "Nome" },
      ]}
      emptyTitle="Nenhuma marca cadastrada"
      emptyHint="Cadastre as marcas para vincular aos produtos do catálogo."
    />
  );
}

/* ============================================================
   CLIENTES
   ============================================================ */
function ClientesView({ client, toast }) {
  return (
    <SimpleCrudView
      client={client}
      toast={toast}
      endpoint={ENDPOINTS.clientes}
      title="Clientes"
      subtitle="Pessoas ou empresas atendidas pelas vendas"
      icon={Users}
      initialForm={{ nome: "", telefone: "", email: "", cpf_cnpj: "", endereco: "", ativo: true }}
      fields={[
        { name: "nome", label: "Nome", required: true, placeholder: "Nome completo ou razão social" },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
        { name: "email", label: "E-mail", type: "email", placeholder: "cliente@exemplo.com" },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "Somente números" },
        { name: "endereco", label: "Endereço", type: "textarea" },
        { name: "ativo", label: "Situação", type: "checkbox", checkboxLabel: "Cliente ativo" },
      ]}
      columns={[
        { key: "id", label: "#", mono: true },
        { key: "nome", label: "Nome" },
        { key: "telefone", label: "Telefone", render: (r) => r.telefone || "—" },
        { key: "email", label: "E-mail", render: (r) => r.email || "—" },
        {
          key: "ativo", label: "Situação",
          render: (r) => (r.ativo === false
            ? <StampBadge tone="bad">Inativo</StampBadge>
            : <StampBadge tone="good">Ativo</StampBadge>),
        },
      ]}
      emptyTitle="Nenhum cliente cadastrado"
      emptyHint="Clientes podem ser vinculados às vendas, mas isso é opcional — vendas avulsas também são suportadas."
    />
  );
}
/* ============================================================
   PRODUTOS
   ============================================================ */
function ProdutosView({ client, toast }) {
  return (
    <SimpleCrudView
      client={client}
      toast={toast}
      endpoint={ENDPOINTS.produtos}
      title="Produtos"
      subtitle="Catálogo vinculado a categoria, marca e estoque"
      icon={Package}
      initialForm={{ nome: "", descricao: "", preco: "", categoria_id: "", marca_id: "", estoque_minimo: 0, ativo: true }}
      fields={[
        { name: "nome", label: "Nome", required: true, placeholder: "Ex.: Refrigerante 2L" },
        { name: "descricao", label: "Descrição", type: "textarea" },
        { name: "preco", label: "Preço de venda", type: "number", required: true, placeholder: "0,00" },
        {
          name: "categoria_id", label: "Categoria", type: "select", required: true,
          optionsEndpoint: ENDPOINTS.categorias, optionLabel: "nome", optionValue: "id",
          placeholder: "Selecione a categoria…",
        },
        {
          name: "marca_id", label: "Marca", type: "select", required: true,
          optionsEndpoint: ENDPOINTS.marcas, optionLabel: "nome", optionValue: "id",
          placeholder: "Selecione a marca…",
        },
        { name: "estoque_minimo", label: "Estoque mínimo", type: "number", step: "1", min: "0", placeholder: "0", hint: "alerta de estoque baixo" },
        { name: "ativo", label: "Situação", type: "checkbox", checkboxLabel: "Produto ativo" },
      ]}
      columns={[
        { key: "id", label: "#", mono: true },
        { key: "nome", label: "Nome" },
        { key: "preco", label: "Preço", mono: true, render: (r) => formatCurrency(pick(r, ["preco", "preco_venda"], 0)) },
        { key: "categoria_nome", label: "Categoria", render: (r) => pick(r, ["categoria_nome", "categoria"], "—") },
        { key: "marca_nome", label: "Marca", render: (r) => pick(r, ["marca_nome", "marca"], "—") },
        {
          key: "ativo", label: "Situação",
          render: (r) => (r.ativo === false
            ? <StampBadge tone="bad">Inativo</StampBadge>
            : <StampBadge tone="good">Ativo</StampBadge>),
        },
      ]}
      emptyTitle="Nenhum produto cadastrado"
      emptyHint="Cadastre categorias e marcas antes do primeiro produto — elas alimentam os campos de seleção abaixo."
    />
  );
}

/* ============================================================
   ESTOQUE — inventário com ajuste manual de quantidade e remoção.
   ============================================================ */
function EstoqueView({ client, toast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(10);

  // Modal de ajuste (PUT)
  const [ajustando, setAjustando] = useState(null);
  const [novaQtd, setNovaQtd] = useState("");
  const [obsAjuste, setObsAjuste] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Confirmação de remoção (DELETE)
  const [removendo, setRemovendo] = useState(null);
  const [deletando, setDeletando] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.get(ENDPOINTS.estoque);
      setRows(coerceList(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  function statusOf(row) {
    const qtd = Number(pick(row, ["quantidade", "qtd", "quantidade_atual"], 0));
    const minimo = pick(row, ["quantidade_minima", "estoque_minimo", "minimo"], null);
    if (qtd <= 0) return "sem";
    if (minimo !== null ? qtd <= Number(minimo) : qtd <= threshold) return "baixo";
    return "ok";
  }

  function openAjuste(row) {
    setAjustando(row);
    setNovaQtd(String(pick(row, ["quantidade", "qtd", "quantidade_atual"], 0)));
    setObsAjuste("");
  }

  async function salvarAjuste(e) {
    e.preventDefault();
    if (novaQtd === "" || Number(novaQtd) < 0) { toast("error", "Informe uma quantidade válida."); return; }
    setSalvando(true);
    try {
      const produtoId = pick(ajustando, ["produto_id", "id"], null);
      await client.put(`${ENDPOINTS.estoque}/${produtoId}`, {
        quantidade: Number(novaQtd),
        observacao: obsAjuste || undefined,
      });
      toast("success", "Estoque ajustado com sucesso.");
      setAjustando(null);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarRemocao() {
    if (!removendo) return;
    setDeletando(true);
    try {
      const produtoId = pick(removendo, ["produto_id", "id"], null);
      await client.del(`${ENDPOINTS.estoque}/${produtoId}`);
      toast("success", "Produto removido do estoque.");
      setRemovendo(null);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setDeletando(false);
    }
  }

  const semEstoque = rows.filter((r) => statusOf(r) === "sem").length;
  const baixoEstoque = rows.filter((r) => statusOf(r) === "baixo").length;

  return (
    <div>
      <ViewHeader icon={Boxes} title="Estoque" subtitle="Inventário — ajuste manual e controle de posição" count={rows.length}>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <span className="hidden sm:inline">Alerta sem mínimo definido:</span>
          <NumberInput
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) || 0)}
            className="w-16 px-2 py-1"
            min={0}
          />
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} /></Button>
      </ViewHeader>

      {!loading && !error && rows.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={18} className="text-amber-700" />
            <div>
              <p className="font-mono text-lg font-bold text-amber-800">{baixoEstoque}</p>
              <p className="text-xs text-amber-700">produto(s) com estoque baixo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <PackageX size={18} className="text-rose-700" />
            <div>
              <p className="font-mono text-lg font-bold text-rose-800">{semEstoque}</p>
              <p className="text-xs text-rose-700">produto(s) sem estoque</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <DataTable
          searchable
          rows={rows}
          idKey={pick(rows[0] || {}, ["produto_id"], null) ? "produto_id" : "id"}
          onEdit={openAjuste}
          onDelete={(row) => setRemovendo(row)}
          emptyTitle="Nenhuma posição de estoque encontrada"
          emptyHint="O estoque é populado automaticamente conforme produtos são cadastrados."
          columns={[
            { key: "produto_nome", label: "Produto", render: (r) => pick(r, ["produto_nome", "produto", "nome"], "—") },
            {
              key: "quantidade", label: "Quantidade", mono: true,
              render: (r) => pick(r, ["quantidade", "qtd", "quantidade_atual"], 0),
            },
            {
              key: "quantidade_minima", label: "Mínimo", mono: true,
              render: (r) => pick(r, ["quantidade_minima", "estoque_minimo", "minimo"], "—"),
            },
            {
              key: "status", label: "Situação",
              render: (r) => {
                const s = statusOf(r);
                if (s === "sem") return <StampBadge tone="bad">Sem estoque</StampBadge>;
                if (s === "baixo") return <StampBadge tone="warn">Baixo estoque</StampBadge>;
                return <StampBadge tone="good">Normal</StampBadge>;
              },
            },
          ]}
        />
      )}

      <Modal
        open={!!ajustando}
        onClose={() => setAjustando(null)}
        title="Ajustar estoque"
        subtitle={ajustando ? `Produto: ${pick(ajustando, ["produto_nome", "nome"], "—")}` : ""}
      >
        <form onSubmit={salvarAjuste} className="flex flex-col gap-3">
          <Field label="Nova quantidade" required>
            <NumberInput
              value={novaQtd}
              onChange={(e) => setNovaQtd(e.target.value)}
              min={0}
              step={1}
              autoFocus
            />
          </Field>
          <Field label="Observação" hint="opcional">
            <TextInput
              value={obsAjuste}
              onChange={(e) => setObsAjuste(e.target.value)}
              placeholder="Ex.: Contagem de inventário"
            />
          </Field>
          <div className="mt-2 flex justify-end gap-2 border-t border-zinc-100 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAjustando(null)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={salvando}>
              {salvando ? <Spinner className="h-3.5 w-3.5" /> : <Check size={15} />} Salvar ajuste
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removendo}
        title="Remover do estoque?"
        message={`Isso vai zerar o estoque de "${pick(removendo || {}, ["produto_nome", "nome"], "este produto")}" e registrar uma movimentação. O produto continua no catálogo.`}
        confirmLabel="Remover"
        danger
        busy={deletando}
        onConfirm={confirmarRemocao}
        onCancel={() => setRemovendo(null)}
      />
    </div>
  );
}

/* ============================================================
   EDITOR DE ITENS — usado tanto em Compras quanto em Vendas.
   Cada linha representa um ItemCompra/ItemVenda: produto,
   quantidade e preço unitário, com subtotal calculado.
   ============================================================ */
function ItemsEditor({ produtos, items, setItems }) {
  function addRow() {
    setItems([...items, { produto_id: "", quantidade: 1, preco_unitario: "" }]);
  }
  function updateRow(idx, patch) {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  }
  function removeRow(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }
  function onProdutoChange(idx, produtoId) {
    const produto = produtos.find((p) => String(p.id) === String(produtoId));
    updateRow(idx, {
      produto_id: produtoId,
      preco_unitario: produto ? pick(produto, ["preco", "preco_venda"], "") : "",
    });
  }

  const total = items.reduce((sum, it) => sum + (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0), 0);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Produto</th>
              <th className="w-24 px-3 py-2 font-semibold">Qtd.</th>
              <th className="w-32 px-3 py-2 font-semibold">Preço unit.</th>
              <th className="w-32 px-3 py-2 font-semibold">Subtotal</th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-zinc-400">Nenhum item adicionado ainda.</td></tr>
            )}
            {items.map((it, idx) => {
              const subtotal = (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0);
              return (
                <tr key={idx}>
                  <td className="px-2 py-1.5">
                    <SelectInput value={it.produto_id} onChange={(e) => onProdutoChange(idx, e.target.value)} required>
                      <option value="">Selecione…</option>
                      {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </SelectInput>
                  </td>
                  <td className="px-2 py-1.5">
                    <NumberInput value={it.quantidade} min="1" step="1" onChange={(e) => updateRow(idx, { quantidade: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <NumberInput value={it.preco_unitario} min="0" step="0.01" onChange={(e) => updateRow(idx, { preco_unitario: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5 font-mono text-zinc-600">{formatCurrency(subtotal)}</td>
                  <td className="px-1 py-1.5 text-right">
                    <IconButton title="Remover item" onClick={() => removeRow(idx)} className="hover:bg-rose-50 hover:text-rose-700"><Trash2 size={14} /></IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow}><Plus size={14} /> Adicionar item</Button>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Total </span>
          <span className="font-mono text-base font-bold text-zinc-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
/* ============================================================
   VENDAS 
   ============================================================ */
function VendasView({ client, toast }) {
  const [rows, setRows] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal criar
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [items, setItems] = useState([]);

  // Modal editar
  const [editRow, setEditRow] = useState(null);
  const [editCliente, setEditCliente] = useState("");
  const [editForma, setEditForma] = useState("dinheiro");
  const [editItems, setEditItems] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const FORMAS = [
    { value: "dinheiro", label: "💵 Dinheiro" },
    { value: "cartao",   label: "💳 Cartão"   },
    { value: "pix",      label: "📱 Pix"      },
  ];

  const formaLabel = (v) => FORMAS.find((f) => f.value === v)?.label ?? v ?? "—";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendas, prods, clis] = await Promise.all([
        client.get(ENDPOINTS.vendas),
        client.get(ENDPOINTS.produtos).catch(() => []),
        client.get(ENDPOINTS.clientes).catch(() => []),
      ]);
      setRows(coerceList(vendas));
      setProdutos(coerceList(prods));
      setClientes(coerceList(clis));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  // ── Criar ────────────────────────────────────────────────────
  function openCreate() {
    setClienteId("");
    setFormaPagamento("dinheiro");
    setItems([]);
    setModalOpen(true);
  }

  async function submitCreate(e) {
    e.preventDefault();
    if (items.length === 0) { toast("error", "Adicione ao menos um item à venda."); return; }
    setSaving(true);
    try {
      await client.post(ENDPOINTS.vendas, {
        cliente_id: clienteId ? Number(clienteId) : null,
        forma_pagamento: formaPagamento,
        itens: items.map((it) => ({
          produto_id: Number(it.produto_id),
          quantidade: Number(it.quantidade),
          preco_unitario: Number(it.preco_unitario),
        })),
      });
      toast("success", "Venda registrada — estoque atualizado.");
      setModalOpen(false);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Editar ────────────────────────────────────────────────────
  // Abre o modal de edição e busca os itens atuais da venda do backend
  async function openEdit(row) {
    setEditRow(row);
    setEditCliente(String(row.cliente_id ?? ""));
    setEditForma(row.forma_pagamento ?? "dinheiro");
    setEditItems([]);
    setLoadingEdit(true);

    try {
      // Se a listagem já trouxe os itens (novo _build_response), usa direto
      const itensExistentes = coerceList(pick(row, ["itens", "items"], []));
      if (itensExistentes.length > 0) {
        setEditItems(itensExistentes.map((it) => ({
          produto_id: String(it.produto_id),
          quantidade: it.quantidade,
          preco_unitario: it.preco_unitario,
        })));
      } else {
        // Fallback: busca do endpoint de itens
        const itens = await client.get(`${ENDPOINTS.vendas}/${row.id}/itens`);
        setEditItems(coerceList(itens).map((it) => ({
          produto_id: String(it.produto_id),
          quantidade: it.quantidade,
          preco_unitario: it.preco_unitario,
        })));
      }
    } catch {
      toast("error", "Não foi possível carregar os itens da venda.");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editRow) return;
    if (editItems.length === 0) { toast("error", "A venda precisa ter ao menos um item."); return; }
    setEditSaving(true);
    try {
      await client.put(`${ENDPOINTS.vendas}/${editRow.id}`, {
        cliente_id: editCliente ? Number(editCliente) : null,
        forma_pagamento: editForma,
        itens: editItems.map((it) => ({
          produto_id: Number(it.produto_id),
          quantidade: Number(it.quantidade),
          preco_unitario: Number(it.preco_unitario),
        })),
      });
      toast("success", "Venda atualizada com sucesso.");
      setEditRow(null);
      load();
    } catch (err) {
      toast("error", err.message);
    } finally {
      setEditSaving(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const totalDe = (v) => {
    const direto = pick(v, ["total", "valor_total"], null);
    if (direto !== null) return Number(direto);
    return coerceList(pick(v, ["itens", "items"], []))
      .reduce((s, it) => s + Number(pick(it, ["quantidade"], 0)) * Number(pick(it, ["preco_unitario"], 0)), 0);
  };

  return (
    <div>
      <ViewHeader
        icon={Receipt}
        title="Vendas"
        subtitle="Saídas de mercadoria — reduzem o estoque automaticamente"
        count={rows.length}
      >
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openCreate}><Plus size={15} /> Nova venda</Button>
      </ViewHeader>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <DataTable
          rows={rows}
          searchable
          emptyTitle="Nenhuma venda registrada"
          emptyHint="Registre a primeira venda para movimentar o estoque e o caixa."
          onEdit={openEdit}
          columns={[
            { key: "id", label: "#", mono: true },
            {
              key: "data_venda", label: "Data",
              render: (r) => formatDate(pick(r, ["data", "data_venda", "criado_em"], null)),
            },
            {
              key: "cliente_nome", label: "Cliente",
              render: (r) => pick(r, ["cliente_nome", "cliente"], "Consumidor não identificado"),
            },
            {
              key: "forma_pagamento", label: "Pagamento",
              render: (r) => {
                const v = r.forma_pagamento;
                const tone = v === "dinheiro" ? "good" : v === "pix" ? "neutral" : "warn";
                return <StampBadge tone={tone}>{formaLabel(v)}</StampBadge>;
              },
            },
            {
              key: "valor_total", label: "Total", mono: true,
              render: (r) => formatCurrency(totalDe(r)),
            },
          ]}
        />
      )}

      {/* ── Modal: Nova venda ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova venda"
        subtitle="O estoque é debitado automaticamente ao registrar"
        width="max-w-3xl"
      >
        <form onSubmit={submitCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cliente" hint="opcional">
              <SelectInput value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Consumidor não identificado</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </SelectInput>
            </Field>
            <Field label="Forma de pagamento" required>
              <SelectInput value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </SelectInput>
            </Field>
          </div>
          <ItemsEditor produtos={produtos} items={items} setItems={setItems} />
          <div className="mt-2 flex justify-end gap-2 border-t border-zinc-100 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Spinner className="h-3.5 w-3.5" /> : <Check size={15} />} Registrar venda
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Editar venda ── */}
      <Modal
        open={!!editRow}
        onClose={() => setEditRow(null)}
        title={`Editar Venda #${editRow?.id ?? ""}`}
        subtitle="Alterações no estoque são recalculadas automaticamente"
        width="max-w-3xl"
      >
        {loadingEdit ? (
          <LoadingBlock label="Carregando itens da venda…" />
        ) : (
          <form onSubmit={submitEdit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cliente" hint="opcional">
                <SelectInput value={editCliente} onChange={(e) => setEditCliente(e.target.value)}>
                  <option value="">Consumidor não identificado</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </SelectInput>
              </Field>
              <Field label="Forma de pagamento" required>
                <SelectInput value={editForma} onChange={(e) => setEditForma(e.target.value)}>
                  {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </SelectInput>
              </Field>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ⚠️ Ao salvar, o estoque dos itens antigos é devolvido e os novos são debitados.
            </div>

            <ItemsEditor produtos={produtos} items={editItems} setItems={setEditItems} />

            <div className="mt-2 flex justify-end gap-2 border-t border-zinc-100 pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditRow(null)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={editSaving}>
                {editSaving ? <Spinner className="h-3.5 w-3.5" /> : <Check size={15} />} Salvar alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function KpiCard({ icon: Icon, label, value, tone = "neutral" }) {
  const tones = {
    neutral: "text-zinc-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
  };
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
        <Icon size={16} className="text-zinc-400" />
      </div>
      <p className={cx("font-mono text-2xl font-bold", tones[tone])}>{value}</p>
    </div>
  );
}

function DashboardView({ client, toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(ENDPOINTS.dashboard);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  function countOf(value) {
    if (Array.isArray(value)) return value.length;
    if (value === null || value === undefined) return "—";
    return value;
  }

  return (
    <div>
      <ViewHeader icon={LayoutDashboard} title="Painel" subtitle="Indicadores gerais do sistema, calculados pelo backend">
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={14} /></Button>
      </ViewHeader>

      {loading ? (
        <LoadingBlock label="Calculando indicadores…" />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          <KpiCard icon={Package} label="Produtos cadastrados" value={countOf(pick(data, ["total_produtos", "produtos"], "—"))} />
          <KpiCard icon={Users} label="Clientes" value={countOf(pick(data, ["total_clientes", "clientes"], "—"))} />
          <KpiCard icon={Receipt} label="Vendas realizadas" value={countOf(pick(data, ["total_vendas", "vendas"], "—"))} />
          <KpiCard icon={Wallet} label="Valor total vendido" value={formatCurrency(pick(data, ["faturamento_total", "valor_total_vendido", "total_vendido"], 0))} tone="good" />
          <KpiCard icon={AlertTriangle} label="Produtos com estoque baixo" value={countOf(pick(data, ["produtos_estoque_baixo", "estoque_baixo"], "—"))} tone="warn" />
          <KpiCard icon={PackageX} label="Produtos sem estoque" value={countOf(pick(data, ["produtos_sem_estoque", "sem_estoque"], "—"))} tone="bad" />
        </div>
      )}
    </div>
  );
}
/* ============================================================
   CONFIGURAÇÃO DA API
   ============================================================ */
function ConfiguracoesView({ apiBaseUrl, setApiBaseUrl, embedded, onTested }) {
  const [draft, setDraft] = useState(apiBaseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  async function handleTest(urlToTest) {
    setTesting(true);
    setTestResult(null);
    try {
      const cleaned = urlToTest.replace(/\/+$/, "");
      const res = await fetch(`${cleaned}${ENDPOINTS.dashboard}`);
      if (res.ok || res.status === 404) {
        setTestResult({ ok: true, message: "A API respondeu. Conexão estabelecida." });
      } else {
        setTestResult({ ok: false, message: `A API respondeu com status ${res.status}.` });
      }
    } catch {
      setTestResult({ ok: false, message: "Não foi possível conectar. Verifique a URL e o CORS do backend." });
    } finally {
      setTesting(false);
    }
  }

  function save(e) {
    e.preventDefault();
    const cleaned = draft.trim().replace(/\/+$/, "");
    setApiBaseUrl(cleaned);
    if (onTested) onTested(cleaned);
  }

  const content = (
    <form onSubmit={save} className="flex flex-col gap-4">
      <Field label="URL base da API" required hint="ex.: https://meu-erp-api.com">
        <TextInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="http://localhost:8000"
          autoFocus
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => handleTest(draft)} disabled={!draft || testing}>
          {testing ? <Spinner className="h-3.5 w-3.5" /> : <Link2 size={14} />} Testar conexão
        </Button>
        {testResult && (
          <span className={cx("flex items-center gap-1 text-xs", testResult.ok ? "text-emerald-700" : "text-rose-700")}>
            {testResult.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {testResult.message}
          </span>
        )}
      </div>
      <Button type="submit" disabled={!draft.trim()}>
        <ArrowRight size={15} /> {embedded ? "Salvar e voltar" : "Salvar e abrir o sistema"}
      </Button>
    </form>
  );

  if (embedded) {
    return (
      <div>
        <ViewHeader icon={Settings} title="Configurações" subtitle="URL base usada em todas as chamadas à API" />
        <div className="max-w-md">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md border-2 border-amber-600 bg-zinc-900 text-amber-500 -rotate-2">
            <Stamp size={26} />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white">Livro-Caixa ERP</h1>
          <p className="mt-1 text-sm text-zinc-400">Antes de abrir o livro, informe onde fica a sua API.</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          {content}
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Você pode trocar essa URL depois, em Configurações.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   NAVEGAÇÃO
   ============================================================ */
const NAV_SECTIONS = [
  { items: [{ id: "dashboard", label: "Painel", icon: LayoutDashboard }] },
  {
    title: "Catálogo",
    items: [
      { id: "produtos", label: "Produtos", icon: Package },
      { id: "categorias", label: "Categorias", icon: Tag },
      { id: "marcas", label: "Marcas", icon: Bookmark },
      { id: "estoque", label: "Estoque", icon: Boxes },
    ],
  },
  {
    title: "Movimento",
    items: [
      { id: "vendas", label: "Vendas", icon: Receipt },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { id: "clientes", label: "Clientes", icon: Users },
    ],
  },
];

const VIEW_LABELS = NAV_SECTIONS.flatMap((s) => s.items).reduce((acc, it, idx) => {
  acc[it.id] = { ...it, folio: String(idx + 1).padStart(3, "0") };
  return acc;
}, { configuracoes: { label: "Configurações", icon: Settings, folio: "099" } });

function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-zinc-900/50 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-zinc-950 text-zinc-300 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-amber-600 bg-zinc-900 text-amber-500 -rotate-2">
            <Stamp size={16} />
          </div>
          <div>
            <p className="font-serif text-sm font-semibold text-white leading-tight">Livro-Caixa ERP</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">registro &amp; controle</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="mb-4">
              {section.title && (
                <p className="mb-1.5 px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-600">{section.title}</p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = current === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                      className={cx(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        active ? "bg-amber-700/90 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                    >
                      <item.icon size={16} className={active ? "text-white" : "text-zinc-500"} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={() => { onNavigate("configuracoes"); onCloseMobile(); }}
          className={cx(
            "flex items-center gap-2.5 border-t border-zinc-800 px-5 py-3.5 text-left text-sm transition-colors",
            current === "configuracoes" ? "bg-amber-700/90 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          )}
        >
          <Settings size={16} /> Configurações
        </button>
      </aside>
    </>
  );
}

function TopBar({ view, onMenuClick }) {
  const meta = VIEW_LABELS[view] || { label: view, folio: "000" };
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const data = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const dataCapitalizada = data.charAt(0).toUpperCase() + data.slice(1);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Fólio nº {meta.folio}</p>
          <h1 className="font-serif text-base font-semibold text-zinc-900 leading-tight">{meta.label}</h1>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-zinc-500">{dataCapitalizada}</p>
        <p className="font-mono text-sm font-semibold text-zinc-800">{hora}</p>
      </div>
    </header>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function ERPApp() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:8000");
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const client = useMemo(() => buildClient(apiBaseUrl), [apiBaseUrl]);

  if (!apiBaseUrl) {
    return <ConfiguracoesView apiBaseUrl={apiBaseUrl} setApiBaseUrl={setApiBaseUrl} />;
  }

  const viewProps = { client, toast };
  let body;
  switch (view) {
    case "dashboard": body = <DashboardView {...viewProps} />; break;
    case "produtos": body = <ProdutosView {...viewProps} />; break;
    case "categorias": body = <CategoriasView {...viewProps} />; break;
    case "marcas": body = <MarcasView {...viewProps} />; break;
    case "estoque": body = <EstoqueView {...viewProps} />; break;
    case "vendas": body = <VendasView {...viewProps} />; break;
    case "clientes": body = <ClientesView {...viewProps} />; break;
    case "configuracoes":
      body = <ConfiguracoesView apiBaseUrl={apiBaseUrl} setApiBaseUrl={setApiBaseUrl} embedded onTested={() => setView("dashboard")} />;
      break;
    default: body = <DashboardView {...viewProps} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans text-zinc-900">
      <Sidebar current={view} onNavigate={setView} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <TopBar view={view} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-6">{body}</main>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}