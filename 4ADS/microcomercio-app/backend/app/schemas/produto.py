from pydantic import BaseModel

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None = None
    codigo_barras: str | None = None

    preco_compra: float | None = None
    preco_venda: float | None = None
    preco: float | None = None        # front manda como "preco"

    categoria_id: int
    marca_id: int