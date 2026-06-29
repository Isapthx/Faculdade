from pydantic import BaseModel

class MovimentacaoCreate(BaseModel):
    produto_id: int
    quantidade: int
    observacao: str | None = None