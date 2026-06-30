from pydantic import BaseModel
from typing import Literal

FORMAS_PAGAMENTO = Literal["dinheiro", "cartao", "pix"]

class ItemVendaCreate(BaseModel):
    produto_id: int
    quantidade: int
    preco_unitario: float

class VendaCreate(BaseModel):
    cliente_id: int | None = None
    forma_pagamento: FORMAS_PAGAMENTO
    itens: list[ItemVendaCreate]

# VendaUpdate agora é igual ao VendaCreate —
# edição completa exige os itens novos e a forma de pagamento
class VendaUpdate(BaseModel):
    cliente_id: int | None = None
    forma_pagamento: FORMAS_PAGAMENTO
    itens: list[ItemVendaCreate]

class RemoverItemVenda(BaseModel):
    quantidade: int