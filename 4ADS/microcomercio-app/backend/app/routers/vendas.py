from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.venda import Venda
from app.models.item_venda import ItemVenda
from app.models.produto import Produto
from app.models.usuario import Usuario
from app.models.cliente import Cliente

from app.schemas.venda import (
    VendaCreate,
    ItemVendaCreate,
    RemoverItemVenda
)

router = APIRouter(
    prefix="/vendas",
    tags=["Vendas"]
)

@router.post("/")
def criar_venda(
    venda: VendaCreate,
    db: Session = Depends(get_db)
):

    usuario = db.query(Usuario).filter(
        Usuario.id == venda.usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    if venda.cliente_id:

        cliente = db.query(Cliente).filter(
            Cliente.id == venda.cliente_id
        ).first()

        if not cliente:
            raise HTTPException(
                status_code=404,
                detail="Cliente não encontrado"
            )

    nova_venda = Venda(
        usuario_id=venda.usuario_id,
        cliente_id=venda.cliente_id,
        forma_pagamento=venda.forma_pagamento
    )

    db.add(nova_venda)
    db.commit()
    db.refresh(nova_venda)

    return nova_venda

@router.post("/{venda_id}/itens")
def adicionar_item(
    venda_id: int,
    item: ItemVendaCreate,
    db: Session = Depends(get_db)
):

    produto = db.query(Produto).filter(
        Produto.id == item.produto_id
    ).first()

    if not produto:
        raise HTTPException(
            status_code=404,
            detail="Produto não encontrado"
        )
    
    if not produto.ativo:
        raise HTTPException(
            status_code=400,
            detail="Produto inativo"
        )


    subtotal = (
        produto.preco_venda *
        item.quantidade
    )

    novo_item = ItemVenda(
        venda_id=venda_id,
        produto_id=item.produto_id,
        quantidade=item.quantidade,
        preco_unitario=produto.preco_venda,
        subtotal=subtotal
    )

    db.add(novo_item)

    venda = db.query(Venda).get(venda_id)

    venda.valor_total += subtotal

    db.commit()

    return {
        "message": "Item adicionado"
    }

@router.patch("/{venda_id}/itens/{item_id}/remover")
def remover_quantidade_item(
    venda_id: int,
    item_id: int,
    dados: RemoverItemVenda,
    db: Session = Depends(get_db)
):
    venda = db.query(Venda).filter(
        Venda.id == venda_id
    ).first()

    if not venda:
        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada"
        )

    if venda.status == "FINALIZADA":
        raise HTTPException(
            status_code=400,
            detail="Venda já finalizada"
        )

    item = db.query(ItemVenda).filter(
        ItemVenda.id == item_id,
        ItemVenda.venda_id == venda_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item não encontrado"
        )

    if dados.quantidade <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantidade deve ser maior que zero"
        )

    # Remove tudo se a quantidade informada for igual ou maior
    if dados.quantidade >= item.quantidade:

        venda.valor_total -= item.subtotal

        db.delete(item)

    else:

        item.quantidade -= dados.quantidade

        item.subtotal = (
            item.quantidade *
            item.preco_unitario
        )

        itens = db.query(ItemVenda).filter(
            ItemVenda.venda_id == venda_id
        ).all()

        venda.valor_total = sum(
            i.subtotal for i in itens
        )

    db.commit()
    db.refresh(venda)

    return {
        "message": "Item atualizado",
        "valor_total": venda.valor_total
    }

@router.get("/{venda_id}/itens")
def listar_itens_venda(
    venda_id: int,
    db: Session = Depends(get_db)
):
    return db.query(ItemVenda).filter(
        ItemVenda.venda_id == venda_id
    ).all()

@router.post("/{venda_id}/finalizar")
def finalizar_venda(
    venda_id: int,
    db: Session = Depends(get_db)
):

    venda = db.query(Venda).filter(
        Venda.id == venda_id
    ).first()

    if not venda:
        raise HTTPException(
            status_code=404,
            detail="Venda não encontrada"
        )

    itens = db.query(ItemVenda).filter(
        ItemVenda.venda_id == venda_id
    ).all()

    for item in itens:

        produto = db.query(Produto).filter(
            Produto.id == item.produto_id
        ).first()

        if produto.estoque_atual < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para {produto.nome}"
            )

        produto.estoque_atual -= item.quantidade

    venda.status = "FINALIZADA"

    db.commit()

    return {
        "message": "Venda finalizada com sucesso"
    }

@router.get("/")
def listar_vendas(
    db: Session = Depends(get_db)
):
    return db.query(Venda).all()

@router.get("/{venda_id}")
def buscar_venda(
    venda_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Venda).filter(
        Venda.id == venda_id
    ).first()

