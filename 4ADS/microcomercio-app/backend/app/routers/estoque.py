from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.produto import Produto
from app.models.movimentacao import MovimentacaoEstoque
from app.schemas.movimentacao import MovimentacaoCreate

router = APIRouter(prefix="/estoque", tags=["Estoque"])


@router.post("/entrada")
def entrada_estoque(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db)
):
    produto = db.query(Produto).filter(
        Produto.id == dados.produto_id
    ).first()

    if not produto:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    produto.estoque_atual += dados.quantidade

    mov = MovimentacaoEstoque(
        produto_id=dados.produto_id,
        tipo="ENTRADA",
        quantidade=dados.quantidade,
        observacao=dados.observacao
    )

    db.add(mov)
    db.commit()

    return {"message": "Entrada registrada"}


@router.post("/saida")
def saida_estoque(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db)
):
    produto = db.query(Produto).filter(
        Produto.id == dados.produto_id
    ).first()

    if not produto:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    if produto.estoque_atual < dados.quantidade:
        raise HTTPException(
            status_code=400,
            detail="Estoque insuficiente"
        )

    produto.estoque_atual -= dados.quantidade

    mov = MovimentacaoEstoque(
        produto_id=dados.produto_id,
        tipo="SAIDA",
        quantidade=dados.quantidade,
        observacao=dados.observacao
    )

    db.add(mov)
    db.commit()

    return {"message": "Saída registrada"}