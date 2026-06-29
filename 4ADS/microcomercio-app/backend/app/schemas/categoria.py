from pydantic import BaseModel

class CategoriaCreate(BaseModel):
    nome: str
    descricao: str | None = None

class CategoriaResponse(CategoriaCreate):
    id: int

    class Config:
        from_attributes = True