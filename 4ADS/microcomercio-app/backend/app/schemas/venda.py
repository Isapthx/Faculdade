from pydantic import BaseModel

class ItemVendaCreate(BaseModel):
    produto_id: int
    quantidade: int
    preco_unitario: float

class VendaCreate(BaseModel):
    cliente_id: int | None = None
    itens: list[ItemVendaCreate]

class RemoverItemVenda(BaseModel):
    quantidade: int