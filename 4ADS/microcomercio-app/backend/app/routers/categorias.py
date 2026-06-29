from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("/")
def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db)
):
    nova = Categoria(**categoria.model_dump())

    db.add(nova)
    db.commit()
    db.refresh(nova)

    return nova


@router.get("/")
def listar_categorias(
    db: Session = Depends(get_db)
):
    return db.query(Categoria).all()