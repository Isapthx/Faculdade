from fastapi import APIRouter, Depends, HTTPException  # atualiza o import
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.post("/")
def criar_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    nova = Categoria(**categoria.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.get("/")
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

@router.put("/{categoria_id}")
def atualizar_categoria(categoria_id: int, dados: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    categoria.nome = dados.nome
    categoria.descricao = dados.descricao
    db.commit()
    db.refresh(categoria)
    return categoria

@router.delete("/{categoria_id}")
def deletar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    db.delete(categoria)
    db.commit()
    return {"message": "Categoria excluída"}