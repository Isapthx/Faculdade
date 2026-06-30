from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    codigo_barras = Column(String, unique=True)
    preco_compra = Column(Float)
    preco_venda = Column(Float)
    estoque_atual = Column(Integer, default=0)
    estoque_minimo = Column(Integer, default=0)  # novo
    ativo = Column(Boolean, default=True)

    marca_id = Column(Integer, ForeignKey("marcas.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))

    marca = relationship("Marca", back_populates="produtos")
    categoria = relationship("Categoria")