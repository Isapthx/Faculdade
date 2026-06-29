from http.client import HTTPException

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.post("/")
def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db)
):
    novo = Produto(
        **produto.model_dump()
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo

@router.put("/{produto_id}")
def atualizar_produto(
    produto_id: int,
    dados: ProdutoCreate,
    db: Session = Depends(get_db)
):
    produto = db.query(Produto).filter(
        Produto.id == produto_id
    ).first()

    if not produto:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    produto.nome = dados.nome
    produto.descricao = dados.descricao
    produto.codigo_barras = dados.codigo_barras
    produto.preco_compra = dados.preco_compra
    produto.preco_venda = dados.preco_venda
    produto.categoria_id = dados.categoria_id
    produto.marca_id = dados.marca_id

    db.commit()
    db.refresh(produto)

    return produto

@router.delete("/{produto_id}")
def desativar_produto(
    produto_id: int,
    db: Session = Depends(get_db)
):
    produto = db.query(Produto).filter(
        Produto.id == produto_id
    ).first()

    if not produto:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )

    produto.ativo = False

    db.commit()

    return {
        "message": "Produto desativado"
    }


@router.get("/")
def listar_produtos(
    db: Session = Depends(get_db)
):
    return db.query(Produto).filter(
        Produto.ativo == True
    ).all()