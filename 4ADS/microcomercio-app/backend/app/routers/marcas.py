from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.marca import Marca
from app.schemas.marca import MarcaCreate, MarcaResponse

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