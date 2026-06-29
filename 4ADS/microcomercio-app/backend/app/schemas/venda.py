from pydantic import BaseModel

class VendaCreate(BaseModel):
    usuario_id: int
    cliente_id: int | None = None
    forma_pagamento: str


class ItemVendaCreate(BaseModel):
    produto_id: int
    quantidade: int

class RemoverItemVenda(BaseModel):
    quantidade: int