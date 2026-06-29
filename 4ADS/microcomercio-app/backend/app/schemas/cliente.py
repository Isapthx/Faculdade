from pydantic import BaseModel
from typing import Optional

class ClienteCreate(BaseModel):
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None


class ClienteResponse(ClienteCreate):
    id: int
    ativo: bool

    class Config:
        from_attributes = True