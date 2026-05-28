from __future__ import annotations

import os
from datetime import date, datetime
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import (
    CHAR, Column, Date, DateTime, Enum, ForeignKey, Integer,
    Numeric, SmallInteger, String, Text, UniqueConstraint,
    create_engine, text,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

# ─────────────────────────────────────────────────────────────
# Config & conexão
# ─────────────────────────────────────────────────────────────
load_dotenv()

DB_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    "?charset=utf8mb4"
)
DIAS_ALERTA_VALIDADE = int(os.getenv("DIAS_ALERTA_VALIDADE", 30))

engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────
# ORM Models
# ─────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


def _uuid() -> str:
    return str(uuid4())


class Produto(Base):
    __tablename__ = "produtos"

    id                = Column(CHAR(36), primary_key=True, default=_uuid)
    nome              = Column(String(150), nullable=False)
    marca             = Column(String(100), nullable=False)
    categoria         = Column(String(100), nullable=False)
    preco_custo       = Column(Numeric(10, 2), nullable=False)
    preco_venda       = Column(Numeric(10, 2), nullable=False)
    quantidade_minima = Column(Integer, nullable=False, default=0)
    data_cadastro     = Column(Date, default=date.today)
    criado_em         = Column(DateTime, default=datetime.utcnow)
    atualizado_em     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lotes   = relationship("Lote",    back_populates="produto", cascade="all, delete-orphan")
    alertas = relationship("AlertaEstoqueMinimo", back_populates="produto")


class Lote(Base):
    __tablename__ = "lotes"

    id            = Column(CHAR(36), primary_key=True, default=_uuid)
    produto_id    = Column(CHAR(36), ForeignKey("produtos.id"), nullable=False)
    numero        = Column(String(100), nullable=False)
    quantidade    = Column(Integer, nullable=False)
    data_validade = Column(Date, nullable=False)
    criado_em     = Column(DateTime, default=datetime.utcnow)

    produto         = relationship("Produto",         back_populates="lotes")
    alertas_validade = relationship("AlertaValidade", back_populates="lote")


class Cliente(Base):
    __tablename__ = "clientes"
    __table_args__ = (UniqueConstraint("whatsapp", name="uq_whatsapp"),)

    id            = Column(CHAR(36), primary_key=True, default=_uuid)
    nome          = Column(String(150), nullable=False)
    whatsapp      = Column(String(20),  nullable=False)
    data_cadastro = Column(Date, default=date.today)
    criado_em     = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendas = relationship("Venda", back_populates="cliente")


class MetodoPagamento(str, PyEnum):
    DINHEIRO  = "DINHEIRO"
    PIX       = "PIX"
    CARTAO    = "CARTAO"
    FATURADO  = "FATURADO"


class Venda(Base):
    __tablename__ = "vendas"

    id          = Column(CHAR(36), primary_key=True, default=_uuid)
    data_hora   = Column(DateTime, default=datetime.utcnow)
    cliente_id  = Column(CHAR(36), ForeignKey("clientes.id"), nullable=True)
    total_bruto = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_custo = Column(Numeric(10, 2), default=Decimal("0.00"))

    cliente    = relationship("Cliente",    back_populates="vendas")
    itens      = relationship("ItemVenda",  back_populates="venda",     cascade="all, delete-orphan")
    pagamentos = relationship("Pagamento",  back_populates="venda",     cascade="all, delete-orphan")

    @property
    def lucro_bruto(self):
        return (self.total_bruto or 0) - (self.total_custo or 0)


class ItemVenda(Base):
    __tablename__ = "itens_venda"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    venda_id             = Column(CHAR(36), ForeignKey("vendas.id"),    nullable=False)
    produto_id           = Column(CHAR(36), ForeignKey("produtos.id"),  nullable=False)
    lote_id              = Column(CHAR(36), ForeignKey("lotes.id"),     nullable=True)
    quantidade           = Column(Integer, nullable=False)
    preco_unitario       = Column(Numeric(10, 2), nullable=False)
    preco_custo_unitario = Column(Numeric(10, 2), nullable=False)

    venda   = relationship("Venda",   back_populates="itens")
    produto = relationship("Produto")
    lote    = relationship("Lote")


class Pagamento(Base):
    __tablename__ = "pagamentos"

    id              = Column(CHAR(36), primary_key=True, default=_uuid)
    venda_id        = Column(CHAR(36), ForeignKey("vendas.id"), nullable=False)
    metodo          = Column(Enum("DINHEIRO", "PIX", "CARTAO", "FATURADO"), nullable=False)
    valor           = Column(Numeric(10, 2), nullable=False)
    data_hora       = Column(DateTime, default=datetime.utcnow)
    # campos específicos
    troco           = Column(Numeric(10, 2), nullable=True)   # DINHEIRO
    chave_pix       = Column(String(150),    nullable=True)   # PIX
    bandeira        = Column(String(50),     nullable=True)   # CARTAO
    ultimos_digitos = Column(CHAR(4),        nullable=True)   # CARTAO
    data_vencimento = Column(Date,           nullable=True)   # FATURADO

    venda = relationship("Venda", back_populates="pagamentos")


class AlertaValidade(Base):
    __tablename__ = "alertas_validade"

    id         = Column(CHAR(36), primary_key=True, default=_uuid)
    lote_id    = Column(CHAR(36), ForeignKey("lotes.id"),    nullable=False)
    produto_id = Column(CHAR(36), ForeignKey("produtos.id"), nullable=False)
    data_alerta = Column(Date, default=date.today)
    mensagem   = Column(String(255), nullable=False)
    lido       = Column(SmallInteger, default=0)

    lote    = relationship("Lote",    back_populates="alertas_validade")
    produto = relationship("Produto")


class AlertaEstoqueMinimo(Base):
    __tablename__ = "alertas_estoque_minimo"

    id          = Column(CHAR(36), primary_key=True, default=_uuid)
    produto_id  = Column(CHAR(36), ForeignKey("produtos.id"), nullable=False)
    data_alerta = Column(Date, default=date.today)
    mensagem    = Column(String(255), nullable=False)
    lido        = Column(SmallInteger, default=0)

    produto = relationship("Produto", back_populates="alertas")


class FechamentoCaixa(Base):
    __tablename__ = "fechamentos_caixa"

    id              = Column(CHAR(36), primary_key=True, default=_uuid)
    data            = Column(Date, nullable=False, unique=True)
    total_vendas    = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_dinheiro  = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_pix       = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_cartao    = Column(Numeric(10, 2), default=Decimal("0.00"))
    total_faturado  = Column(Numeric(10, 2), default=Decimal("0.00"))
    lucro_bruto     = Column(Numeric(10, 2), default=Decimal("0.00"))
    gerado_em       = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────
app = FastAPI(title="Sistema de Gestão Auto e Lazer", version="1.0.0")


# ══════════════════════════════════════════════════════════════
# PRODUTOS  (RF01)
# ══════════════════════════════════════════════════════════════
@app.post("/produtos/", status_code=201, tags=["Produtos"])
def cadastrar_produto(
    nome: str, marca: str, categoria: str,
    preco_custo: float, preco_venda: float, quantidade_minima: int,
    db: Session = Depends(get_db),
):
    produto = Produto(
        nome=nome, marca=marca, categoria=categoria,
        preco_custo=preco_custo, preco_venda=preco_venda,
        quantidade_minima=quantidade_minima,
    )
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return {"mensagem": "Produto cadastrado com sucesso!", "id": produto.id}


@app.get("/produtos/", tags=["Produtos"])
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(Produto).all()


@app.get("/produtos/{produto_id}", tags=["Produtos"])
def buscar_produto(produto_id: str, db: Session = Depends(get_db)):
    p = db.get(Produto, produto_id)
    if not p:
        raise HTTPException(404, "Produto não encontrado.")
    return p


@app.put("/produtos/{produto_id}", tags=["Produtos"])
def atualizar_produto(
    produto_id: str,
    nome: Optional[str] = None, marca: Optional[str] = None,
    categoria: Optional[str] = None, preco_custo: Optional[float] = None,
    preco_venda: Optional[float] = None, quantidade_minima: Optional[int] = None,
    db: Session = Depends(get_db),
):
    p = db.get(Produto, produto_id)
    if not p:
        raise HTTPException(404, "Produto não encontrado.")
    if nome:              p.nome = nome
    if marca:             p.marca = marca
    if categoria:         p.categoria = categoria
    if preco_custo:       p.preco_custo = preco_custo
    if preco_venda:       p.preco_venda = preco_venda
    if quantidade_minima is not None: p.quantidade_minima = quantidade_minima
    db.commit()
    return {"mensagem": "Produto atualizado com sucesso!"}


@app.delete("/produtos/{produto_id}", tags=["Produtos"])
def remover_produto(produto_id: str, db: Session = Depends(get_db)):
    p = db.get(Produto, produto_id)
    if not p:
        raise HTTPException(404, "Produto não encontrado.")
    db.delete(p)
    db.commit()
    return {"mensagem": "Produto removido com sucesso!"}


# ══════════════════════════════════════════════════════════════
# LOTES  (RF02)
# ══════════════════════════════════════════════════════════════
@app.post("/lotes/", status_code=201, tags=["Lotes"])
def adicionar_lote(
    produto_id: str, numero: str, quantidade: int, data_validade: date,
    db: Session = Depends(get_db),
):
    if not db.get(Produto, produto_id):
        raise HTTPException(404, "Produto não encontrado. Cadastre o produto antes.")
    lote = Lote(produto_id=produto_id, numero=numero,
                quantidade=quantidade, data_validade=data_validade)
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return {"mensagem": "Lote registrado com sucesso!", "id": lote.id}


@app.get("/lotes/", tags=["Lotes"])
def listar_lotes(db: Session = Depends(get_db)):
    return db.query(Lote).all()


@app.get("/lotes/{lote_id}", tags=["Lotes"])
def buscar_lote(lote_id: str, db: Session = Depends(get_db)):
    l = db.get(Lote, lote_id)
    if not l:
        raise HTTPException(404, "Lote não encontrado.")
    return l


@app.put("/lotes/{lote_id}", tags=["Lotes"])
def atualizar_lote(
    lote_id: str,
    numero: Optional[str] = None, quantidade: Optional[int] = None,
    data_validade: Optional[date] = None,
    db: Session = Depends(get_db),
):
    l = db.get(Lote, lote_id)
    if not l:
        raise HTTPException(404, "Lote não encontrado.")
    if numero:        l.numero = numero
    if quantidade:    l.quantidade = quantidade
    if data_validade: l.data_validade = data_validade
    db.commit()
    return {"mensagem": "Lote atualizado com sucesso!"}


# ══════════════════════════════════════════════════════════════
# CLIENTES  (RF08)
# ══════════════════════════════════════════════════════════════
@app.post("/clientes/", status_code=201, tags=["Clientes"])
def cadastrar_cliente(nome: str, whatsapp: str, db: Session = Depends(get_db)):
    if db.query(Cliente).filter(Cliente.whatsapp == whatsapp).first():
        raise HTTPException(400, "WhatsApp já cadastrado.")   # RF08 exceção
    cliente = Cliente(nome=nome, whatsapp=whatsapp)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return {"mensagem": "Cliente cadastrado com sucesso!", "id": cliente.id}


@app.get("/clientes/", tags=["Clientes"])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()


@app.get("/clientes/{cliente_id}", tags=["Clientes"])
def buscar_cliente(cliente_id: str, db: Session = Depends(get_db)):
    c = db.get(Cliente, cliente_id)
    if not c:
        raise HTTPException(404, "Cliente não encontrado.")
    return c


@app.get("/clientes/busca/", tags=["Clientes"])
def buscar_cliente_nome_ou_whatsapp(
    nome: Optional[str] = None, whatsapp: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Cliente)
    if nome:      q = q.filter(Cliente.nome.ilike(f"%{nome}%"))
    if whatsapp:  q = q.filter(Cliente.whatsapp == whatsapp)
    return q.all()


@app.put("/clientes/{cliente_id}", tags=["Clientes"])
def atualizar_cliente(
    cliente_id: str, nome: Optional[str] = None, whatsapp: Optional[str] = None,
    db: Session = Depends(get_db),
):
    c = db.get(Cliente, cliente_id)
    if not c:
        raise HTTPException(404, "Cliente não encontrado.")
    if nome:     c.nome = nome
    if whatsapp: c.whatsapp = whatsapp
    db.commit()
    return {"mensagem": "Cliente atualizado com sucesso!"}


# ══════════════════════════════════════════════════════════════
# HISTÓRICO DE CONSUMO  (RF10)
# ══════════════════════════════════════════════════════════════
@app.get("/clientes/{cliente_id}/historico", tags=["Clientes"])
def historico_consumo(cliente_id: str, db: Session = Depends(get_db)):
    if not db.get(Cliente, cliente_id):
        raise HTTPException(404, "Cliente não encontrado.")
    rows = db.execute(
        text("SELECT * FROM vw_historico_cliente WHERE cliente_id = :id"),
        {"id": cliente_id},
    ).mappings().all()
    if not rows:
        return {"mensagem": "Nenhum histórico disponível para este cliente."}
    return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════
# VENDAS  (RF05, RF06, RF07, RF09)
# ══════════════════════════════════════════════════════════════
@app.post("/vendas/", status_code=201, tags=["Vendas"])
def registrar_venda(
    cliente_id: Optional[str] = None,   # RF09: vínculo opcional
    db: Session = Depends(get_db),
):
    if cliente_id and not db.get(Cliente, cliente_id):
        raise HTTPException(404, "Cliente não encontrado.")
    venda = Venda(cliente_id=cliente_id)
    db.add(venda)
    db.commit()
    db.refresh(venda)
    return {"mensagem": "Venda iniciada.", "id": venda.id}


@app.post("/vendas/{venda_id}/itens", status_code=201, tags=["Vendas"])
def adicionar_item(
    venda_id: str, produto_id: str, quantidade: int,
    db: Session = Depends(get_db),
):
    """
    Adiciona um produto à venda aplicando baixa FEFO (RF06):
    consome primeiro o lote com vencimento mais próximo.
    """
    venda = db.get(Venda, venda_id)
    if not venda:
        raise HTTPException(404, "Venda não encontrada.")
    produto = db.get(Produto, produto_id)
    if not produto:
        raise HTTPException(404, "Produto não encontrado.")

    # FEFO: lote com menor data_validade primeiro (RF06)
    lote = (
        db.query(Lote)
        .filter(Lote.produto_id == produto_id, Lote.quantidade >= quantidade,
                Lote.data_validade >= date.today())
        .order_by(Lote.data_validade)
        .first()
    )
    if not lote:
        raise HTTPException(400, "Estoque insuficiente para este produto.")  # RF05 exceção

    # baixa no lote
    lote.quantidade -= quantidade

    item = ItemVenda(
        venda_id=venda_id, produto_id=produto_id, lote_id=lote.id,
        quantidade=quantidade,
        preco_unitario=produto.preco_venda,
        preco_custo_unitario=produto.preco_custo,
    )
    db.add(item)

    # atualiza totais da venda
    venda.total_bruto = (venda.total_bruto or 0) + produto.preco_venda * quantidade
    venda.total_custo = (venda.total_custo or 0) + produto.preco_custo * quantidade
    db.flush()

    # RF04: alerta de estoque mínimo após baixa
    estoque_atual = (
        db.query(Lote)
        .filter(Lote.produto_id == produto_id, Lote.data_validade >= date.today())
        .with_entities(Lote.quantidade)
        .all()
    )
    total_estoque = sum(q for (q,) in estoque_atual)
    if total_estoque <= produto.quantidade_minima:
        alerta = AlertaEstoqueMinimo(
            produto_id=produto_id,
            mensagem=f"Estoque de '{produto.nome}' atingiu o mínimo ({total_estoque} un.).",
        )
        db.add(alerta)

    db.commit()
    return {
        "mensagem": "Item adicionado.",
        "total_bruto": float(venda.total_bruto),
        "lucro_bruto": float(venda.lucro_bruto),
    }


@app.post("/vendas/{venda_id}/pagamento", status_code=201, tags=["Vendas"])
def inserir_pagamento(
    venda_id: str,
    metodo: MetodoPagamento,
    valor: float,
    # opcionais por método
    troco: Optional[float] = None,
    chave_pix: Optional[str] = None,
    bandeira: Optional[str] = None,
    ultimos_digitos: Optional[str] = None,
    data_vencimento: Optional[date] = None,  # FATURADO
    db: Session = Depends(get_db),
):
    if not db.get(Venda, venda_id):
        raise HTTPException(404, "Venda não encontrada.")
    pg = Pagamento(
        venda_id=venda_id, metodo=metodo.value, valor=valor,
        troco=troco, chave_pix=chave_pix, bandeira=bandeira,
        ultimos_digitos=ultimos_digitos, data_vencimento=data_vencimento,
    )
    db.add(pg)
    db.commit()
    return {"mensagem": "Pagamento registrado com sucesso!"}


@app.get("/vendas/", tags=["Vendas"])
def listar_vendas(db: Session = Depends(get_db)):
    return db.query(Venda).all()


@app.get("/vendas/{venda_id}", tags=["Vendas"])
def buscar_venda(venda_id: str, db: Session = Depends(get_db)):
    v = db.get(Venda, venda_id)
    if not v:
        raise HTTPException(404, "Venda não encontrada.")
    return v


# ══════════════════════════════════════════════════════════════
# ALERTAS  (RF03, RF04)
# ══════════════════════════════════════════════════════════════
@app.post("/alertas/verificar-validade", tags=["Alertas"])
def verificar_alertas_validade(db: Session = Depends(get_db)):
    """RF03 – verificação diária (chamar via cron ou manualmente)."""
    lotes_proximos = db.execute(
        text("SELECT * FROM vw_lotes_proximos_vencimento")
    ).mappings().all()

    gerados = []
    for row in lotes_proximos:
        existe = db.query(AlertaValidade).filter(
            AlertaValidade.lote_id == row["lote_id"],
            AlertaValidade.data_alerta == date.today(),
        ).first()
        if not existe:
            alerta = AlertaValidade(
                lote_id=row["lote_id"],
                produto_id=row["produto_id"],
                mensagem=(
                    f"Lote {row['numero']} do produto '{row['produto_nome']}' "
                    f"vence em {row['dias_para_vencer']} dia(s) ({row['data_validade']})."
                ),
            )
            db.add(alerta)
            gerados.append(alerta.mensagem)

    db.commit()
    if not gerados:
        return {"mensagem": "Nenhum lote próximo do vencimento encontrado."}
    return {"alertas_gerados": gerados}


@app.get("/alertas/validade", tags=["Alertas"])
def listar_alertas_validade(apenas_nao_lidos: bool = True, db: Session = Depends(get_db)):
    q = db.query(AlertaValidade)
    if apenas_nao_lidos:
        q = q.filter(AlertaValidade.lido == 0)
    return q.order_by(AlertaValidade.data_alerta.desc()).all()


@app.get("/alertas/estoque", tags=["Alertas"])
def listar_alertas_estoque(apenas_nao_lidos: bool = True, db: Session = Depends(get_db)):
    q = db.query(AlertaEstoqueMinimo)
    if apenas_nao_lidos:
        q = q.filter(AlertaEstoqueMinimo.lido == 0)
    return q.order_by(AlertaEstoqueMinimo.data_alerta.desc()).all()


@app.patch("/alertas/validade/{alerta_id}/lido", tags=["Alertas"])
def marcar_alerta_validade_lido(alerta_id: str, db: Session = Depends(get_db)):
    a = db.get(AlertaValidade, alerta_id)
    if not a:
        raise HTTPException(404, "Alerta não encontrado.")
    a.lido = 1
    db.commit()
    return {"mensagem": "Alerta marcado como lido."}


@app.patch("/alertas/estoque/{alerta_id}/lido", tags=["Alertas"])
def marcar_alerta_estoque_lido(alerta_id: str, db: Session = Depends(get_db)):
    a = db.get(AlertaEstoqueMinimo, alerta_id)
    if not a:
        raise HTTPException(404, "Alerta não encontrado.")
    a.lido = 1
    db.commit()
    return {"mensagem": "Alerta marcado como lido."}


# ══════════════════════════════════════════════════════════════
# ESTOQUE  (view)
# ══════════════════════════════════════════════════════════════
@app.get("/estoque/", tags=["Estoque"])
def consultar_estoque(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM vw_estoque")).mappings().all()
    return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════
# FECHAMENTO DE CAIXA  (RF11)
# ══════════════════════════════════════════════════════════════
@app.post("/relatorios/fechamento-caixa", status_code=201, tags=["Relatórios"])
def gerar_fechamento_caixa(dia: date = None, db: Session = Depends(get_db)):
    """RF11 – consolida vendas e pagamentos do dia."""
    dia = dia or date.today()

    vendas_dia = (
        db.query(Venda)
        .filter(Venda.data_hora >= datetime.combine(dia, datetime.min.time()),
                Venda.data_hora < datetime.combine(dia, datetime.max.time()))
        .all()
    )
    if not vendas_dia:
        return {"mensagem": "Nenhuma venda registrada no período."}

    ids = [v.id for v in vendas_dia]
    pgs = (
        db.query(Pagamento)
        .filter(Pagamento.venda_id.in_(ids))
        .all()
    )

    totais = {m: Decimal("0") for m in ["DINHEIRO", "PIX", "CARTAO", "FATURADO"]}
    for pg in pgs:
        totais[pg.metodo] = totais[pg.metodo] + pg.valor

    total_vendas = sum(v.total_bruto for v in vendas_dia)
    lucro_bruto  = sum(v.lucro_bruto for v in vendas_dia)

    # upsert
    fc = db.query(FechamentoCaixa).filter(FechamentoCaixa.data == dia).first()
    if not fc:
        fc = FechamentoCaixa(data=dia)
        db.add(fc)

    fc.total_vendas   = total_vendas
    fc.total_dinheiro = totais["DINHEIRO"]
    fc.total_pix      = totais["PIX"]
    fc.total_cartao   = totais["CARTAO"]
    fc.total_faturado = totais["FATURADO"]
    fc.lucro_bruto    = lucro_bruto
    db.commit()

    return {
        "data": str(dia),
        "total_vendas":   float(total_vendas),
        "total_dinheiro": float(totais["DINHEIRO"]),
        "total_pix":      float(totais["PIX"]),
        "total_cartao":   float(totais["CARTAO"]),
        "total_faturado": float(totais["FATURADO"]),
        "lucro_bruto":    float(lucro_bruto),
    }


# ══════════════════════════════════════════════════════════════
# RELATÓRIO DE LUCRO BRUTO  (RF12)
# ══════════════════════════════════════════════════════════════
@app.get("/relatorios/lucro-bruto", tags=["Relatórios"])
def relatorio_lucro_bruto(
    data_inicio: date, data_fim: date, db: Session = Depends(get_db),
):
    """RF12 – lucro bruto = soma(preco_venda) – soma(preco_custo) no período."""
    vendas = (
        db.query(Venda)
        .filter(Venda.data_hora >= datetime.combine(data_inicio, datetime.min.time()),
                Venda.data_hora <= datetime.combine(data_fim,    datetime.max.time()))
        .all()
    )
    if not vendas:
        return {"mensagem": "Nenhuma venda encontrada no período informado."}

    total_vendas = sum(v.total_bruto for v in vendas)
    total_custo  = sum(v.total_custo  for v in vendas)
    lucro_bruto  = total_vendas - total_custo

    return {
        "data_inicio":   str(data_inicio),
        "data_fim":      str(data_fim),
        "total_vendas":  float(total_vendas),
        "total_custo":   float(total_custo),
        "lucro_bruto":   float(lucro_bruto),
        "num_vendas":    len(vendas),
    }


# ══════════════════════════════════════════════════════════════
# CURVA ABC  (RF13)
# Classe A ≤ 80% do faturamento | B: 80-95% | C: demais
# ══════════════════════════════════════════════════════════════
@app.get("/relatorios/curva-abc", tags=["Relatórios"])
def relatorio_curva_abc(
    data_inicio: date, data_fim: date, db: Session = Depends(get_db),
):
    """RF13 – classifica produtos por faturamento acumulado."""
    rows = db.execute(text("""
        SELECT
            p.id                            AS produto_id,
            p.nome                          AS produto_nome,
            SUM(iv.quantidade)              AS quantidade_vendida,
            SUM(iv.quantidade * iv.preco_unitario) AS faturamento_total
        FROM itens_venda iv
        JOIN vendas   v ON v.id = iv.venda_id
        JOIN produtos p ON p.id = iv.produto_id
        WHERE v.data_hora BETWEEN :inicio AND :fim
        GROUP BY p.id, p.nome
        ORDER BY faturamento_total DESC
    """), {
        "inicio": datetime.combine(data_inicio, datetime.min.time()),
        "fim":    datetime.combine(data_fim,    datetime.max.time()),
    }).mappings().all()

    if not rows:
        return {"mensagem": "Nenhuma venda encontrada no período informado."}

    faturamento_total = sum(r["faturamento_total"] for r in rows)
    resultado, acumulado = [], Decimal("0")

    for r in rows:
        acumulado += r["faturamento_total"]
        pct = (acumulado / faturamento_total) * 100
        classe = "A" if pct <= 80 else "B" if pct <= 95 else "C"
        resultado.append({
            "produto_id":         r["produto_id"],
            "produto_nome":       r["produto_nome"],
            "quantidade_vendida": r["quantidade_vendida"],
            "faturamento_total":  float(r["faturamento_total"]),
            "percentual_acumulado": float(round(pct, 2)),
            "classe":             classe,
        })

    return {
        "data_inicio": str(data_inicio),
        "data_fim":    str(data_fim),
        "itens":       resultado,
    }