from sqlalchemy import Column, Integer, String, Boolean

from app.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(150), nullable=False)

    cpf = Column(String(14), unique=True)

    telefone = Column(String(20))

    email = Column(String(150))

    endereco = Column(String(255))

    ativo = Column(Boolean, default=True)