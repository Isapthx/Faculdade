from fastapi import APIRouter, Depends, HTTPException

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.movimentacao import MovimentacaoEstoque
from app.database import get_db
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.post("/")
def criar_produto(produto: ProdutoCreate, db: Session = Depends(get_db)):
    novo = Produto(
        nome=produto.nome,
        descricao=produto.descricao,
        codigo_barras=produto.codigo_barras,
        preco_compra=produto.preco_compra,
        preco_venda=produto.preco_venda or produto.preco,  # aceita os dois
        categoria_id=produto.categoria_id,
        marca_id=produto.marca_id,
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
    produto.preco_venda = dados.preco_venda or dados.preco
    produto.categoria_id = dados.categoria_id
    produto.marca_id = dados.marca_id

    db.commit()
    db.refresh(produto)

    return produto
@router.delete("/{produto_id}")
def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # deleta movimentações de estoque vinculadas primeiro (FK)
    db.query(MovimentacaoEstoque).filter(
        MovimentacaoEstoque.produto_id == produto_id
    ).delete()

    db.delete(produto)
    db.commit()
    return {"message": "Produto excluído"}

@router.get("/")
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).filter(Produto.ativo == True).all()
    
    result = []
    for p in produtos:
        result.append({
            "id": p.id,
            "nome": p.nome,
            "descricao": p.descricao,
            "codigo_barras": p.codigo_barras,
            "preco": p.preco_venda,        
            "preco_venda": p.preco_venda,
            "preco_compra": p.preco_compra,
            "estoque_atual": p.estoque_atual,
            "ativo": p.ativo,
            "categoria_id": p.categoria_id,
            "marca_id": p.marca_id,
            "categoria_nome": p.categoria.nome if p.categoria else None,
            "marca_nome": p.marca.nome if p.marca else None,
        })
    
    return result