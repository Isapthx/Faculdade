from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.venda import Venda
from app.models.item_venda import ItemVenda
from app.models.produto import Produto
from app.models.cliente import Cliente
from app.schemas.venda import VendaCreate, VendaUpdate, ItemVendaCreate, RemoverItemVenda

router = APIRouter(prefix="/vendas", tags=["Vendas"])


def _build_response(v: Venda, db: Session):
    cliente = db.query(Cliente).filter(Cliente.id == v.cliente_id).first() if v.cliente_id else None
    itens = db.query(ItemVenda).filter(ItemVenda.venda_id == v.id).all()
    return {
        "id": v.id,
        "data_venda": v.data_venda,
        "cliente_id": v.cliente_id,
        "cliente_nome": cliente.nome if cliente else None,
        "forma_pagamento": v.forma_pagamento,
        "valor_total": v.valor_total,
        "status": v.status,
        "itens": [
            {
                "id": it.id,
                "produto_id": it.produto_id,
                "quantidade": it.quantidade,
                "preco_unitario": it.preco_unitario,
                "subtotal": it.subtotal,
            }
            for it in itens
        ],
    }


@router.get("/")
def listar_vendas(db: Session = Depends(get_db)):
    vendas = db.query(Venda).all()
    return [_build_response(v, db) for v in vendas]


@router.post("/")
def criar_venda(venda: VendaCreate, db: Session = Depends(get_db)):
    if venda.cliente_id:
        if not db.query(Cliente).filter(Cliente.id == venda.cliente_id).first():
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

    nova_venda = Venda(
        cliente_id=venda.cliente_id,
        usuario_id=None,
        forma_pagamento=venda.forma_pagamento,
        valor_total=0,
    )
    db.add(nova_venda)
    db.commit()
    db.refresh(nova_venda)

    valor_total = 0
    for item in venda.itens:
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto #{item.produto_id} não encontrado")
        if not produto.ativo:
            raise HTTPException(status_code=400, detail=f"Produto {produto.nome} está inativo")
        if produto.estoque_atual < item.quantidade:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {produto.nome}")

        subtotal = item.preco_unitario * item.quantidade
        db.add(ItemVenda(
            venda_id=nova_venda.id,
            produto_id=item.produto_id,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            subtotal=subtotal,
        ))
        produto.estoque_atual -= item.quantidade
        valor_total += subtotal

    nova_venda.valor_total = valor_total
    nova_venda.status = "FINALIZADA"
    db.commit()
    db.refresh(nova_venda)
    return _build_response(nova_venda, db)


@router.put("/{venda_id}")
def editar_venda(venda_id: int, dados: VendaUpdate, db: Session = Depends(get_db)):
    """
    Edição completa: substitui cliente, forma de pagamento E todos os itens.
    O estoque dos itens antigos é devolvido e o dos novos é debitado.
    """
    venda = db.query(Venda).filter(Venda.id == venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    # Valida cliente novo
    if dados.cliente_id:
        if not db.query(Cliente).filter(Cliente.id == dados.cliente_id).first():
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

    # Valida itens novos antes de mexer em qualquer coisa
    produtos_novos = []
    for item in dados.itens:
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto #{item.produto_id} não encontrado")
        if not produto.ativo:
            raise HTTPException(status_code=400, detail=f"Produto {produto.nome} está inativo")
        produtos_novos.append((item, produto))

    # 1. Devolve estoque dos itens antigos
    itens_antigos = db.query(ItemVenda).filter(ItemVenda.venda_id == venda_id).all()
    for it in itens_antigos:
        produto = db.query(Produto).filter(Produto.id == it.produto_id).first()
        if produto:
            produto.estoque_atual += it.quantidade
        db.delete(it)
    db.flush()

    # 2. Verifica estoque suficiente para os novos itens
    for item, produto in produtos_novos:
        if produto.estoque_atual < item.quantidade:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {produto.nome}")

    # 3. Insere itens novos e debita estoque
    valor_total = 0
    for item, produto in produtos_novos:
        subtotal = item.preco_unitario * item.quantidade
        db.add(ItemVenda(
            venda_id=venda_id,
            produto_id=item.produto_id,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            subtotal=subtotal,
        ))
        produto.estoque_atual -= item.quantidade
        valor_total += subtotal

    # 4. Atualiza cabeçalho da venda
    venda.cliente_id = dados.cliente_id if dados.cliente_id else None
    venda.forma_pagamento = dados.forma_pagamento
    venda.valor_total = valor_total

    db.commit()
    db.refresh(venda)
    return _build_response(venda, db)


@router.get("/{venda_id}/itens")
def listar_itens_venda(venda_id: int, db: Session = Depends(get_db)):
    return db.query(ItemVenda).filter(ItemVenda.venda_id == venda_id).all()


@router.post("/{venda_id}/itens")
def adicionar_item(venda_id: int, item: ItemVendaCreate, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if not produto.ativo:
        raise HTTPException(status_code=400, detail="Produto inativo")

    subtotal = produto.preco_venda * item.quantidade
    db.add(ItemVenda(
        venda_id=venda_id,
        produto_id=item.produto_id,
        quantidade=item.quantidade,
        preco_unitario=produto.preco_venda,
        subtotal=subtotal,
    ))
    venda = db.query(Venda).get(venda_id)
    venda.valor_total += subtotal
    db.commit()
    return {"message": "Item adicionado"}


@router.patch("/{venda_id}/itens/{item_id}/remover")
def remover_quantidade_item(venda_id: int, item_id: int, dados: RemoverItemVenda, db: Session = Depends(get_db)):
    venda = db.query(Venda).filter(Venda.id == venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    if venda.status == "FINALIZADA":
        raise HTTPException(status_code=400, detail="Venda já finalizada")

    item = db.query(ItemVenda).filter(ItemVenda.id == item_id, ItemVenda.venda_id == venda_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    if dados.quantidade <= 0:
        raise HTTPException(status_code=400, detail="Quantidade deve ser maior que zero")

    if dados.quantidade >= item.quantidade:
        venda.valor_total -= item.subtotal
        db.delete(item)
    else:
        item.quantidade -= dados.quantidade
        item.subtotal = item.quantidade * item.preco_unitario
        venda.valor_total = sum(i.subtotal for i in db.query(ItemVenda).filter(ItemVenda.venda_id == venda_id).all())

    db.commit()
    db.refresh(venda)
    return {"message": "Item atualizado", "valor_total": venda.valor_total}


@router.post("/{venda_id}/finalizar")
def finalizar_venda(venda_id: int, db: Session = Depends(get_db)):
    venda = db.query(Venda).filter(Venda.id == venda_id).first()
    if not venda:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    for item in db.query(ItemVenda).filter(ItemVenda.venda_id == venda_id).all():
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if produto.estoque_atual < item.quantidade:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {produto.nome}")
        produto.estoque_atual -= item.quantidade

    venda.status = "FINALIZADA"
    db.commit()
    return {"message": "Venda finalizada com sucesso"}