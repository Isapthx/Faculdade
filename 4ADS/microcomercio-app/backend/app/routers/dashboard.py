from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.database import get_db
from app.models.produto import Produto
from app.models.cliente import Cliente
from app.models.venda import Venda

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def dashboard(db: Session = Depends(get_db)):
    total_produtos = db.query(Produto).count()
    produtos_ativos = db.query(Produto).filter(Produto.ativo == True).count()
    total_clientes = db.query(Cliente).count()
    vendas_hoje = db.query(Venda).filter(
        func.date(Venda.data_venda) == date.today()
    ).count()
    faturamento_hoje = db.query(
        func.coalesce(func.sum(Venda.valor_total), 0)
    ).filter(func.date(Venda.data_venda) == date.today()).scalar()
    estoque_baixo = db.query(Produto).filter(
        Produto.estoque_atual <= 5, Produto.ativo == True
    ).count()
    total_vendas = db.query(Venda).count()
    faturamento_total = db.query(
        func.coalesce(func.sum(Venda.valor_total), 0)
    ).scalar()
    produtos_sem_estoque = db.query(Produto).filter(
        Produto.estoque_atual == 0
    ).count()

    return {
        "total_produtos": total_produtos,
        "produtos_ativos": produtos_ativos,
        "produtos_sem_estoque": produtos_sem_estoque,
        "produtos_estoque_baixo": estoque_baixo,
        "total_clientes": total_clientes,
        "total_vendas": total_vendas,
        "vendas_hoje": vendas_hoje,
        "faturamento_total": faturamento_total,
        "faturamento_hoje": faturamento_hoje,
    }