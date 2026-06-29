from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.venda import Venda
from app.models.produto import Produto
from app.models.item_venda import ItemVenda

router = APIRouter(
    prefix="/relatorios",
    tags=["Relatórios"]
)

@router.get("/vendas")
def relatorio_vendas(
    inicio: date,
    fim: date,
    db: Session = Depends(get_db)
):

    vendas = db.query(Venda).filter(
        func.date(Venda.data_venda) >= inicio,
        func.date(Venda.data_venda) <= fim
    ).all()

    total = sum(v.valor_total for v in vendas)

    return {
        "periodo": {
            "inicio": inicio,
            "fim": fim
        },
        "quantidade_vendas": len(vendas),
        "valor_total": total,
        "vendas": vendas
    }

# @router.get("/compras")
# def relatorio_compras(
#     inicio: date,
#     fim: date,
#     db: Session = Depends(get_db)
# ):

#     compras = db.query(Compra).filter(
#         func.date(Compra.data_compra) >= inicio,
#         func.date(Compra.data_compra) <= fim
#     ).all()

#     total = sum(c.valor_total for c in compras)

#     return {
#         "quantidade": len(compras),
#         "valor_total": total,
#         "compras": compras
#     }

@router.get("/estoque")
def estoque(
    db: Session = Depends(get_db)
):

    produtos = db.query(Produto).all()

    return produtos

@router.get("/estoque-baixo")
def estoque_baixo(
    db: Session = Depends(get_db)
):

    return db.query(Produto).filter(
        Produto.estoque_atual <= 5
    ).all()

@router.get("/sem-estoque")
def sem_estoque(
    db: Session = Depends(get_db)
):

    return db.query(Produto).filter(
        Produto.estoque_atual == 0
    ).all()

@router.get("/produtos-mais-vendidos")
def produtos_mais_vendidos(
    db: Session = Depends(get_db)
):

    resultado = (
        db.query(
            Produto.nome,
            func.sum(ItemVenda.quantidade).label("quantidade")
        )
        .join(
            ItemVenda,
            Produto.id == ItemVenda.produto_id
        )
        .group_by(Produto.nome)
        .order_by(
            func.sum(ItemVenda.quantidade).desc()
        )
        .all()
    )

    return resultado

@router.get("/faturamento-mensal")
def faturamento_mensal(
    db: Session = Depends(get_db)
):

    resultado = (
        db.query(
            func.extract("month", Venda.data_venda).label("mes"),
            func.sum(Venda.valor_total).label("total")
        )
        .group_by(
            func.extract("month", Venda.data_venda)
        )
        .order_by(
            func.extract("month", Venda.data_venda)
        )
        .all()
    )

    return resultado