from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import (
    ClienteCreate,
    ClienteResponse
)

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.post("/", response_model=ClienteResponse)
def criar_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db)
):

    if cliente.cpf:

        existe = db.query(Cliente).filter(
            Cliente.cpf == cliente.cpf
        ).first()

        if existe:
            raise HTTPException(
                status_code=400,
                detail="CPF já cadastrado"
            )

    novo_cliente = Cliente(**cliente.dict())

    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    return novo_cliente

@router.get("/", response_model=list[ClienteResponse])
def listar_clientes(
    db: Session = Depends(get_db)
):
    return db.query(Cliente).all()

@router.get("/{cliente_id}",
response_model=ClienteResponse)
def buscar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):

    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id
    ).first()

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente não encontrado"
        )

    return cliente

@router.put("/{cliente_id}")
def atualizar_cliente(
    cliente_id: int,
    dados: ClienteCreate,
    db: Session = Depends(get_db)
):

    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id
    ).first()

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente não encontrado"
        )

    for campo, valor in dados.dict().items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)

    return cliente

@router.delete("/{cliente_id}")
def excluir_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):

    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id
    ).first()

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente não encontrado"
        )

    db.delete(cliente)
    db.commit()

    return {
        "message": "Cliente removido"
    }