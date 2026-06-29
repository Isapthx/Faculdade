from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes_estoque"

    id = Column(Integer, primary_key=True, index=True)

    produto_id = Column(Integer, ForeignKey("produtos.id"))

    tipo = Column(String)
    quantidade = Column(Integer)

    observacao = Column(String)

    data_movimentacao = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )