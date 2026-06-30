from pydantic import BaseModel

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None = None
    codigo_barras: str | None = None
    preco_compra: float | None = None
    preco_venda: float | None = None
    preco: float | None = None
    estoque_minimo: int | None = 0  # novo
    categoria_id: int
    marca_id: int

class ProdutoResponse(ProdutoCreate):
    id: int
    estoque_atual: int
    ativo: bool

    class Config:
        from_attributes = True