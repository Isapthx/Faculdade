from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.produto import Produto
from app.models.movimentacao import MovimentacaoEstoque
from app.schemas.movimentacao import MovimentacaoCreate

router = APIRouter(prefix="/estoque", tags=["Estoque"])

@router.get("/")
def listar_estoque(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()
    return [{
        "produto_id": p.id,
        "produto_nome": p.nome,
        "quantidade": p.estoque_atual,
        "quantidade_minima": p.estoque_minimo,
        "ativo": p.ativo,
    } for p in produtos]

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

@router.put("/{produto_id}")
def ajustar_estoque(produto_id: int, dados: dict, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    quantidade_anterior = produto.estoque_atual
    produto.estoque_atual = dados["quantidade"]

    # registra a movimentação
    diferenca = dados["quantidade"] - quantidade_anterior
    if diferenca != 0:
        mov = MovimentacaoEstoque(
            produto_id=produto_id,
            tipo="AJUSTE",
            quantidade=abs(diferenca),
            observacao=dados.get("observacao", f"Ajuste manual: {quantidade_anterior} → {dados['quantidade']}")
        )
        db.add(mov)

    db.commit()
    db.refresh(produto)
    return {"produto_id": produto.id, "produto_nome": produto.nome, "quantidade": produto.estoque_atual}


@router.delete("/{produto_id}")
def remover_do_estoque(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    produto.estoque_atual = 0

    mov = MovimentacaoEstoque(
        produto_id=produto_id,
        tipo="AJUSTE",
        quantidade=0,
        observacao="Produto removido do estoque manualmente"
    )
    db.add(mov)
    db.commit()
    return {"message": "Produto removido do estoque"}