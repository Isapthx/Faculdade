from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.marca import Marca
from app.schemas.marca import MarcaCreate, MarcaResponse
from app.models.produto import Produto

router = APIRouter(
    prefix="/marcas",
    tags=["Marcas"]
)

@router.post("/", response_model=MarcaResponse)
def criar_marca(marca: MarcaCreate, db: Session = Depends(get_db)):
    nova_marca = Marca(nome=marca.nome)

    db.add(nova_marca)
    db.commit()
    db.refresh(nova_marca)

    return nova_marca

@router.get("/", response_model=list[MarcaResponse])
def listar_marcas(db: Session = Depends(get_db)):
    return db.query(Marca).all()

@router.put("/{marca_id}")
def atualizar_marca(
    marca_id: int,
    dados: MarcaCreate,
    db: Session = Depends(get_db)
):
    marca = db.query(Marca).filter(Marca.id == marca_id).first()

    if not marca:
        raise HTTPException(
            status_code=404,
            detail="Marca não encontrada."
        )

    # Verifica se já existe outra marca com o mesmo nome
    marca_existente = (
        db.query(Marca)
        .filter(
            Marca.nome == dados.nome,
            Marca.id != marca_id
        )
        .first()
    )

    if marca_existente:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma marca com esse nome."
        )

    marca.nome = dados.nome

    db.commit()
    db.refresh(marca)

    return {
        "mensagem": "Marca atualizada com sucesso.",
        "marca": marca
    }


# ============================
# REMOVER MARCA
# ============================

@router.delete("/{marca_id}")
def deletar_marca(
    marca_id: int,
    db: Session = Depends(get_db)
):
    marca = db.query(Marca).filter(Marca.id == marca_id).first()

    if not marca:
        raise HTTPException(
            status_code=404,
            detail="Marca não encontrada."
        )

    produto = (
        db.query(Produto)
        .filter(Produto.marca_id == marca_id)
        .first()
    )

    if produto:
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir uma marca vinculada a produtos."
        )
    db.delete(marca)
    db.commit()

    return {
        "mensagem": "Marca removida com sucesso."
    }