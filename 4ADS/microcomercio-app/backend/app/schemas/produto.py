from pydantic import BaseModel

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str
    codigo_barras: str

    preco_compra: float
    preco_venda: float

    categoria_id: int
    marca_id: int

class ProdutoResponse(ProdutoCreate):
    id: int
    estoque_atual: int
    ativo: bool

    class Config:
        from_attributes = True