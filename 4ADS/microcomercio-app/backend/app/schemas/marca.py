from pydantic import BaseModel

class MarcaCreate(BaseModel):
    nome: str

class MarcaResponse(MarcaCreate):
    id: int

    class Config:
        from_attributes = True